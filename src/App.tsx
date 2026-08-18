import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import Index from "./pages/Index";
import GenerateDevotional from "./pages/GenerateDevotional";
import Tracker from "./pages/Tracker";
import SavedDevotionals from "./pages/SavedDevotionals";
import Family from "./pages/Family";
import Settings from "./pages/Settings";
import PrayerTimer from "./pages/PrayerTimer";
import FastingTracker from "./pages/FastingTracker";
import Sermon from "./pages/Sermon";
import Notes from "./pages/Notes";
import ScriptureSearch from "./pages/ScriptureSearch";
import ReadingPlan from "./pages/ReadingPlan";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};

const AppShell = () => {
  const location = useLocation();
  const showNav = !["/auth", "/reset-password"].includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      <div className={cn("min-h-screen", showNav && "md:pl-64")}>
        {showNav && <Sidebar />}
        <div key={location.pathname} className="animate-fade-in min-h-screen">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/generate" element={<ProtectedRoute><GenerateDevotional /></ProtectedRoute>} />
            <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><SavedDevotionals /></ProtectedRoute>} />
            <Route path="/family" element={<ProtectedRoute><Family /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/prayer-timer" element={<ProtectedRoute><PrayerTimer /></ProtectedRoute>} />
            <Route path="/fasting" element={<ProtectedRoute><FastingTracker /></ProtectedRoute>} />
            <Route path="/sermon" element={<ProtectedRoute><Sermon /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/scripture" element={<ProtectedRoute><ScriptureSearch /></ProtectedRoute>} />
            <Route path="/reading-plan" element={<ProtectedRoute><ReadingPlan /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {showNav && (
          <div className="md:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
