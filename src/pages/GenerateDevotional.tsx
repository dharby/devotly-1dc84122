import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Devotional, generateId } from "@/lib/devotionalStore";
import DevotionalReader from "@/components/DevotionalReader";

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

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-devotional", {
        body: { topic: topic.trim(), tone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const dev: Devotional = {
        id: generateId(),
        title: data.title || "Daily Devotional",
        topic: topic.trim(),
        tone,
        scripture: data.scripture || "",
        scriptureReference: data.scriptureReference || "",
        greekLatinInsights: data.greekLatinInsights,
        reflection: data.reflection || "",
        prayer: data.prayer || "",
        declaration: data.declaration,
        createdAt: new Date().toISOString(),
        completed: false,
        saved: false,
      };
      setDevotional(dev);
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "Failed to generate devotional. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
            <h2 className="font-display text-2xl font-bold mb-2">What's on your heart?</h2>
            <p className="text-muted-foreground text-sm">Enter any topic and receive a Spirit-led devotional</p>
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
        <DevotionalReader devotional={devotional} tones={tones} onRegenerate={handleGenerate} />
      )}
    </div>
  );
};

export default GenerateDevotional;
