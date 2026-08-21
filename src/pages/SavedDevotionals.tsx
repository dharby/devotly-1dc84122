import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, Trash2, Search as SearchIcon, X, ScrollText, Quote, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDevotionals } from "@/hooks/useDevotionals";
import { useSermons } from "@/hooks/useSermons";
import { useSavedScriptures } from "@/hooks/useSavedScriptures";
import EmptyState from "@/components/EmptyState";
import ConfirmDelete from "@/components/ConfirmDelete";
import { toast } from "sonner";

type Tab = "devotionals" | "sermons" | "scriptures" | "words" | "daily";

const TABS: { value: Tab; label: string }[] = [
  { value: "devotionals", label: "Devotionals" },
  { value: "sermons", label: "Sermons" },
  { value: "scriptures", label: "Scriptures" },
  { value: "words", label: "Word of the Day" },
  { value: "daily", label: "Scripture of the Day" },
];

const SavedDevotionals = () => {
  const navigate = useNavigate();
  const { devotionals, saveDevotional, deleteDevotional } = useDevotionals();
  const { sermons, updateSermon, deleteSermon } = useSermons();
  const { scriptures, deleteScripture } = useSavedScriptures();

  const [tab, setTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    return p && ["devotionals", "sermons", "scriptures", "words", "daily"].includes(p) ? p : "devotionals";
  });
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const match = (...parts: (string | null | undefined)[]) =>
    !q || parts.filter(Boolean).join(" ").toLowerCase().includes(q);

  const devs = useMemo(
    () =>
      devotionals
        .filter((d) => (savedOnly ? d.saved : true))
        .filter((d) => match(d.title, d.topic, d.scripture, d.scriptureReference, d.reflection, d.prayer, d.declaration)),
    [devotionals, savedOnly, q, match],
  );

  const serms = useMemo(
    () =>
      sermons
        .filter((s) => (savedOnly ? s.bookmarked : true))
        .filter((s) => match(s.title, s.topic, s.style, s.notes, JSON.stringify(s.content ?? {}))),
    [sermons, savedOnly, q, match],
  );

  const scrs = useMemo(
    () => scriptures.filter((s) => match(s.reference, s.snippet, s.paraphrase, s.context, s.query)),
    [scriptures, q, match],
  );

  const words = useMemo(() => {
    try {
      const raw = localStorage.getItem("devotly_library_words");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((w: { word?: string; meaning?: string; reference?: string }) => match(w.word, w.meaning, w.reference, w.verse)) : [];
    } catch { return []; }
  }, [q]);

  const daily = useMemo(() => {
    try {
      const raw = localStorage.getItem("devotly_library_daily_scriptures");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((s: { reference?: string; text?: string }) => match(s.reference, s.text)) : [];
    } catch { return []; }
  }, [q]);

  const counts: Record<Tab, number> = {
    devotionals: devs.length,
    sermons: serms.length,
    scriptures: scrs.length,
    words: words.length,
    daily: daily.length,
  };

  const toggleSave = async (id: string) => {
    const d = devotionals.find((x) => x.id === id);
    if (d) await saveDevotional({ ...d, saved: !d.saved });
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="font-display text-lg font-semibold mb-3">My Library</h1>
        <div className="relative">
          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search devotionals, sermons, highlights, scriptures…"
            className="pl-9 pr-9 rounded-xl bg-card"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all",
                tab === t.value ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground",
              )}
            >
              {t.label} ({counts[t.value]})
            </button>
          ))}
        </div>
      </div>

      {(tab === "devotionals" || tab === "sermons") && (
        <div className="px-6 pt-4">
          <button
            onClick={() => setSavedOnly((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
              savedOnly ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", savedOnly && "fill-current")} />
            {tab === "sermons" ? "Bookmarked only" : "Saved only"}
          </button>
        </div>
      )}

      <div className="px-6 pt-4 stagger">
        {tab === "devotionals" && (
          devs.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-7 w-7" />}
              title="No devotionals yet"
              description="Generate your first devotional to begin your daily walk."
            />
          ) : (
            devs.map((d) => (
              <div key={d.id} className="bg-card rounded-xl border border-border mb-3 overflow-hidden">
                <div className="flex items-start">
                  <button className="flex-1 text-left p-4" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                    <p className="font-display font-semibold text-sm">{d.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.scriptureReference} · {d.topic}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                  </button>
                  <div className="flex items-center gap-1 p-3">
                    {d.completed && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    {d.saved && <Bookmark className="h-4 w-4 text-primary fill-primary" />}
                    <ConfirmDelete
                      title="Delete this devotional?"
                      description={`"${d.title}" and its highlights will be permanently removed.`}
                      onConfirm={async () => { await deleteDevotional(d.id); toast.success("Devotional deleted"); }}
                      trigger={(open) => (
                        <button onClick={open} className="text-muted-foreground p-1" aria-label="Delete devotional">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    />
                  </div>
                </div>

                {expanded === d.id && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="bg-muted rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Scripture</p>
                      <p className="text-sm italic">{d.scripture}</p>
                    </div>
                    {d.greekLatinInsights && (
                      <div className="bg-accent/50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-1">📜 Greek &amp; Latin</p>
                        <p className="text-sm">{d.greekLatinInsights}</p>
                      </div>
                    )}
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Reflection</p>
                      <p className="text-sm whitespace-pre-line">{d.reflection}</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">🙏 Prayer</p>
                      <p className="text-sm italic">{d.prayer}</p>
                    </div>
                    {d.declaration && (
                      <div className="bg-muted rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">✨ Declaration</p>
                        <p className="text-sm font-medium">{d.declaration}</p>
                      </div>
                    )}
                    <button onClick={() => toggleSave(d.id)} className="flex items-center gap-1.5 text-xs text-primary font-medium mt-2">
                      <Bookmark className={cn("h-3.5 w-3.5", d.saved && "fill-current")} />
                      {d.saved ? "Unsave" : "Save"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        )}

        {tab === "sermons" && (
          serms.length === 0 ? (
            <EmptyState
              icon={<ScrollText className="h-7 w-7" />}
              title="No sermons yet"
              description="Create a full sermon & Bible study on any passage or topic."
            />
          ) : (
            serms.map((s) => (
              <div key={s.id} className="bg-card rounded-xl border border-border mb-3 p-4 flex items-start gap-3">
                <button className="flex-1 text-left" onClick={() => navigate(`/sermon?open=${s.id}`)}>
                  <div className="flex items-center gap-2 mb-1">
                    {s.bookmarked && <Bookmark className="h-3 w-3 text-primary fill-primary" />}
                    {s.completed && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">{s.style}</span>
                  </div>
                  <p className="font-display font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.topic} · {new Date(s.createdAt).toLocaleDateString()}</p>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateSermon(s.id, { bookmarked: !s.bookmarked })}
                    className="text-muted-foreground p-1"
                    aria-label="Bookmark sermon"
                  >
                    <Bookmark className={cn("h-4 w-4", s.bookmarked && "fill-primary text-primary")} />
                  </button>
                  <ConfirmDelete
                    title="Delete this sermon?"
                    description={`"${s.title}" will be permanently removed.`}
                    onConfirm={async () => { await deleteSermon(s.id); toast.success("Sermon deleted"); }}
                    trigger={(open) => (
                      <button onClick={open} className="text-muted-foreground p-1" aria-label="Delete sermon">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  />
                </div>
              </div>
            ))
          )
        )}

        {tab === "scriptures" && (
          scrs.length === 0 ? (
            <EmptyState
              icon={<Quote className="h-7 w-7" />}
              title="No saved scriptures"
              description="Save results from Scripture search to keep them here."
            />
          ) : (
            scrs.map((s) => (
              <div key={s.id} className="bg-card rounded-xl border border-border mb-3 p-4 flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-display font-semibold text-sm">{s.reference}</p>
                  {s.snippet && <p className="text-sm italic border-l-2 border-primary/40 pl-3 my-2">“{s.snippet}”</p>}
                  {s.paraphrase && <p className="text-xs text-muted-foreground">{s.paraphrase}</p>}
                  {s.context && <p className="text-xs text-muted-foreground/80 mt-1">{s.context}</p>}
                  {s.query && <p className="text-[10px] text-muted-foreground/70 mt-2">Searched: “{s.query}”</p>}
                </div>
                <ConfirmDelete
                  title="Remove this scripture?"
                  onConfirm={async () => { await deleteScripture(s.id); toast.success("Scripture removed"); }}
                  trigger={(open) => (
                    <button onClick={open} className="text-muted-foreground p-1" aria-label="Delete saved scripture">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                />
              </div>
            ))
          )
        )}

        {tab === "words" && (
          words.length === 0 ? (
            <EmptyState icon={<Quote className="h-7 w-7" />} title="No Word of the Day yet" description="When you tap a Word of the Day notification, it’s saved here for preview." />
          ) : (
            words.map((w: { id: string; word: string; original?: string; transliteration?: string; meaning: string; reference: string; verse: string; application?: string; date: string }) => (
              <div key={w.id} className="bg-card rounded-xl border border-border mb-3 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">Word of the Day</span>
                  <span className="text-[10px] text-muted-foreground">{w.date}</span>
                </div>
                <p className="font-display font-bold text-base">{w.word} {w.original && <span className="text-sm font-normal text-muted-foreground">· {w.original} ({w.transliteration})</span>}</p>
                <p className="text-sm text-muted-foreground mt-1">{w.meaning}</p>
                <div className="bg-muted rounded-lg p-3 mt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{w.reference}</p>
                  <p className="text-sm italic">“{w.verse}”</p>
                </div>
                {w.application && <p className="text-xs text-muted-foreground mt-2">{w.application}</p>}
              </div>
            ))
          )
        )}

        {tab === "daily" && (
          daily.length === 0 ? (
            <EmptyState icon={<BookOpen className="h-7 w-7" />} title="No Scripture of the Day yet" description="Tap a Scripture of the Day notification to save it here and preview anytime." />
          ) : (
            daily.map((s: { id: string; reference: string; text: string; reflection?: string; date: string }) => (
              <div key={s.id} className="bg-card rounded-xl border border-border mb-3 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">Scripture of the Day</span>
                  <span className="text-[10px] text-muted-foreground">{s.date}</span>
                </div>
                <p className="font-display font-semibold text-sm">{s.reference}</p>
                <p className="text-sm italic border-l-2 border-primary/40 pl-3 my-2">“{s.text}”</p>
                {s.reflection && <p className="text-xs text-muted-foreground">{s.reflection}</p>}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default SavedDevotionals;
