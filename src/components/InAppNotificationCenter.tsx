import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, BookOpen, Sparkles, ScrollText, Eye, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getInbox, markRead, markAllRead, clearInbox, type InboxItem } from "@/lib/notificationInbox";
import { mergeOutboxIntoInbox } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { getDailyContent } from "@/lib/dailyContent";

export default function InAppNotificationCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InboxItem[]>(() => getInbox());
  const [active, setActive] = useState<InboxItem | null>(null);

  const refresh = () => setItems(getInbox());
  useEffect(() => {
    const on = () => refresh();
    window.addEventListener("devotly:inbox", on);
    window.addEventListener("storage", on);
    // Pull in anything delivered by the service worker while we were closed
    // (e.g. Word/Scripture of the Day fired in the background).
    mergeOutboxIntoInbox().then((n) => { if (n > 0) refresh(); });
    // handle ?preview=word|scripture from notification click
    const params = new URLSearchParams(location.search);
    const preview = params.get("preview");
    if (preview === "word" || preview === "scripture") {
      // auto-open inbox and preview
      setOpen(true);
      getDailyContent().then((daily) => {
        if (!daily) return;
        if (preview === "word") {
          setActive({
            id: "preview-word",
            kind: "word",
            title: `Word of the Day · ${daily.word.word}`,
            body: `${daily.word.original ? `${daily.word.original} (${daily.word.transliteration}) — ` : ""}${daily.word.meaning}\n\n${daily.word.verse} — ${daily.word.reference}\n\n${daily.word.application}`,
            url: "/",
            createdAt: new Date().toISOString(),
            read: true,
          });
        } else {
          setActive({
            id: "preview-scripture",
            kind: "scripture",
            title: `Scripture of the Day · ${daily.scripture.reference}`,
            body: `${daily.scripture.text}\n\n${daily.scripture.reflection}`,
            url: "/",
            createdAt: new Date().toISOString(),
            read: true,
          });
        }
      });
    }
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (open && !target.closest("[data-inbox]")) {
        // keep open only if bell clicked
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("devotly:inbox", on);
      window.removeEventListener("storage", on);
      document.removeEventListener("click", onClick);
    };
  }, [location.search]);

  const unread = items.filter((x) => !x.read).length;

  const handleOpen = (item: InboxItem) => {
    markRead(item.id);
    refresh();
    setActive(item);
  };

  const handleNavigate = (item: InboxItem) => {
    markRead(item.id);
    refresh();
    setOpen(false);
    if (item.kind === "word" || item.kind === "scripture") {
      // preview in library
      navigate("/saved?tab=" + (item.kind === "word" ? "words" : "daily"));
      return;
    }
    navigate(item.url);
  };

  // hide on auth pages
  if (["/auth", "/reset-password"].includes(location.pathname)) return null;

  return (
    <>
      <button
        onClick={() => { setOpen((v) => !v); mergeOutboxIntoInbox().then((n) => { if (n > 0) refresh(); }); }}
        className="fixed right-3 z-[90] w-10 h-10 rounded-full bg-card border border-border shadow-warm flex items-center justify-center hover:shadow-golden transition-shadow md:right-4"
        style={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unread > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[85] bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div data-inbox initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: "spring", damping: 22, stiffness: 260 }} className="fixed right-3 z-[86] w-[min(92vw,360px)] max-h-[70vh] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_48px_rgba(0,0,0,0.18)] flex flex-col"
            style={{ top: "calc(env(safe-area-inset-top) + 56px)" }}>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-1">
                {items.length > 0 && <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { markAllRead(); refresh(); }}>Mark read</Button>}
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="overflow-auto flex-1">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3"><Bell className="h-6 w-6 text-primary" /></div>
                  <p className="text-sm font-medium">All caught up</p>
                  <p className="text-xs text-muted-foreground mt-1">Word & Scripture of the Day will appear here and in My Library.</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {items.map((it) => (
                    <div key={it.id} className={`rounded-xl border p-3 flex gap-3 ${it.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"}`}>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        {it.kind === "word" ? <Sparkles className="h-4 w-4 text-primary" /> : it.kind === "scripture" ? <BookOpen className="h-4 w-4 text-primary" /> : it.kind === "reading" ? <ScrollText className="h-4 w-4 text-primary" /> : <BookOpen className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight">{it.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">{it.body}</p>
                        <div className="flex gap-1.5 mt-2">
                          <Button size="sm" variant="default" className="h-7 text-xs rounded-full" onClick={() => handleOpen(it)}><Eye className="h-3 w-3 mr-1" /> Preview</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs rounded-full" onClick={() => handleNavigate(it)}>Open</Button>
                        </div>
                      </div>
                      {!it.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="p-2 border-t border-border flex justify-between">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { clearInbox(); refresh(); }}><Trash2 className="h-3 w-3 mr-1" /> Clear</Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { navigate("/saved"); setOpen(false); }}>Go to Library</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setActive(null)}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-card border border-border shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden max-h-[80vh] flex flex-col">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-xs font-semibold tracking-widest uppercase text-primary">{active.kind === "word" ? "Word of the Day" : active.kind === "scripture" ? "Scripture of the Day" : active.kind === "reading" ? "Bible in a Year" : "Devotional"}</p>
                <h3 className="font-display text-lg font-bold mt-1">{active.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{new Date(active.createdAt).toLocaleString()}</p>
              </div>
              <div className="p-5 overflow-auto whitespace-pre-wrap text-sm leading-relaxed">{active.body}</div>
              <div className="p-4 border-t border-border flex gap-2">
                <Button className="flex-1 rounded-xl" onClick={() => { setActive(null); navigate(active.url); }}>Open in app</Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setActive(null)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
