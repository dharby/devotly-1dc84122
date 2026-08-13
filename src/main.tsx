import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSettings } from "./lib/settingsStore";
import { getSettings } from "./lib/settingsStore";
import { registerNotificationWorker, scheduleAllReminders } from "./lib/notifications";
import { getDailyContent } from "./lib/dailyContent";

initSettings();

createRoot(document.getElementById("root")!).render(<App />);

// Register the notification service worker and restore every scheduled reminder.
registerNotificationWorker().then(() => {
  scheduleAllReminders(getSettings());
});

// Warm today's Word of the Day / Scripture of the Day cache so notifications
// (and the home cards) carry real content.
getDailyContent();

