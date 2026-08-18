import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ScrollText, RefreshCw, Sparkles, BookOpen, Quote, Users, Heart, Bookmark, CheckCircle2, Library, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSermons, type SermonRecord } from "@/hooks/useSermons";
import { sharePdf } from "@/lib/pdfExport";
import ConfirmDelete from "@/components/ConfirmDelete";
import SermonHighlighter from "@/components/SermonHighlighter";
import { Input } from "@/components/ui/input";
import { useHighlights } from "@/hooks/useHighlights";

interface SermonPoint {
  heading: string;
  scripture: string;
  exposition: string;
  illustration: string;
  application: string;
}
interface SermonContent {
  title: string;
  subtitle: string;
  mainScripture: string;
  mainScriptureReference: string;
  bigIdea: string;
  introduction: string;
  context: { historical: string; literary: string; author: string };
  wordStudy: { word: string; transliteration: string; meaning: string }[];
  points: SermonPoint[];
  crossReferences: { reference: string; text: string; connection: string }[];
  theologicalThemes: string[];
  commonMisunderstandings: string;
  personalStudyQuestions: string[];
  groupDiscussionQuestions: string[];
  callToAction: string;
  closingPrayer: string;
  benediction: string;
}

const styles = [
  { value: "expository", label: "Expository", emoji: "📖" },
  { value: "topical", label: "Topical", emoji: "🎯" },
  { value: "narrative", label: "Narrative", emoji: "📜" },
  { value: "evangelistic", label: "Evangelistic", emoji: "🕊️" },
];

const audiences = [
  { value: "general", label: "General" },
  { value: "youth", label: "Youth" },
  { value: "family", label: "Family" },
  { value: "seekers", label: "Seekers" },
];

const suggestedTopics = [
  "The Prodigal Son", "Sermon on the Mount", "Grace of God", "Faith of Abraham",
  "The Good Shepherd", "Suffering & Hope", "Fruit of the Spirit", "Kingdom of God",
  "The Cross", "Prayer that moves mountains",
];

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderHighlightedSermonText = (text: string, highlights: unknown) => {
  const hs = highlights as any[];
  if (!hs.length) return text;
  if (!text || typeof text !== "string") return text;
  const marks: string[] = [];
  let result = text;
  [...highlights]
    .sort((a, b) => b.text.length - a.text.length)
    .forEach((hl) => {
      const needle = hl.text.trim();
      if (!needle) return;
      const colorClass = hl.color;
      const pattern = new RegExp(escapeRegExp(escapeHtml(needle)).replace(/\s+/g, "\\s+"), "gi");
      result = result.replace(pattern, (match) => {
        const token = `\u0000H${marks.length}\u0000`;
        marks.push(`<mark class="${colorClass} rounded px-0.5 cursor-pointer" data-hid="${hl.id}">${match}</mark>`);
        return token;
      });
    });
  marks.forEach((m, i) => { result = result.split(`\u0000H${i}\u0000`).join(m); });
  return result;
};

export default function Sermon() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sermons, createSermon, updateSermon, deleteSermon, getSermonHighlights } = useSermons();
  const [active, setActive] = useState<SermonRecord | null>(null);
  const { highlights: sermonHighlights, addHighlight, removeHighlight } = useHighlights(undefined, active?.id);

  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [style, setStyle] = useState("expository");
  const [audience, setAudience] = useState("general");
  const [loading, setLoading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libQuery, setLibQuery] = useState("");

  useEffect(() => {
    if (searchParams.get("auto") === "1" && searchParams.get("topic") && !active && !loading) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load a saved sermon when arriving via ?open=<id> (from Library or Search).
  useEffect(() => {
    const openId = searchParams.get("open");
    if (!openId || loading) return;
    const found = sermons.find((s) => s.id === openId);
    if (found && (!active || active.id !== openId)) {
      setActive(found);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [searchParams, sermons, loading, active]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sermon", {
        body: { topic: topic.trim(), style, audience, length: "long" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const content = data as SermonContent;
      const rec = await createSermon({ topic: topic.trim(), style, audience, title: content.title, content });
      if (rec) {
        setActive(rec);
        pushRecentTopic(topic.trim(), "sermon");
        toast.success("Sermon saved to your library");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      toast.error(e.message || "Failed to generate sermon");
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = () => active && updateSermon(active.id, { bookmarked: !active.bookmarked }).then(() => {
    setActive({ ...active, bookmarked: !active.bookmarked });
    toast.success(!active.bookmarked ? "Bookmarked" : "Removed bookmark");
  });

  const toggleComplete = () => active && updateSermon(active.id, { completed: !active.completed }).then(() => {
    setActive({ ...active, completed: !active.completed });
    toast.success(!active.completed ? "Marked complete ✨" : "Marked incomplete");
  });

  // Click a highlighted <mark> to remove it (only when not selecting text).
  const handleMarkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "MARK" && target.dataset.hid) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) return;
      removeHighlight(target.dataset.hid);
    }
  };

  const removeSermon = async (id: string) => {
    await deleteSermon(id);
    if (active?.id === id) setActive(null);
    toast.success("Sermon deleted");
  };

  const shareAsPdf = async () => {
    if (!active) return;
    const c = active.content as SermonContent;
    const blocks = [
      { heading: `Main Scripture — ${c.mainScriptureReference}`, text: c.mainScripture, italic: true },
      { heading: "Big Idea", text: c.bigIdea },
      { heading: "Introduction", text: c.introduction },
      { heading: "Context", text: [
          c.context?.historical && `Historical: ${c.context.historical}`,
          c.context?.literary && `Literary: ${c.context.literary}`,
          c.context?.author && `Author: ${c.context.author}`,
        ].filter(Boolean).join("\n\n") },
      ...(c.wordStudy?.length ? [{ heading: "Word Study", text: c.wordStudy.map((w) => `${w.word} (${w.transliteration}) — ${w.meaning}`).join("\n\n") }] : []),
      ...(c.points || []).flatMap((pt, i) => [{
        heading: `${i + 1}. ${pt.heading}`,
        text: [pt.scripture && `Scripture: ${pt.scripture}`, pt.exposition, pt.illustration && `Illustration: ${pt.illustration}`, pt.application && `Application: ${pt.application}`]
          .filter(Boolean).join("\n\n"),
      }]),
      ...(c.crossReferences?.length ? [{ heading: "Cross References", text: c.crossReferences.map((r) => `${r.reference} — ${r.text}\n${r.connection}`).join("\n\n") }] : []),
      ...(c.theologicalThemes?.length ? [{ heading: "Theological Themes", text: c.theologicalThemes.join(", ") }] : []),
      ...(c.commonMisunderstandings ? [{ heading: "Common Misunderstandings", text: c.commonMisunderstandings }] : []),
      ...(c.personalStudyQuestions?.length ? [{ heading: "Personal Study Questions", text: c.personalStudyQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") }] : []),
      ...(c.groupDiscussionQuestions?.length ? [{ heading: "Group Discussion Questions", text: c.groupDiscussionQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") }] : []),
      ...(c.callToAction ? [{ heading: "Call to Action", text: c.callToAction }] : []),
      ...(c.closingPrayer ? [{ heading: "Closing Prayer", text: c.closingPrayer, italic: true }] : []),
    ];
    try {
      const result = await sharePdf({ title: c.title, subtitle: c.subtitle || active.topic, blocks, footer: "Devotly · Sermon & Bible Study" });
      toast.success(result === "shared" ? "Shared" : "PDF downloaded");
    } catch {
      toast.error("Could not create the PDF");
    }
  };

  const openSaved = (s: SermonRecord) => { setActive(s); setShowLibrary(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const sermon = active?.content as SermonContent | undefined;

  const filteredSermons = (() => {
    const q = libQuery.trim().toLowerCase();
    if (!q) return sermons;
    return sermons.filter((s) =>
      [s.title, s.topic, s.style, s.audience, s.notes, JSON.stringify(s.content ?? {})]
        .filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  })();

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => (active ? setActive(null) : showLibrary ? setShowLibrary(false) : navigate(-1))} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold flex-1">
            {active ? "Full Sermon" : showLibrary ? "Saved Sermons" : "Sermon & Bible Study"}
          </h1>
          {!active && !showLibrary && (
            <button onClick={() => setShowLibrary(true)} className="flex items-center gap-1.5 text-sm text-primary font-medium">
              <Library className="h-4 w-4" /> Library {sermons.length > 0 && <span className="text-xs">({sermons.length})</span>}
            </button>
          )}
        </div>
      </div>

      {showLibrary ? (
        <div className="px-6 pt-6 animate-fade-in">
          <Input
            value={libQuery}
            onChange={(e) => setLibQuery(e.target.value)}
            placeholder="Search saved sermons…"
            className="rounded-xl bg-card mb-4"
          />
          {filteredSermons.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              {sermons.length === 0 ? "No sermons yet. Generate your first one!" : "No sermons match that search."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredSermons.map((s) => (
                <div key={s.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <button onClick={() => openSaved(s)} className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        {s.bookmarked && <Bookmark className="h-3 w-3 text-primary fill-primary" />}
                        {s.completed && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                        <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">{s.style}</span>
                      </div>
                      <p className="font-display font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.topic} · {new Date(s.createdAt).toLocaleDateString()}</p>
                    </button>
                    <ConfirmDelete
                      title="Delete this sermon?"
                      description={`"${s.title}" and its notes will be permanently removed.`}
                      onConfirm={() => removeSermon(s.id)}
                      trigger={(open) => (
                        <button onClick={open} className="text-muted-foreground p-1" aria-label="Delete sermon">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !active || !sermon ? (
        <div className="px-6 pt-6 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cathedral shadow-cathedral mb-4">
              <ScrollText className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Preach the Word</h2>
            <p className="text-muted-foreground text-sm">
              Generate a full, extensive sermon and Bible study on any topic or passage.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Topic or Passage</label>
              <Textarea
                placeholder="e.g. The Prodigal Son, Romans 8, Grace, Suffering..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="resize-none h-20 bg-card border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                      style === s.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Audience</label>
              <div className="flex flex-wrap gap-2">
                {audiences.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAudience(a.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                      audience === a.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Suggested Topics</label>
              <div className="flex flex-wrap gap-2">
                {suggestedTopics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="golden"
              size="lg"
              className="w-full text-base rounded-xl h-12"
              onClick={generate}
              disabled={!topic.trim() || loading}
            >
              {loading ? (
                <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Preparing the sermon...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Generate Full Sermon</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <SermonHighlighter addHighlight={addHighlight}>
        <article className="px-6 pt-4 pb-10 animate-fade-in max-w-2xl mx-auto space-y-8" onClick={handleMarkClick}>
          {/* Persistent action bar */}
          <div className="flex gap-2 -mb-2">
            <Button variant={active.bookmarked ? "golden" : "outline"} size="sm" className="flex-1 rounded-xl" onClick={toggleBookmark}>
              <Bookmark className={cn("h-4 w-4 mr-1", active.bookmarked && "fill-current")} />
              {active.bookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            <Button variant={active.completed ? "secondary" : "default"} size="sm" className="flex-1 rounded-xl" onClick={toggleComplete}>
              <CheckCircle2 className={cn("h-4 w-4 mr-1", active.completed && "fill-current")} />
              {active.completed ? "Completed" : "Mark done"}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={shareAsPdf} title="Share as PDF">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <header className="text-center border-b border-border pb-6">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Sermon</p>
            <h1 className="font-display text-3xl font-bold leading-tight mb-2">{sermon.title}</h1>
            <p className="text-muted-foreground italic">{sermon.subtitle}</p>
          </header>

          <Section icon={<Quote className="h-4 w-4" />} label="Main Scripture" title={sermon.mainScriptureReference}>
            <blockquote className="border-l-4 border-primary/60 pl-4 italic text-foreground/90 whitespace-pre-line">
              {renderHighlightedSermonText(sermon.mainScripture, sermonHighlights)}
            </blockquote>
          </Section>

          <div className="bg-accent/50 border border-border rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Big Idea</p>
            <p className="font-display text-lg leading-snug">{sermon.bigIdea}</p>
          </div>

          <Section icon={<BookOpen className="h-4 w-4" />} label="Introduction">
            <p className="whitespace-pre-line leading-relaxed">{renderHighlightedSermonText(sermon.introduction, sermonHighlights)}</p>
          </Section>

          <Section label="Context">
            <div className="space-y-3 text-sm">
              <div><span className="font-semibold">Historical: </span>{sermon.context?.historical}</div>
              <div><span className="font-semibold">Literary: </span>{sermon.context?.literary}</div>
              <div><span className="font-semibold">Author: </span>{sermon.context?.author}</div>
            </div>
          </Section>

          {sermon.wordStudy?.length > 0 && (
            <Section label="Original Language Word Study">
              <div className="space-y-3">
                {sermon.wordStudy.map((w, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4">
                    <p className="font-display font-bold text-primary">
                      {w.word} <span className="text-muted-foreground text-sm font-body italic">({w.transliteration})</span>
                    </p>
                    <p className="text-sm mt-1 leading-relaxed">{w.meaning}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {sermon.points?.map((p, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl text-primary/40 font-bold">{i + 1}</span>
                <h2 className="font-display text-2xl font-bold leading-tight">{p.heading}</h2>
              </div>
              <blockquote className="border-l-4 border-primary/60 pl-4 italic text-sm text-foreground/80 whitespace-pre-line">
                {renderHighlightedSermonText(p.scripture, sermonHighlights)}
              </blockquote>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Exposition</p>
                <p className="whitespace-pre-line leading-relaxed">{renderHighlightedSermonText(p.exposition, sermonHighlights)}</p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Illustration</p>
                <p className="text-sm leading-relaxed">{renderHighlightedSermonText(p.illustration, sermonHighlights)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Application</p>
                <p className="text-sm leading-relaxed whitespace-pre-line">{renderHighlightedSermonText(p.application, sermonHighlights)}</p>
              </div>
            </div>
          ))}

          {sermon.crossReferences?.length > 0 && (
            <Section label="Cross References">
              <div className="space-y-3">
                {sermon.crossReferences.map((c, i) => (
                  <div key={i} className="border-l-2 border-border pl-3">
                    <p className="text-xs font-semibold text-primary">{c.reference}</p>
                    <p className="text-sm italic">{c.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">→ {c.connection}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {sermon.theologicalThemes?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sermon.theologicalThemes.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-accent text-xs font-medium">{t}</span>
              ))}
            </div>
          )}

          {sermon.commonMisunderstandings && (
            <Section label="Common Misunderstandings">
              <p className="text-sm leading-relaxed whitespace-pre-line">{sermon.commonMisunderstandings}</p>
            </Section>
          )}

          <Section icon={<BookOpen className="h-4 w-4" />} label="Personal Study Questions">
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {sermon.personalStudyQuestions?.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </Section>

          <Section icon={<Users className="h-4 w-4" />} label="Group Discussion">
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              {sermon.groupDiscussionQuestions?.map((q, i) => <li key={i}>{q}</li>)}
            </ol>
          </Section>

          <Section icon={<Heart className="h-4 w-4" />} label="Call to Action">
            <p className="whitespace-pre-line leading-relaxed">{renderHighlightedSermonText(sermon.callToAction, sermonHighlights)}</p>
          </Section>

          <div className="bg-gradient-cathedral text-primary-foreground rounded-2xl p-6 shadow-cathedral">
            <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Closing Prayer</p>
            <p className="whitespace-pre-line leading-relaxed">{renderHighlightedSermonText(sermon.closingPrayer, sermonHighlights)}</p>
          </div>

          <div className="text-center italic font-display text-lg text-primary py-4 border-t border-border">
            {sermon.benediction}
          </div>

          <Button variant="outline" className="w-full" onClick={() => { setActive(null); setTopic(""); }}>
            <RefreshCw className="h-4 w-4 mr-2" /> Generate Another
          </Button>
        </article>
        </SermonHighlighter>
      )}
    </div>
  );
}

function Section({ label, title, children, icon }: { label: string; title?: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-primary">{icon}</span>}
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">{label}</p>
      </div>
      {title && <h3 className="font-display text-xl font-bold mb-2">{title}</h3>}
      {children}
    </section>
  );
}

// ---- Recent topics helper (also used by devotional generator) ----
export function pushRecentTopic(topic: string, kind: "devotional" | "sermon") {
  try {
    const key = "recent_topics";
    const raw = localStorage.getItem(key);
    const list: { topic: string; kind: string; at: number }[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((x) => x.topic.toLowerCase() !== topic.toLowerCase());
    filtered.unshift({ topic, kind, at: Date.now() });
    localStorage.setItem(key, JSON.stringify(filtered.slice(0, 12)));
  } catch (e) {
      // ignore
    }
}