import { useState } from "react";
import { ChevronLeft, Search, BookOpen, Sparkles, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ScriptureResult {
  reference: string;
  translationSnippet?: string;
  paraphrase: string;
  context?: string;
  confidence?: "high" | "medium" | "low";
  themes?: string[];
}

const EXAMPLES = [
  "the verse about God's plans to prosper you",
  "cast your cares on him",
  "iron sharpens iron",
  "God will never give you more than you can bear",
  "faith is being sure of what we hope for",
];

const confidenceStyle: Record<string, string> = {
  high: "bg-primary/15 text-primary",
  medium: "bg-secondary/40 text-secondary-foreground",
  low: "bg-muted text-muted-foreground",
};

const ScriptureSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState<ScriptureResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const search = async (q?: string) => {
    const term = (q ?? query).trim();
    if (term.length < 2) { toast.error("Type a phrase or idea first"); return; }
    setQuery(term);
    setLoading(true);
    setResults([]);
    setSummary("");
    try {
      const { data, error } = await supabase.functions.invoke("find-scripture", { body: { query: term } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSummary(data?.summary ?? "");
      setResults(Array.isArray(data?.results) ? data.results : []);
      if (!data?.results?.length) toast("No close matches found — try rephrasing.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (r: ScriptureResult) => {
    await navigator.clipboard.writeText(`${r.reference} — ${r.translationSnippet ?? r.paraphrase}`);
    setCopied(r.reference);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold">Find a Scripture</h1>
        </div>
      </div>

      <div className="px-6 pt-6 animate-fade-in">
        <p className="text-sm text-muted-foreground mb-4">
          Describe the verse in your own words — a paraphrase, an idea, or a half-remembered line — and get every likely chapter &amp; verse.
        </p>

        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. be still and know that I am God"
            className="w-full bg-card border border-border rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        <Button className="w-full rounded-xl" onClick={() => search()} disabled={loading}>
          {loading ? (
            <><Sparkles className="h-4 w-4 mr-2 animate-pulse" /> Searching Scripture…</>
          ) : (
            <><Search className="h-4 w-4 mr-2" /> Find references</>
          )}
        </Button>

        {!results.length && !loading && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Try one of these</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => search(ex)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {summary && (
          <div className="mt-6 bg-accent rounded-2xl p-4 border border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">What you're describing</p>
            <p className="text-sm">{summary}</p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {results.map((r, i) => (
            <div key={`${r.reference}-${i}`} className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="font-display font-bold text-base">{r.reference}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.confidence && (
                    <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full", confidenceStyle[r.confidence] ?? confidenceStyle.low)}>
                      {r.confidence}
                    </span>
                  )}
                  <button onClick={() => copy(r)} className="text-muted-foreground hover:text-foreground">
                    {copied === r.reference ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {r.translationSnippet && (
                <p className="text-sm italic border-l-2 border-primary/40 pl-3 mb-2">“{r.translationSnippet}”</p>
              )}
              <p className="text-sm text-muted-foreground">{r.paraphrase}</p>
              {r.context && <p className="text-xs text-muted-foreground mt-2 opacity-80">{r.context}</p>}

              <div className="flex flex-wrap gap-1.5 mt-3">
                {(r.themes ?? []).map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="rounded-lg text-xs"
                  onClick={() => navigate(`/generate?topic=${encodeURIComponent(r.reference)}`)}>
                  Devotional
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg text-xs"
                  onClick={() => navigate(`/sermon?topic=${encodeURIComponent(r.reference)}`)}>
                  Sermon
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptureSearch;
