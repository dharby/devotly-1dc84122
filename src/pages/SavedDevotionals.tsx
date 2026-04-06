import { useState } from "react";
import { BookOpen, Bookmark, X } from "lucide-react";
import { useDevotionals } from "@/hooks/useDevotionals";

const SavedDevotionals = () => {
  const { devotionals, saveDevotional } = useDevotionals();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "saved">("all");

  const filtered = filter === "saved" ? devotionals.filter((d) => d.saved) : devotionals;

  const toggleSave = async (id: string) => {
    const d = devotionals.find((x) => x.id === id);
    if (d) await saveDevotional({ ...d, saved: !d.saved });
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="font-display text-lg font-semibold">My Devotionals</h1>
      </div>

      {/* Filter */}
      <div className="px-6 pt-4 flex gap-2 mb-4">
        {(["all", "saved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {f === "all" ? "All" : "Saved"}
          </button>
        ))}
      </div>

      <div className="px-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No devotionals yet</p>
          </div>
        ) : (
          filtered.map((d) => (
            <div key={d.id} className="bg-card rounded-xl border border-border mb-3 overflow-hidden">
              <button className="w-full text-left p-4" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-display font-semibold text-sm">{d.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.scriptureReference} · {d.topic}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {d.completed && (
                      <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">✓ Done</span>
                    )}
                  </div>
                </div>
              </button>

              {expanded === d.id && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Scripture</p>
                    <p className="text-sm italic">{d.scripture}</p>
                  </div>

                  {d.greekLatinInsights && (
                    <div className="bg-accent/50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-1">📜 Greek & Latin</p>
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

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(d.id); }}
                    className="flex items-center gap-1.5 text-xs text-primary font-medium mt-2"
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${d.saved ? "fill-current" : ""}`} />
                    {d.saved ? "Unsave" : "Save"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedDevotionals;
