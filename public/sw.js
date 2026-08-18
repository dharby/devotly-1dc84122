/* Devotly notification service worker.
   Delivers reminders into the device notification centre and keeps
   scheduling alive in the background while the SW is retained. */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

const timers = {};

function msUntil(timeHHmm) {
  const [h, m] = String(timeHHmm).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function schedule(kind, timeHHmm, content) {
  if (timers[kind]) clearTimeout(timers[kind]);
  const delay = msUntil(timeHHmm);
  if (delay == null) return;
  timers[kind] = setTimeout(async () => {
    const reg = self.registration;
    if (!reg) return;
    await reg.showNotification(content.title, {
      body: content.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `devotly-${kind}`,
      renotify: true,
      requireInteraction: false,
      data: { url: content.url || "/" },
    });
    schedule(kind, timeHHmm, content);
  }, delay);
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  const kind = data.kind || "devotion";

  if (data.type === "SCHEDULE_REMINDER") {
    schedule(kind, data.time, {
      title: data.title || "Devotly · Time for your devotional 🌿",
      body: data.body || "Take a quiet moment with God today.",
      url: data.url || "/generate",
    });
  }

  if (data.type === "CANCEL_REMINDER" && timers[kind]) {
    clearTimeout(timers[kind]);
    delete timers[kind];
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
