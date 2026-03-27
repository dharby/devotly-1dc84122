import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSettings } from "./lib/settingsStore";

initSettings();

createRoot(document.getElementById("root")!).render(<App />);
