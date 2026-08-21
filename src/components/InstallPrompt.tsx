import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Share, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = "devotly_install_dismissed_at";
const DISMISS_HOURS = 24;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    const diff = Date.now() - ts;
    return diff < DISMISS_HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;
    setIsIOSDevice(isIOS());

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 1800);
    };
    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    const fallbackTimer = setTimeout(() => {
      if (!isStandalone() && !wasRecentlyDismissed()) {
        const visits = Number(localStorage.getItem("devotly_visits") || "0") + 1;
        localStorage.setItem("devotly_visits", String(visits));
        // Show for every visitor now (24h recurrence handles repeat), first visit after 2.5s
        if (visits >= 1) setVisible(true);
      }
    }, 2500);

    const v = Number(localStorage.getItem("devotly_visits") || "0");
    if (v === 0) localStorage.setItem("devotly_visits", "1");

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") setVisible(false);
        else dismiss();
      } catch { dismiss(); } finally { setInstalling(false); setDeferredPrompt(null); }
    } else if (isIOSDevice) {
      setCollapsed(false);
    } else {
      dismiss();
    }
  };

  if (isStandalone()) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 260 }}
          className="fixed top-0 inset-x-0 z-[100] px-3 pt-3 md:px-6 pointer-events-none"
        >
          <div className="mx-auto max-w-2xl pointer-events-auto">
            <motion.div layout className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-cathedral" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "linear", repeatDelay: 1.5 }}
              />
              <div className="relative px-4 py-3 md:px-5 md:py-4">
                <div className="flex items-start gap-3">
                  <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-cathedral items-center justify-center shadow-cathedral shrink-0 mt-0.5">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-bold leading-tight">
                        {isIOSDevice && !deferredPrompt ? "Add Devotly to Home Screen" : "Install Devotly"}
                      </h3>
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                        Free · Offline ready
                      </span>
                    </div>
                    {!collapsed && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {isIOSDevice && !deferredPrompt ? (
                          <>Tap <Share className="inline h-3 w-3 mx-0.5" /> <span className="font-medium text-foreground">Share</span> then <span className="font-medium text-foreground">“Add to Home Screen”</span> for instant access, offline devotionals & daily reminders.</>
                        ) : (
                          <>Get the full app experience — faster, offline access, daily reminders & home-screen presence. No store needed.</>
                        )}
                      </p>
                    )}
                    {collapsed && <p className="text-xs text-muted-foreground mt-1">Tap to expand details</p>}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Button onClick={handleInstall} disabled={installing} size="sm" className="h-8 rounded-full px-4 text-xs font-semibold shadow-cathedral">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        {installing ? "Installing…" : isIOSDevice && !deferredPrompt ? "How to install" : "Install now"}
                      </Button>
                      <Button onClick={dismiss} variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">Not now</Button>
                      <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">Shows again in 24 hours</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setCollapsed((v) => !v)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors" aria-label={collapsed ? "Expand" : "Collapse"}>
                      <motion.span animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.2 }}><ChevronDown className="h-4 w-4" /></motion.span>
                    </button>
                    <button onClick={dismiss} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors" aria-label="Dismiss"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
