import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search as SearchIcon, X, BookOpen, ScrollText, Highlighter, NotebookPen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDevotionals } from "@/hooks/useDevotionals";
import { useSermons } from "@/hooks/useSermons";
import { useNotes } from "@/hooks/useNotes";
import { useHighlights, type StoredHighlight } from "@/hooks/useHighlights";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Kind = "all" | "devotional" | "sermon" | "highlight" | "note";

interface Hit {
  id: string;
  kind: Exclude<Kind, "all">;
  title: string;
  snippet: string;
  meta: string;
  onOpen: () => void;
}

const FILTERS: { value: Kind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "devotional", label: "Devotionals" },
  { value: "sermon", label: "Sermons" },
  { value: "note", label: "Notes" },
];

const ICONS = {
  devotional: BookOpen,
  sermon: ScrollText,
  highlight: Highlighter,
  note: NotebookPen,
} as const;

function snippetAround(text: string, query: string, span = 120) {
  const flat = (text || "").replace(/\s+/g, " ").trim();
  const i = flat.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return flat.slice(0, span);
  const start = Math.max(0, i - span / 2);
  return (start > 0 ? "…" : "") + flat.slice(start, start + span) + (start + span < flat.length ? "…" : "");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const Highlighted = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const escaped = escapeHtml(text);
  const pattern = new RegExp(escapeRegExp(escapeHtml(query)).replace(/\s+/g, "\\s+"), "gi");
  return (
    <>
      {escaped.split(pattern).map((p, i) =>
        p.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/25 text-foreground rounded px-0.5">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

export default function Search() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Kind>("all");
  const { devotionals } = useDevotionals();
  const { sermons, getSermonHighlights } = useSermons();
  const { notes } = useNotes();
  const { highlights, addHighlight, removeHighlight } = useHighlights(undefined, undefined);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("devotional_highlights")
      .select("id, text, color, devotional_id, sermon_id")
      .then(({ data }) => data && highlights.length > 0 && setHighlights(data as StoredHighlight[]));
  }, [user, highlights.length]);

  const highlightsRef = useMemo(() => {
    return highlights || [];
  }, [highlights]);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: Hit[] = [];

    devotionals.forEach((d) => {
      const blob = [d.title, d.topic, d.scripture, d.scriptureReference, d.reflection, d.prayer, d.declaration, d.greekLatinInsights]
        .filter(Boolean).join(" ");
      if (blob.toLowerCase().includes(q)) {
        out.push({
          id: d.id, kind: "devotional", title: d.title,
          snippet: snippetAround(blob, q),
          meta: `${d.scriptureReference} · ${new Date(d.createdAt).toLocaleDateString()}`,
          onOpen: () => navigate("/saved"),
        });
      }
    });

    sermons.forEach((s) => {
      const blob = [s.title, s.topic, s.notes, JSON.stringify(s.content ?? {})].filter(Boolean).join(" ");
      if (blob.toLowerCase().includes(q)) {
        out.push({
          id: s.id, kind: "sermon", title: s.title,
          snippet: snippetAround(blob.replace(/["{}[\],]/g, " "), q),
          meta: `${s.topic} · ${s.style}`,
          onOpen: () => navigate(`/sermon?open=${s.id}`),
        });
      }
    });

    highlightsRef.forEach((h) => {
      if (h.text?.toLowerCase().includes(q)) {
        const source = h.devotional_id 
          ? devotionals.find((d) => d.id === h.devotional_id)?.title 
          : h.sermon_id 
            ? sermons.find((s) => s.id === h.sermon_id)?.title ?? "Sermon study"
            : "Devotional";
        out.push({
          id: h.id, kind: "highlight", title: "Highlight",
          snippet: h.text, meta: source,
          onOpen: () => navigate(h.sermon_id ? `/sermon?open=${h.sermon_id}` : "/saved"),
        });
      }
    });

    notes.forEach((n) => {
      const blob = `${n.title} ${n.body}`;
      if (blob.toLowerCase().includes(q)) {
        out.push({
          id: n.id, kind: "note", title: n.title || "Untitled note",
          snippet: snippetAround(n.body, q), meta: `${n.folder} · ${new Date(n.updated_at).toLocaleDateString()}`,
          onOpen: () => navigate(`/notes?open=${n.id}`),
        });
      }
    });

    return filter === "all" ? out : out.filter((h) => h.kind === filter);
  }, [query, filter, devotionals, sermons, notes, highlightsRef, navigate]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    hits.forEach((h) => (c[h.kind] = (c[h.kind] || 0) + 1));
    return c;
  }, [hits]);

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground"><ChevronLeft className="h-5 w-5" /></button>
          <h1 className="font-display text-lg font-semibold flex-1">Search</h1>
        </div>
        <div class="relative">
          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search devotionals, sermons, highlights, notes…"
            className="pl-9 pr-9 rounded-xl bg-card"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all",
                filter === f.value ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground",
              )}
            >
              {f.label}
              {f.value !== "all" && counts[f.value] ? ` (${counts[f.value]})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-5">
        {!query.trim() ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            Search everything you've saved — devotionals, sermons, highlights and notes.
          </p>
        ) : hits.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No matches for “{query}”.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{hits.length} result{hits.length > 1 ? "s" : ""}</p>
            {hits.map((h) => {
              const Icon = ICONS[h.kind];
              return (
                <button
                  key={`${h.kind}-${h.id}`}
                  onClick={h.onOpen}
                  className="w-full text-left bg-card border border-border rounded-xl p-4 hover:shadow-warm transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">{h.kind}</span>
                  </div>
                  <p className="font-display font-semibold text-sm"><Highlighted text={h.title} query={query} /></p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed"><Highlighted text={h.snippet} query={query} /></p>
                  <p className="text-[10px] text-muted-foreground/70 mt-2">{h.meta}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}