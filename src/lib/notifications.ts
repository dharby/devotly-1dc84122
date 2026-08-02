// Device-level notifications via a service worker so alerts land in the
// phone/desktop notification centre (and survive the tab being backgrounded).

let scheduledTimer: number | null = null;
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

export async function showNotification(title: string, body: string, url = "/") {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const reg = await registerNotificationWorker();
  if (reg) {
    await reg.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "devotly",
      data: { url },
    });
    return;
  }
  try { new Notification(title, { body, icon: "/icon-192.png" }); } catch { /* ignore */ }
}

/** Schedule the next daily reminder at HH:mm (local time). */
export async function scheduleDailyReminder(timeHHmm: string) {
  cancelDailyReminder();
  if (!notificationsSupported()) return;
  const [h, m] = timeHHmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return;

  // Preferred path: the service worker owns the schedule so the notification
  // is delivered by the device even when the tab isn't focused.
  await postToWorker({ type: "SCHEDULE_REMINDER", time: timeHHmm });

  // Fallback for browsers without an active worker.
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  scheduledTimer = window.setTimeout(async () => {
    await showNotification("Devotly · Time for your devotional 🌿", "Take a quiet moment with God today.", "/generate");
    scheduleDailyReminder(timeHHmm);
  }, next.getTime() - now.getTime());
}

export function cancelDailyReminder() {
  if (scheduledTimer != null) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
  void postToWorker({ type: "CANCEL_REMINDER" });
}
