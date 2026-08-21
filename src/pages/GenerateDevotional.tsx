import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDevotionals, type Devotional } from "@/hooks/useDevotionals";
import DevotionalReader from "@/components/DevotionalReader";
import { pushRecentTopic } from "./Sermon";
import { BIBLE_TRANSLATIONS, getSettings, updateSettings, type BibleTranslation } from "@/lib/settingsStore";
import { motion } from "framer-motion";

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
  const [translation, setTranslation] = useState<BibleTranslation>(getSettings().bibleTranslation);
  const [compare, setCompare] = useState<BibleTranslation[]>(getSettings().compareTranslations);

  const toggleCompare = (v: BibleTranslation) => {
    setCompare((prev) => {
      const next = prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v].slice(0, 3);
      updateSettings({ compareTranslations: next });
      return next;
    });
  };
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { saveDevotional } = useDevotionals();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-devotional", {
        body: { topic: topic.trim(), tone, translation, compareTranslations: compare },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const dev: Devotional = {
        id: crypto.randomUUID(),
        title: data.title || "Daily Devotional",
        topic: topic.trim(),
        tone,
        scripture: data.scripture || "",
        scriptureReference: data.scriptureReference || "",
        translation,
        translations: Array.isArray(data.translations) ? data.translations : [],
        greekLatinInsights: data.greekLatinInsights,
        reflection: data.reflection || "",
        prayer: data.prayer || "",
        declaration: data.declaration,
        createdAt: new Date().toISOString(),
        completed: false,
        saved: false,
      };
      await saveDevotional(dev);
      pushRecentTopic(topic.trim(), "devotional");
      setDevotional(dev);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate devotional. Please try again.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold">Generate Devotional</h1>
        </div>
      </div>

      {!devotional ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="px-6 pt-6">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08, duration: 0.5 }} className="text-center mb-8">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-golden shadow-golden mb-4">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <h2 className="font-display text-2xl font-bold mb-2">What's on your heart?</h2>
            <p className="text-muted-foreground text-sm">Enter any topic — your devotional is crafted with care</p>
          </motion.div>

          <motion.div initial="initial" animate="animate" variants={{ initial: {}, animate: { transition: { staggerChildren: 0.08 } } }} className="space-y-5">
            <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
              <label className="text-sm font-medium mb-2 block">Topic</label>
              <Textarea
                placeholder="e.g. faith, anxiety, purpose, gratitude, marriage..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="resize-none h-20 bg-card border-border"
              />
            </motion.div>

            <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
              <label className="text-sm font-medium mb-2 block">Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {tones.map((t) => (
                  <motion.button
                    key={t.value}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ y: -1 }}
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                      tone === t.value ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    {t.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
              <label className="text-sm font-medium mb-2 block">Bible Translation</label>
              <select
                value={translation}
                onChange={(e) => {
                  const v = e.target.value as BibleTranslation;
                  setTranslation(v);
                  updateSettings({ bibleTranslation: v });
                }}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm"
              >
                {BIBLE_TRANSLATIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-2 mb-2">Also show the verse in (up to 3):</p>
              <div className="flex flex-wrap gap-2">
                {BIBLE_TRANSLATIONS.filter((t) => t.value !== translation).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => toggleCompare(t.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                      compare.includes(t.value) ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {t.value}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
              <Button variant="golden" size="lg" className="w-full text-base rounded-xl h-12" onClick={handleGenerate} disabled={!topic.trim() || isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Preparing your devotional…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Devotional
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <DevotionalReader devotional={devotional} tones={tones} onRegenerate={handleGenerate} />
      )}
    </div>
  );
};

export default GenerateDevotional;
