// Local notifications powered by the Notification API + setTimeout.
// Works while the PWA/browser tab is running; when installed as a PWA the
// service worker keeps this alive longer. This is intentionally simple —
// no push server required.

let scheduledTimer: number | null = null;

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission {
  if (!notificationsSupported()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  return await Notification.requestPermission();
}

export async function showNotification(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg) {
      reg.showNotification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png", tag: "devotly" });
    } else {
      new Notification(title, { body, icon: "/icon-192.png" });
    }
  } catch {
    try { new Notification(title, { body }); } catch {}
  }
}

/** Schedule the next daily reminder at HH:mm (local time). */
export function scheduleDailyReminder(timeHHmm: string) {
  cancelDailyReminder();
  if (!notificationsSupported()) return;
  const [h, m] = timeHHmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return;
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  // window.setTimeout is capped at ~24.8 days — safe for 24h max
  scheduledTimer = window.setTimeout(async () => {
    await showNotification("Devotly · Time for your devotional 🌿", "Take a quiet moment with God today.");
    scheduleDailyReminder(timeHHmm); // reschedule for next day
  }, delay);
}

export function cancelDailyReminder() {
  if (scheduledTimer != null) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
}
