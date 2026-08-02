import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSettings } from "./lib/settingsStore";
import { registerNotificationWorker, scheduleDailyReminder, getSettingsReminder } from "./lib/notificationsBoot";

initSettings();

createRoot(document.getElementById("root")!).render(<App />);

// Register the notification service worker and restore any daily reminder.
if (import.meta.env.PROD || true) {
  registerNotificationWorker().then(() => {
    const reminder = getSettingsReminder();
    if (reminder) scheduleDailyReminder(reminder);
  });
}
