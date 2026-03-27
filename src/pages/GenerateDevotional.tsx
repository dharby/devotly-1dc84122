import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw, Bookmark, CheckCircle2, ChevronLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Devotional,
  generateSampleDevotional,
  saveDevotional,
  markDayComplete,
} from "@/lib/devotionalStore";

const tones = [
  { value: "personal" as const, label: "Personal", emoji: "🙏" },
  { value: "family" as const, label: "Family", emoji: "🏠" },
  { value: "encouraging" as const, label: "Encouraging", emoji: "💛" },
  { value: "deep" as const, label: "Deep Study", emoji: "📖" },
];

const GenerateDevotional = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [tone, setTone] = useState<Devotional["tone"]>("personal");
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setSaved(false);
    setCompleted(false);
    // Simulate AI generation delay
    setTimeout(() => {
      const dev = generateSampleDevotional(topic.trim(), tone);
      setDevotional(dev);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSave = () => {
    if (!devotional) return;
    devotional.saved = true;
    saveDevotional(devotional);
    setSaved(true);
  };

  const handleComplete = () => {
    if (!devotional) return;
    devotional.completed = true;
    saveDevotional(devotional);
    const today = new Date().toISOString().split("T")[0];
    markDayComplete(today, devotional.id);
    setCompleted(true);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold">Generate Devotional</h1>
        </div>
      </div>

      {!devotional ? (
        <div className="px-6 pt-6 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-golden shadow-golden mb-4">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              What's on your heart?
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter any topic and receive a Spirit-led devotional
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Topic</label>
              <Textarea
                placeholder="e.g. faith, anxiety, purpose, gratitude, marriage..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="resize-none h-20 bg-card border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                      tone === t.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="golden"
              size="lg"
              className="w-full text-base rounded-xl h-12"
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Devotional
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-6 pt-6 animate-fade-in">
          {/* Devotional Content */}
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
              <span className="text-xs font-semibold text-primary-foreground/80 uppercase tracking-wider">
                Scripture
              </span>
            </div>
            <p className="font-display text-primary-foreground text-base italic leading-relaxed">
              {devotional.scripture}
            </p>
          </div>

          {/* Greek/Latin Insights */}
          {devotional.greekLatinInsights && (
            <div className="bg-accent rounded-xl p-4 mb-5 border border-border">
              <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-2">
                📜 Greek & Latin Insights
              </p>
              <p className="text-sm text-accent-foreground/90 leading-relaxed">
                {devotional.greekLatinInsights}
              </p>
            </div>
          )}

          {/* Reflection */}
          <div className="mb-5">
            <h3 className="font-display text-lg font-semibold mb-2">Reflection</h3>
            <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {devotional.reflection}
            </div>
          </div>

          {/* Prayer */}
          <div className="bg-card rounded-xl p-5 mb-5 border border-border">
            <h3 className="font-display text-lg font-semibold mb-2">🙏 Prayer</h3>
            <p className="text-sm leading-relaxed text-foreground/90 italic">
              {devotional.prayer}
            </p>
          </div>

          {/* Declaration */}
          {devotional.declaration && (
            <div className="bg-muted rounded-xl p-5 mb-6 border border-primary/20">
              <h3 className="font-display text-lg font-semibold mb-2">✨ Declaration</h3>
              <p className="text-sm leading-relaxed text-foreground font-medium">
                {devotional.declaration}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <Button
              variant={saved ? "secondary" : "golden"}
              className="flex-1 rounded-xl"
              onClick={handleSave}
              disabled={saved}
            >
              <Bookmark className={cn("h-4 w-4 mr-1", saved && "fill-current")} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              variant={completed ? "secondary" : "default"}
              className="flex-1 rounded-xl"
              onClick={handleComplete}
              disabled={completed}
            >
              <CheckCircle2 className={cn("h-4 w-4 mr-1", completed && "fill-current")} />
              {completed ? "Completed" : "Complete"}
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={handleRegenerate}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      )}
    </div>
  );
};

export default GenerateDevotional;
