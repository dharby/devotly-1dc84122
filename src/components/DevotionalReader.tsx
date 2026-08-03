import { useState, useCallback, useRef } from "react";
import { BookOpen, Maximize2, Minimize2, Bookmark, CheckCircle2, RefreshCw, Search, X, Highlighter, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDevotionals, type Devotional } from "@/hooks/useDevotionals";
import { useTracker } from "@/hooks/useTracker";
import { useHighlights } from "@/hooks/useHighlights";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sharePdf } from "@/lib/pdfExport";

interface DevotionalReaderProps {
  devotional: Devotional;
  tones: { value: string; label: string }[];
  onRegenerate: () => void;
}

const HIGHLIGHT_COLORS = [
  { value: "yellow", class: "bg-yellow-200/60 dark:bg-yellow-500/30" },
  { value: "green", class: "bg-green-200/60 dark:bg-green-500/30" },
  { value: "blue", class: "bg-blue-200/60 dark:bg-blue-500/30" },
  { value: "pink", class: "bg-pink-200/60 dark:bg-pink-500/30" },
];

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DevotionalReader = ({ devotional, tones, onRegenerate }: DevotionalReaderProps) => {
  const [saved, setSaved] = useState(devotional.saved);
  const [completed, setCompleted] = useState(devotional.completed);
  const [focusMode, setFocusMode] = useState(false);
  const [highlightColor, setHighlightColor] = useState("yellow");
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);
  const [wordLookup, setWordLookup] = useState<{ word: string; definition: string | null; loading: boolean } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedTextRef = useRef<string>("");

  const { saveDevotional } = useDevotionals();
  const { markDayComplete } = useTracker();
  const { highlights, addHighlight, removeHighlight } = useHighlights(devotional.id);

  const handleSave = async () => {
    await saveDevotional({ ...devotional, saved: true });
    setSaved(true);
  };

  const handleComplete = async () => {
    await saveDevotional({ ...devotional, completed: true });
    const today = new Date().toISOString().split("T")[0];
    await markDayComplete(today, devotional.id);
    setCompleted(true);
  };

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setSelectionPos(null);
      return;
    }
    const selectedText = selection.toString().trim();
    selectedTextRef.current = selectedText;
    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const top = Math.max(60, rect.top + window.scrollY - 52);
      const left = Math.min(window.innerWidth - 180, Math.max(12, rect.left + rect.width / 2 - 90));
      setSelectionPos({ top, left });
    } catch {
      setSelectionPos({ top: window.scrollY + 80, left: 20 });
    }
  }, []);

  const handleAddHighlight = async (color?: string) => {
    const selectedText = selectedTextRef.current;
    if (!selectedText) return;
    await addHighlight({ text: selectedText, section: "content", color: color || highlightColor });
    setSelectionPos(null);
    window.getSelection()?.removeAllRanges();
    toast.success("Highlighted ✨");
  };

  const lookupWord = async () => {
    const selectedText = selectedTextRef.current;
    if (!selectedText) return;
    const word = selectedText.split(/\s+/)[0];
    setWordLookup({ word, definition: null, loading: true });
    setSelectionPos(null);
    window.getSelection()?.removeAllRanges();
    try {
      const { data, error } = await supabase.functions.invoke("define-word", { body: { word } });
      if (error) throw error;
      setWordLookup({ word, definition: data?.definition || "No definition found.", loading: false });
    } catch {
      setWordLookup({ word, definition: "Could not look up this word. Try again.", loading: false });
    }
  };

  // Escape first, then match highlights with flexible whitespace so a selection
  // that spans several words, lines or paragraphs still highlights correctly.
  const renderHighlightedText = (text: string) => {
    const escaped = escapeHtml(text);
    if (!highlights.length) return escaped;
    const marks: string[] = [];
    let result = escaped;
    [...highlights]
      .sort((a, b) => b.text.length - a.text.length)
      .forEach((hl) => {
        const needle = hl.text.trim();
        if (!needle) return;
        const colorClass = HIGHLIGHT_COLORS.find((c) => c.value === hl.color)?.class || "";
        const pattern = new RegExp(escapeRegExp(escapeHtml(needle)).replace(/\s+/g, "\\s+"), "gi");
        result = result.replace(pattern, (match) => {
          const token = `\u0000H${marks.length}\u0000`;
          marks.push(`<mark class="${colorClass} rounded px-0.5">${match}</mark>`);
          return token;
        });
      });
    marks.forEach((m, i) => { result = result.split(`\u0000H${i}\u0000`).join(m); });
    return result;
  };

  const handleSharePdf = async () => {
    const blocks = [
      { heading: `Scripture — ${devotional.scriptureReference}`, text: devotional.scripture, italic: true },
      ...(devotional.translations || []).map((t) => ({ heading: t.version, text: t.text, italic: true })),
      ...(devotional.greekLatinInsights ? [{ heading: "Greek & Latin Insights", text: devotional.greekLatinInsights }] : []),
      { heading: "Reflection", text: devotional.reflection },
      { heading: "Prayer", text: devotional.prayer },
      ...(devotional.declaration ? [{ heading: "Declaration", text: devotional.declaration }] : []),
      ...(highlights.length
        ? [{ heading: "Your Highlights", text: highlights.map((h) => `\u201C${h.text}\u201D`).join("\n\n"), italic: true, small: true }]
        : []),
    ];
    try {
      const result = await sharePdf({
        title: devotional.title,
        subtitle: `${devotional.topic} · ${devotional.scriptureReference} · Devotly`,
        blocks,
        footer: "Devotly · Daily Devotional",
      });
      toast.success(result === "shared" ? "Shared" : "PDF downloaded");
    } catch {
      toast.error("Could not create the PDF");
    }
  };

  return (
    <div
      className={cn("animate-fade-in relative", focusMode ? "focus-mode px-6 pt-4 pb-20" : "px-6 pt-6")}
      ref={contentRef}
      onMouseUp={handleTextSelect}
      onTouchEnd={handleTextSelect}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2 mb-2">
        {highlights.length > 0 && (
          <span className="text-xs text-muted-foreground mr-auto">
            <Highlighter className="h-3 w-3 inline mr-1" />
            {highlights.length} highlight{highlights.length > 1 ? "s" : ""}
          </span>
        )}
        <button onClick={() => setFocusMode(!focusMode)} className="text-muted-foreground hover:text-foreground p-2 rounded-lg" title={focusMode ? "Exit focus mode" : "Focus mode"}>
          {focusMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Floating Highlight Bar — anchored near selection */}
      {selectionPos && (
        <div
          className="absolute z-50 bg-card border border-border rounded-full shadow-lg px-2 py-1.5 flex items-center gap-1 animate-fade-in"
          style={{ top: selectionPos.top, left: selectionPos.left }}
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => { setHighlightColor(c.value); handleAddHighlight(c.value); }}
              className={cn("w-7 h-7 rounded-full transition-transform hover:scale-110", c.class)}
              title={`Highlight ${c.value}`}
            />
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <button onClick={lookupWord} className="px-2 py-1 text-xs font-medium text-foreground hover:text-primary flex items-center gap-1">
            <Search className="h-3 w-3" /> Define
          </button>
          <button onClick={() => setSelectionPos(null)} className="text-muted-foreground p-1"><X className="h-3 w-3" /></button>
          <span className="sr-only">Highlight selection</span>
        </div>
      )}

      {/* Word Definition Popup */}
      {wordLookup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setWordLookup(null)}>
          <div className="bg-card border-t border-border rounded-t-2xl w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold capitalize">{wordLookup.word}</h3>
              <button onClick={() => setWordLookup(null)} className="text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            {wordLookup.loading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Looking up definition...</p>
            ) : (
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{wordLookup.definition}</p>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold mb-1">{devotional.title}</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {devotional.topic} · {tones.find((t) => t.value === devotional.tone)?.label}
        </p>
      </div>

      {/* Scripture */}
      <div className="bg-gradient-golden rounded-xl p-5 mb-5 shadow-warm">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary-foreground/80" />
          <span className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">Scripture</span>
        </div>
        <p className="font-display text-primary-foreground text-base italic leading-relaxed" dangerouslySetInnerHTML={{ __html: renderHighlightedText(devotional.scripture) }} />
      </div>

      {/* Other translations */}
      {devotional.translations && devotional.translations.length > 0 && (
        <div className="mb-5 space-y-2">
          {devotional.translations.map((t) => (
            <div key={t.version} className="bg-card border border-border rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">{t.version}</p>
              <p className="text-sm italic leading-relaxed text-foreground/90" dangerouslySetInnerHTML={{ __html: renderHighlightedText(t.text) }} />
            </div>
          ))}
        </div>
      )}

      {/* Greek/Latin Insights */}
      {devotional.greekLatinInsights && (
        <div className="bg-accent rounded-xl p-4 mb-5 border border-border">
          <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-2">📜 Greek & Latin Insights</p>
          <p className="text-sm text-accent-foreground/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderHighlightedText(devotional.greekLatinInsights) }} />
        </div>
      )}

      {/* Reflection */}
      <div className="mb-5">
        <h3 className="font-display text-lg font-semibold mb-2">Reflection</h3>
        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: renderHighlightedText(devotional.reflection) }} />
      </div>

      {/* Prayer */}
      <div className="bg-card rounded-xl p-5 mb-5 border border-border">
        <h3 className="font-display text-lg font-semibold mb-2">🙏 Prayer</h3>
        <p className="text-sm leading-relaxed text-foreground/90 italic" dangerouslySetInnerHTML={{ __html: renderHighlightedText(devotional.prayer) }} />
      </div>

      {/* Declaration */}
      {devotional.declaration && (
        <div className="bg-muted rounded-xl p-5 mb-6 border border-primary/20">
          <h3 className="font-display text-lg font-semibold mb-2">✨ Declaration</h3>
          <p className="text-sm leading-relaxed text-foreground font-medium" dangerouslySetInnerHTML={{ __html: renderHighlightedText(devotional.declaration) }} />
        </div>
      )}

      {/* Highlights List */}
      {highlights.length > 0 && !focusMode && (
        <div className="mb-6">
          <h3 className="font-display text-sm font-semibold mb-2 flex items-center gap-1">
            <Highlighter className="h-4 w-4 text-primary" /> Your Highlights
          </h3>
          <div className="space-y-2">
            {highlights.map((hl) => {
              const colorClass = HIGHLIGHT_COLORS.find((c) => c.value === hl.color)?.class || "";
              return (
                <div key={hl.id} className={cn("rounded-lg px-3 py-2 text-xs flex items-start gap-2", colorClass)}>
                  <span className="flex-1 italic">"{hl.text}"</span>
                  <button onClick={() => removeHighlight(hl.id)} className="text-muted-foreground shrink-0"><X className="h-3 w-3" /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {!focusMode && (
        <>
          <div className="flex gap-3 mb-4">
            <Button variant={saved ? "secondary" : "golden"} className="flex-1 rounded-xl" onClick={handleSave} disabled={saved}>
              <Bookmark className={cn("h-4 w-4 mr-1", saved && "fill-current")} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button variant={completed ? "secondary" : "default"} className="flex-1 rounded-xl" onClick={handleComplete} disabled={completed}>
              <CheckCircle2 className={cn("h-4 w-4 mr-1", completed && "fill-current")} />
              {completed ? "Completed" : "Complete"}
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={handleSharePdf}>
              <Share2 className="h-4 w-4 mr-2" /> Share PDF
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DevotionalReader;
