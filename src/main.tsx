import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSettings } from "./lib/settingsStore";
import { getSettings } from "./lib/settingsStore";
import { registerNotificationWorker, scheduleDailyReminder } from "./lib/notifications";

initSettings();

createRoot(document.getElementById("root")!).render(<App />);

// Register the notification service worker and restore any daily reminder.
registerNotificationWorker().then(() => {
  const settings = getSettings();
  if (settings.dailyReminderEnabled && settings.dailyReminderTime) {
    scheduleDailyReminder(settings.dailyReminderTime);
  }
});
