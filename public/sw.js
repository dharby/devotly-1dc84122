/* Devotly notification service worker.
   Owns the persistent reminder schedule so notifications are delivered into
   the device notification centre even when every tab/app window is closed.

   Strategy (client-only PWA, no push server required):
   - The schedule lives in IndexedDB, not memory, so it survives SW restarts.
   - A due-check runs on: message from the app, periodic background sync
     wake-ups, push wake-ups, and after each fire. Anything whose time has
     passed today and hasn't fired yet today is delivered immediately.
   - In-memory setTimeout timers re-arm the schedule for near-exact delivery
     while the worker is alive; they are a best-effort optimisation only. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

const DB_NAME = "devotly-reminders";
const DB_VERSION = 1;
const SYNC_TAG = "devotly-reminders";

const timers = {};

/* ---------------- IndexedDB helpers (SW cannot use localStorage) --------- */

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("schedules")) db.createObjectStore("schedules", { keyPath: "kind" });
      if (!db.objectStoreNames.contains("fired")) db.createObjectStore("fired");
      if (!db.objectStoreNames.contains("outbox")) db.createObjectStore("outbox", { autoIncrement: true });
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(store, value, key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    key === undefined ? tx.objectStore(store).put(value) : tx.objectStore(store).put(value, key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGetAll(store) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(store, key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(store, key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

/* ------------------------------- utilities ------------------------------ */

function localDateKey(d = new Date()) {
  // YYYY-MM-DD in the user's local timezone.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function msUntil(timeHHmm) {
  const [h, m] = String(timeHHmm).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

const KIND_FALLBACK = {
  devotion: { title: "Devotly · Your quiet moment awaits 🌿✨", body: "Come, rest in His presence — today’s devotional is ready for you.", url: "/generate" },
  word: { title: "Devotly · Word of the Day ✨ — tap to reveal", body: "A fresh, Spirit-breathed word to carry through your day.", url: "/?preview=word" },
  scripture: { title: "Devotly · Scripture of the Day 📖 — tap to behold", body: "A living verse is waiting — open to read, reflect, and be renewed.", url: "/?preview=scripture" },
  reading: { title: "Devotly · Bible in a Year 📚 — Day’s journey ready", body: "Your chapters for today are ready — continue the story.", url: "/reading-plan" },
};

async function fetchDailyContent(kind, meta) {
  // Pull today's real Word/Scripture straight from the edge function so
  // notifications carry fresh content even after days closed.
  if ((kind !== "word" && kind !== "scripture") || !meta?.supabaseUrl || !meta?.supabaseKey) return null;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${meta.supabaseUrl}/functions/v1/daily-word`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: meta.supabaseKey,
        Authorization: `Bearer ${meta.supabaseKey}`,
      },
      body: JSON.stringify({ date: localDateKey(), translation: meta.bibleTranslation || "ESV" }),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.word || !data?.scripture) return null;
    if (kind === "word") {
      return {
        title: `Word of the Day · ${data.word.word} ✨`,
        body: `${data.word.original ? `${data.word.original} (${data.word.transliteration}) — ` : ""}${data.word.meaning}`,
        payloadBody: `${data.word.meaning}\n\n${data.word.verse} — ${data.word.reference}\n\n${data.word.application}`,
        url: "/?preview=word",
      };
    }
    return {
      title: `Scripture of the Day · ${data.scripture.reference} 📖`,
      body: data.scripture.text,
      payloadBody: `${data.scripture.text}\n\n${data.scripture.reflection}`,
      url: "/?preview=scripture",
    };
  } catch {
    return null;
  }
}

/* ------------------------------ firing logic ---------------------------- */

async function showReminder(kind, content) {
  const reg = self.registration;
  if (!reg) return false;
  if (self.Notification && Notification.permission !== "granted") return false;
  await reg.showNotification(content.title, {
    body: content.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `devotly-${kind}`,
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: content.url || "/", kind },
  });
  return true;
}

async function broadcast(item) {
  try {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of list) client.postMessage({ type: "REMINDER_DELIVERED", item });
  } catch {}
}

async function runDueCheck() {
  let schedules = [];
  try { schedules = (await idbGetAll("schedules")).filter((s) => s && s.enabled !== false); } catch { return []; }
  if (!schedules.length) return [];

  const today = localDateKey();
  const now = new Date();
  const [h, m] = [now.getHours(), now.getMinutes()];
  const minutesNow = h * 60 + m;
  const delivered = [];

  for (const schedule of schedules) {
    const [sh, sm] = String(schedule.time).split(":").map(Number);
    if (Number.isNaN(sh) || Number.isNaN(sm)) continue;
    const minutesScheduled = sh * 60 + sm;
    const firedKey = `${schedule.kind}|${today}`;
    const alreadyFired = await idbGet("fired", firedKey);
    if (alreadyFired) continue;
    if (minutesNow < minutesScheduled) continue; // not due yet

    let content = KIND_FALLBACK[schedule.kind] || KIND_FALLBACK.devotion;
    try {
      const meta = (await idbGet("meta", "config")) || null;
      const fresh = await fetchDailyContent(schedule.kind, meta);
      if (fresh) content = { ...content, ...fresh };
      else if (schedule.title) content = { ...content, title: schedule.title, body: schedule.body, url: schedule.url || content.url };
    } catch {}

    const ok = await showReminder(schedule.kind, content);
    // Record as fired even if the OS blocked the toast so we don't spam
    // retries every wake-up; inbox entry still lands for the in-app centre.
    await idbPut("fired", { at: Date.now(), delivered: ok }, firedKey);
    const item = {
      kind: schedule.kind,
      title: content.title,
      body: content.payloadBody || content.body,
      url: content.url || "/",
      dedupeKey: firedKey,
    };
    await idbPut("outbox", item);
    await broadcast({ ...item, createdAt: new Date().toISOString() });
    delivered.push(item);

    armTimer(schedule); // re-arm for tomorrow while we're alive
  }
  return delivered;
}

function armTimer(schedule) {
  if (timers[schedule.kind]) clearTimeout(timers[schedule.kind]);
  const delay = msUntil(schedule.time);
  if (delay == null) return;
  timers[schedule.kind] = setTimeout(() => { runDueCheck(); }, delay + 1500);
}

/* ------------------------- schedule persistence ------------------------- */

async function persistSchedule(data) {
  await idbPut("schedules", {
    kind: data.kind,
    time: data.time,
    enabled: true,
    title: data.title,
    body: data.body,
    url: data.url,
    updatedAt: Date.now(),
  });
  armTimer({ kind: data.kind, time: data.time });
}

async function cancelSchedule(kind) {
  if (timers[kind]) { clearTimeout(timers[kind]); delete timers[kind]; }
  await idbDelete("schedules", kind);
}

/* -------------------------- lifecycle & events -------------------------- */

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (!data.type) return;

  if (data.type === "SET_CONFIG") {
    event.waitUntil(idbPut("meta", {
      supabaseUrl: data.supabaseUrl || null,
      supabaseKey: data.supabaseKey || null,
      bibleTranslation: data.bibleTranslation || "ESV",
    }, "config"));
  }

  if (data.type === "SCHEDULE_REMINDER") {
    event.waitUntil(persistSchedule(data));
  }

  if (data.type === "CANCEL_REMINDER") {
    event.waitUntil(cancelSchedule(data.kind));
  }

  if (data.type === "RUN_DUE_CHECK") {
    // runDueCheck already broadcasts deliveries to every open client.
    event.waitUntil(runDueCheck());
  }

  if (data.type === "SHOW_NOTIFICATION") {
    event.waitUntil(showReminder(data.tag?.replace("devotly-", "") || "devotion", {
      title: data.title || "Devotly 🔔",
      body: data.body || "",
      url: data.url || "/",
    }));
  }
});

// Browser-driven wake-ups while the app is fully closed (installed PWA).
self.addEventListener("periodicsync", (event) => {
  if (event.tag === SYNC_TAG) event.waitUntil(runDueCheck());
});

// Future-proofing: if a Web Push server is ever connected it can wake us too.
self.addEventListener("push", (event) => {
  event.waitUntil(runDueCheck());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(new URL(target, self.location.origin).href);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
