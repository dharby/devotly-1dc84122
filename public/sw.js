/* Devotly notification service worker.
   Delivers reminders into the device notification centre and keeps
   scheduling alive in the background while the SW is retained. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

let reminderTimer = null;

function msUntil(timeHHmm) {
  const [h, m] = String(timeHHmm).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function schedule(timeHHmm) {
  if (reminderTimer) clearTimeout(reminderTimer);
  const delay = msUntil(timeHHmm);
  if (delay == null) return;
  reminderTimer = setTimeout(async () => {
    await self.registration.showNotification("Devotly · Time for your devotional 🌿", {
      body: "Take a quiet moment with God today.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "devotly-daily",
      renotify: true,
      requireInteraction: false,
      data: { url: "/generate" },
    });
    schedule(timeHHmm);
  }, delay);
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SCHEDULE_REMINDER") schedule(data.time);
  if (data.type === "CANCEL_REMINDER" && reminderTimer) {
    clearTimeout(reminderTimer);
    reminderTimer = null;
  }
  if (data.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "devotly",
      renotify: true,
      data: { url: data.url || "/" },
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
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
