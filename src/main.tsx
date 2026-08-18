import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import { initSettings, getSettings } from "./lib/settingsStore";
import { registerNotificationWorker, scheduleReminder } from "./lib/notifications";
import { getDailyContent } from "./lib/dailyContent";

initSettings();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Register the notification service worker and restore every scheduled reminder.
registerNotificationWorker().then(() => {
  const s = getSettings();
  if (s.dailyReminderEnabled) scheduleReminder("devotion", s.dailyReminderTime);
  if (s.wordOfDayEnabled) scheduleReminder("word", s.wordOfDayTime);
  if (s.scriptureOfDayEnabled) scheduleReminder("scripture", s.scriptureOfDayTime);
});

// Warm today's Word of the Day / Scripture of the Day cache so notifications
// and the home cards carry real content.
getDailyContent();
