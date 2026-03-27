import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import GenerateDevotional from "./pages/GenerateDevotional";
import Tracker from "./pages/Tracker";
import SavedDevotionals from "./pages/SavedDevotionals";
import Family from "./pages/Family";
import Settings from "./pages/Settings";
import PrayerTimer from "./pages/PrayerTimer";
import FastingTracker from "./pages/FastingTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/generate" element={<GenerateDevotional />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/saved" element={<SavedDevotionals />} />
          <Route path="/family" element={<Family />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/prayer-timer" element={<PrayerTimer />} />
          <Route path="/fasting" element={<FastingTracker />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
