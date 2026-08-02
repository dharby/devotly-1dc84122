import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Search, SquarePen, Trash2, Pin, PinOff, Share2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotes, type Note } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function preview(body: string) {
  const line = body.split("\n").slice(1).join(" ").trim();
  return line || "No additional text";
}

function titleOf(n: Note) {
  return n.title?.trim() || n.body.split("\n")[0]?.trim() || "New Note";
}

function groupLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isSame = d.toDateString() === today.toDateString();
  if (isSame) return "Today";
  const y = new Date(today); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  const week = new Date(today); week.setDate(week.getDate() - 7);
  if (d > week) return "Previous 7 Days";
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "2-digit" });
}

const Notes = () => {
  const navigate = useNavigate();
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<number | null>(null);

  const open = notes.find((n) => n.id === openId) ?? null;

  useEffect(() => {
    if (open) setDraft({ title: open.title, body: open.body });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const queueSave = (patch: { title?: string; body?: string }) => {
    if (!openId) return;
    setDraft((d) => ({ ...d, ...patch }));
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      await updateNote(openId, patch);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1200);
    }, 600);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => (n.title + " " + n.body).toLowerCase().includes(q));
  }, [notes, search]);

  const grouped = useMemo(() => {
    const pinned = filtered.filter((n) => n.pinned);
    const rest = filtered.filter((n) => !n.pinned);
    const groups: { label: string; items: Note[] }[] = [];
    if (pinned.length) groups.push({ label: "Pinned", items: pinned });
    for (const n of rest) {
      const label = groupLabel(n.updated_at);
      const g = groups.find((x) => x.label === label && x.label !== "Pinned");
      if (g) g.items.push(n);
      else groups.push({ label, items: [n] });
    }
    return groups;
  }, [filtered]);

  const newNote = async () => {
    const n = await createNote();
    if (n) setOpenId(n.id);
  };

  const share = async () => {
    if (!open) return;
    const text = `${titleOf(open)}\n\n${draft.body}`;
    try {
      if (navigator.share) await navigator.share({ title: titleOf(open), text });
      else { await navigator.clipboard.writeText(text); toast.success("Note copied"); }
    } catch { /* dismissed */ }
  };

  /* ---------------- Editor ---------------- */
  if (open) {
    return (
      <div className="min-h-screen pb-28 bg-background">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpenId(null)} className="flex items-center text-primary text-sm font-medium">
            <ChevronLeft className="h-5 w-5" /> Notes
          </button>
          <span className="text-[11px] text-muted-foreground">
            {saved ? <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Saved</span> : timeLabel(open.updated_at)}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => updateNote(open.id, { pinned: !open.pinned })} className="text-primary">
              {open.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
            <button onClick={share} className="text-primary"><Share2 className="h-4 w-4" /></button>
            <button
              onClick={async () => { await deleteNote(open.id); setOpenId(null); toast.success("Note deleted"); }}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-5">
          <input
            value={draft.title}
            onChange={(e) => queueSave({ title: e.target.value })}
            placeholder="Title"
            className="w-full bg-transparent font-display text-2xl font-bold outline-none placeholder:text-muted-foreground/50 mb-1"
          />
          <p className="text-[11px] text-muted-foreground mb-4">
            {new Date(open.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
          <textarea
            value={draft.body}
            onChange={(e) => queueSave({ body: e.target.value })}
            placeholder="Start typing your service or meeting notes…"
            className="w-full min-h-[60vh] bg-transparent text-[15px] leading-relaxed outline-none resize-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>
    );
  }

  /* ---------------- List ---------------- */
  return (
    <div className="min-h-screen pb-32">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold">Notes</h1>
          <span className="ml-auto text-xs text-muted-foreground">{notes.length} note{notes.length === 1 ? "" : "s"}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes"
            className="w-full bg-muted rounded-xl pl-9 pr-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div className="px-4 pt-4 animate-fade-in">
        {loading && <p className="text-sm text-muted-foreground px-2">Loading…</p>}
        {!loading && !filtered.length && (
          <div className="text-center py-20">
            <SquarePen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notes yet. Tap the pencil to start.</p>
          </div>
        )}

        {grouped.map((g) => (
          <div key={g.label} className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">{g.label}</p>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {g.items.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => setOpenId(n.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                    i !== g.items.length - 1 && "border-b border-border"
                  )}
                >
                  <p className="font-medium text-sm truncate">{titleOf(n)}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    <span className="mr-2">{timeLabel(n.updated_at)}</span>
                    {preview(n.body)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={newNote}
        aria-label="New note"
        className="fixed bottom-24 right-5 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-warm flex items-center justify-center active:scale-95 transition-transform"
      >
        <SquarePen className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Notes;
