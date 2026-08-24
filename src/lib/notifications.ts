// Device-level notifications via a service worker so alerts land in the
// phone/desktop notification centre (and survive the tab being backgrounded
// or the app being closed entirely).
//
// Delivery model:
//  - The service worker persists every enabled reminder (kind + time) in
//    IndexedDB and runs "due checks": anything whose time has passed today
//    and hasn't fired yet is delivered immediately, wherever the wake-up came
//    from (app open, periodic background sync, push, or its own timer).
//  - Periodic Background Sync lets the browser wake the worker ~once/day even
//    when the installed PWA is fully closed (Chromium).
//  - Every delivery is mirrored into an IndexedDB outbox by the worker and
//    merged into the in-app notification centre here.

import { getDailyContent } from "./dailyContent";
import { getReadingForDay, currentPlanDay } from "./readingPlan";
import { getSettings } from "./settingsStore";
import { getOutboxEntries, deleteOutboxKey, type OutboxItem } from "./swDb";

export type ReminderKind = "devotion" | "word" | "scripture" | "reading";

export interface ReminderContent { title: string; body: string; url: string }

export const REMINDER_CONTENT: Record<ReminderKind, ReminderContent> = {
  devotion: {
    title: "Devotly · Your quiet moment awaits 🌿✨",
    body: "Come, rest in His presence — today’s devotional is ready for you.",
    url: "/generate",
  },
  word: {
    title: "Devotly · Word of the Day ✨ — tap to reveal",
    body: "A fresh, Spirit-breathed word to carry through your day.",
    url: "/?preview=word",
  },
  scripture: {
    title: "Devotly · Scripture of the Day 📖 — tap to behold",
    body: "A living verse is waiting — open to read, reflect, and be renewed.",
    url: "/?preview=scripture",
  },
  reading: {
    title: "Devotly · Bible in a Year 📚 — Day’s journey ready",
    body: "Your chapters for today are ready — continue the story.",
    url: "/reading-plan",
  },
};

const PERIODIC_SYNC_TAG = "devotly-reminders";
const fallbackTimers: Partial<Record<ReminderKind, number>> = {};
let swReady: Promise<ServiceWorkerRegistration | null> | null = null;
let tickerStarted = false;
let configSent = false;

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return "denied";
  return Notification.permission;
}

/** Register the notification service worker (safe to call repeatedly). */
export function registerNotificationWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return Promise.resolve(null);
  if (!swReady) {
    swReady = navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .catch(() => null);
  }
  return swReady;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  await registerNotificationWorker();
  if (Notification.permission === "granted") return "granted";
  return await Notification.requestPermission();
}

async function postToWorker(message: Record<string, unknown>) {
  const reg = await registerNotificationWorker();
  const worker = reg?.active ?? navigator.serviceWorker?.controller ?? null;
  if (!worker) return false;
  worker.postMessage(message);
  return true;
}

/**
 * Give the worker what it needs to fetch fresh Word/Scripture content on its
 * own once the app is closed (plain fetch to the edge function).
 */
async function ensureWorkerConfig(force = false) {
  if (configSent && !force) return;
  try {
    const sent = await postToWorker({
      type: "SET_CONFIG",
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      bibleTranslation: getSettings().bibleTranslation,
    });
    if (sent) configSent = true;
  } catch { /* worker will fall back to generic copy */ }
}

export async function showNotification(title: string, body: string, url = "/", tag = "devotly") {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  // Save to in-app inbox for preview + My Library
  try {
    const { addToInbox } = await import("./notificationInbox");
    const kind: ReminderKind = tag.includes("word") ? "word" : tag.includes("scripture") ? "scripture" : tag.includes("reading") ? "reading" : "devotion";
    addToInbox({ kind, title, body, url });
    // also persist word/scripture of the day to library via localStorage for My Library tabs
    if (kind === "word" || kind === "scripture") {
      const daily = await getDailyContent().catch(() => null);
      if (daily) {
        try {
          const key = kind === "word" ? "devotly_library_words" : "devotly_library_daily_scriptures";
          const raw = localStorage.getItem(key);
          const arr = raw ? JSON.parse(raw) : [];
          const entry = kind === "word" ? { id: Date.now().toString(), ...daily.word, date: daily.date } : { id: Date.now().toString(), ...daily.scripture, date: daily.date };
          // dedupe by date
          if (!arr.find((x: { date?: string }) => x.date === daily.date)) {
            arr.unshift(entry);
            localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
          }
        } catch { /* ignore malformed library cache */ }
      }
    }
  } catch { /* inbox unavailable — notification still shows */ }
  const reg = await registerNotificationWorker();
  if (reg) {
    await reg.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag,
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      image: "/icon-512.png",
      actions: [
        { action: "open", title: "✨ Preview" },
        { action: "dismiss", title: "Later" },
      ],
      data: { url },
    });
    return;
  }
  try { new Notification(title, { body, icon: "/icon-192.png" }); } catch { /* ignore */ }
}

/**
 * Build the real content for a reminder — the Word of the Day and Scripture of
 * the Day carry today's actual word/verse rather than a generic nudge.
 */
export async function buildReminderContent(kind: ReminderKind): Promise<ReminderContent> {
  const base = REMINDER_CONTENT[kind];
  try {
    if (kind === "word" || kind === "scripture") {
      const daily = await getDailyContent();
      if (!daily) return base;
      if (kind === "word") {
        return {
          title: `Word of the Day · ${daily.word.word}`,
          body: `${daily.word.original ? `${daily.word.original} (${daily.word.transliteration}) — ` : ""}${daily.word.meaning}`,
          url: "/",
        };
      }
      return {
        title: `Scripture of the Day · ${daily.scripture.reference}`,
        body: daily.scripture.text,
        url: "/",
      };
    }
    if (kind === "reading") {
      const raw = localStorage.getItem("reading_plan_start");
      const day = currentPlanDay(raw || new Date().toISOString().slice(0, 10));
      const reading = getReadingForDay(day);
      return { title: `Bible in a Year · Day ${day}`, body: reading.all.join(", "), url: "/reading-plan" };
    }
  } catch { /* fall through to base copy */ }
  return base;
}

/** Schedule a recurring daily notification of the given kind at HH:mm (local time). */
export async function scheduleReminder(kind: ReminderKind, timeHHmm: string) {
  cancelReminder(kind);
  if (!notificationsSupported()) return;
  const [h, m] = timeHHmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return;

  await ensureWorkerConfig(true);
  const content = await buildReminderContent(kind);

  // Preferred path: the service worker owns the persistent schedule so the
  // notification is delivered by the device even when the app isn't running.
  const sent = await postToWorker({ type: "SCHEDULE_REMINDER", kind, time: timeHHmm, ...content });
  void runDueCheck(); // catch any slot already missed today at this new time

  // Fallback for browsers without an active worker.
  if (!sent) {
    const now = new Date();
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
    fallbackTimers[kind] = window.setTimeout(async () => {
      const fresh = await buildReminderContent(kind);
      await showNotification(fresh.title, fresh.body, fresh.url, `devotly-${kind}`);
      scheduleReminder(kind, timeHHmm);
    }, next.getTime() - now.getTime());
  }
}

export function cancelReminder(kind: ReminderKind) {
  const timer = fallbackTimers[kind];
  if (timer != null) {
    clearTimeout(timer);
    delete fallbackTimers[kind];
  }
  void postToWorker({ type: "CANCEL_REMINDER", kind });
}

/** Ask the worker to deliver anything that is due right now (missed catch-up). */
export async function runDueCheck(): Promise<void> {
  await postToWorker({ type: "RUN_DUE_CHECK" });
}

/**
 * Periodic Background Sync: lets the browser wake the service worker roughly
 * once a day even when the installed PWA is fully closed. Best-effort —
 * Chromium-only behind installability requirements; other browsers rely on
 * the catch-up due-check on next launch.
 */
export async function registerPeriodicSync(): Promise<boolean> {
  try {
    const reg = (await registerNotificationWorker()) as (ServiceWorkerRegistration & {
      periodicSync?: { register: (tag: string, opts: { minInterval: number }) => Promise<void>; getTags: () => Promise<string[]> };
    }) | null;
    if (!reg?.periodicSync) return false;
    const status = (navigator as Navigator & { permissions?: { query: (d: { name: string }) => Promise<PermissionStatus> } }).permissions;
    if (status?.query) {
      const state = await status.query({ name: "periodic-background-sync" });
      if (state.state !== "granted") return false;
    }
    const tags = await reg.periodicSync.getTags().catch(() => [] as string[]);
    if (!tags.includes(PERIODIC_SYNC_TAG)) {
      await reg.periodicSync.register(PERIODIC_SYNC_TAG, { minInterval: 12 * 60 * 60 * 1000 });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * While a tab is open, nudge the worker's due-check every 30s (and whenever
 * the tab becomes visible again) so reminders stay exact even if the worker's
 * in-memory timers were reaped.
 */
export function startReminderTicker() {
  if (tickerStarted || typeof document === "undefined") return;
  tickerStarted = true;
  const tick = () => {
    if (document.visibilityState === "visible") void runDueCheck();
  };
  document.addEventListener("visibilitychange", tick);
  setInterval(tick, 30_000);
}

export type DeliveredReminder = OutboxItem & { createdAt?: string };

/** Subscribe to reminders delivered by the worker (live, while app is open). */
export function onDeliveredReminders(handler: (item: DeliveredReminder) => void) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return () => {};
  const listener = (event: MessageEvent) => {
    const data = event.data || {};
    if (data.type === "REMINDER_DELIVERED" && data.item) handler(data.item as DeliveredReminder);
  };
  navigator.serviceWorker.addEventListener("message", listener);
  return () => navigator.serviceWorker.removeEventListener("message", listener);
}

/**
 * Move everything the worker delivered while no tab was open into the
 * in-app notification centre (deduped by kind+date key).
 */
export async function mergeOutboxIntoInbox(): Promise<number> {
  try {
    const [{ getInbox, addToInbox }, entries] = await Promise.all([
      import("./notificationInbox"),
      getOutboxEntries(),
    ]);
    if (!entries.length) return 0;
    const existing = new Set(
      getInbox()
        .map((x) => (x.payload as { dedupeKey?: string } | undefined)?.dedupeKey)
        .filter(Boolean) as string[]
    );
    let merged = 0;
    for (const { key, item } of entries) {
      if (item.dedupeKey && existing.has(item.dedupeKey)) {
        await deleteOutboxKey(key);
        continue;
      }
      addToInbox({
        kind: item.kind as import("./notificationInbox").InboxKind,
        title: item.title,
        body: item.body,
        url: item.url,
        payload: item.dedupeKey ? { dedupeKey: item.dedupeKey } : undefined,
      });
      if (item.dedupeKey) existing.add(item.dedupeKey);
      await deleteOutboxKey(key);
      merged++;
    }
    return merged;
  } catch {
    return 0;
  }
}
