// Device-level notifications via a service worker so alerts land in the
// phone/desktop notification centre (and survive the tab being backgrounded).

export type ReminderKind = "devotion" | "word" | "scripture";

export const REMINDER_CONTENT: Record<ReminderKind, { title: string; body: string; url: string }> = {
  devotion: {
    title: "Devotly · Time for your devotional 🌿",
    body: "Take a quiet moment with God today.",
    url: "/generate",
  },
  word: {
    title: "Devotly · Word of the Day ✨",
    body: "A fresh word to carry through your day. Tap to receive it.",
    url: "/generate",
  },
  scripture: {
    title: "Devotly · Scripture of the Day 📖",
    body: "Today's verse is waiting for you. Tap to read and reflect.",
    url: "/search",
  },
};

const fallbackTimers: Partial<Record<ReminderKind, number>> = {};
let swReady: Promise<ServiceWorkerRegistration | null> | null = null;

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

export async function showNotification(title: string, body: string, url = "/", tag = "devotly") {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const reg = await registerNotificationWorker();
  if (reg) {
    await reg.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag,
      data: { url },
    });
    return;
  }
  try { new Notification(title, { body, icon: "/icon-192.png" }); } catch { /* ignore */ }
}

/** Schedule a recurring daily notification of the given kind at HH:mm (local time). */
export async function scheduleReminder(kind: ReminderKind, timeHHmm: string) {
  cancelReminder(kind);
  if (!notificationsSupported()) return;
  const [h, m] = timeHHmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return;

  const content = REMINDER_CONTENT[kind];

  // Preferred path: the service worker owns the schedule so the notification
  // is delivered by the device even when the tab isn't focused.
  await postToWorker({ type: "SCHEDULE_REMINDER", kind, time: timeHHmm, ...content });

  // Fallback for browsers without an active worker.
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  fallbackTimers[kind] = window.setTimeout(async () => {
    await showNotification(content.title, content.body, content.url, `devotly-${kind}`);
    scheduleReminder(kind, timeHHmm);
  }, next.getTime() - now.getTime());
}

export function cancelReminder(kind: ReminderKind) {
  const timer = fallbackTimers[kind];
  if (timer != null) {
    clearTimeout(timer);
    delete fallbackTimers[kind];
  }
  void postToWorker({ type: "CANCEL_REMINDER", kind });
}

/** Back-compat helpers for the daily devotion reminder. */
export const scheduleDailyReminder = (timeHHmm: string) => scheduleReminder("devotion", timeHHmm);
export const cancelDailyReminder = () => cancelReminder("devotion");
