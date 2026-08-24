import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import { initSettings, getSettings } from "./lib/settingsStore";
import {
  registerNotificationWorker,
  scheduleReminder,
  runDueCheck,
  registerPeriodicSync,
  startReminderTicker,
  onDeliveredReminders,
  mergeOutboxIntoInbox,
} from "./lib/notifications";
import { getDailyContent } from "./lib/dailyContent";

initSettings();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Register the notification service worker, restore every scheduled reminder,
// deliver anything missed while the app was closed, and keep background
// wake-ups registered so reminders fire even with no window open.
registerNotificationWorker().then(async () => {
  const s = getSettings();
  if (s.dailyReminderEnabled) await scheduleReminder("devotion", s.dailyReminderTime);
  if (s.wordOfDayEnabled) await scheduleReminder("word", s.wordOfDayTime);
  if (s.scriptureOfDayEnabled) await scheduleReminder("scripture", s.scriptureOfDayTime);

  // Catch-up: fire any reminder whose time passed while we were closed.
  await runDueCheck();
  // Surface those deliveries (if any) in the in-app notification centre.
  await mergeOutboxIntoInbox();

  // Browser-driven wake-ups while the PWA is fully closed (Chromium).
  void registerPeriodicSync();
  // Keep timing exact while a tab is open even if worker timers are reaped.
  startReminderTicker();

  // Live deliveries from the worker land straight in the in-app inbox.
  const { addToInbox } = await import("./lib/notificationInbox");
  onDeliveredReminders((item) => {
    addToInbox({
      kind: item.kind as import("./lib/notificationInbox").InboxKind,
      title: item.title,
      body: item.body,
      url: item.url,
      payload: (item as { dedupeKey?: string }).dedupeKey ? { dedupeKey: (item as { dedupeKey?: string }).dedupeKey } : undefined,
    });
  });
});

// Warm today's Word of the Day / Scripture of the Day cache so notifications
// and the home cards carry real content.
getDailyContent();
