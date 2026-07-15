import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ScrollText, RefreshCw, Sparkles, BookOpen, Quote, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SermonPoint {
  heading: string;
  scripture: string;
  exposition: string;
  illustration: string;
  application: string;
}
interface Sermon {
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

export default function Sermon() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("expository");
  const [audience, setAudience] = useState("general");
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sermon", {
        body: { topic: topic.trim(), style, audience, length: "long" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSermon(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      toast.error(e.message || "Failed to generate sermon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => (sermon ? setSermon(null) : navigate(-1))} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold">
            {sermon ? "Full Sermon" : "Sermon & Bible Study"}
          </h1>
        </div>
      </div>

      {!sermon ? (
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
        <article className="px-6 pt-6 pb-10 animate-fade-in max-w-2xl mx-auto space-y-8">
          <header className="text-center border-b border-border pb-6">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Sermon</p>
            <h1 className="font-display text-3xl font-bold leading-tight mb-2">{sermon.title}</h1>
            <p className="text-muted-foreground italic">{sermon.subtitle}</p>
          </header>

          <Section icon={<Quote className="h-4 w-4" />} label="Main Scripture" title={sermon.mainScriptureReference}>
            <blockquote className="border-l-4 border-primary/60 pl-4 italic text-foreground/90 whitespace-pre-line">
              {sermon.mainScripture}
            </blockquote>
          </Section>

          <div className="bg-accent/50 border border-border rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Big Idea</p>
            <p className="font-display text-lg leading-snug">{sermon.bigIdea}</p>
          </div>

          <Section icon={<BookOpen className="h-4 w-4" />} label="Introduction">
            <p className="whitespace-pre-line leading-relaxed">{sermon.introduction}</p>
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
                {p.scripture}
              </blockquote>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Exposition</p>
                <p className="whitespace-pre-line leading-relaxed">{p.exposition}</p>
              </div>
              <div className="bg-secondary/40 rounded-xl p-4">
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Illustration</p>
                <p className="text-sm leading-relaxed">{p.illustration}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Application</p>
                <p className="text-sm leading-relaxed whitespace-pre-line">{p.application}</p>
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
            <p className="whitespace-pre-line leading-relaxed">{sermon.callToAction}</p>
          </Section>

          <div className="bg-gradient-cathedral text-primary-foreground rounded-2xl p-6 shadow-cathedral">
            <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Closing Prayer</p>
            <p className="whitespace-pre-line leading-relaxed">{sermon.closingPrayer}</p>
          </div>

          <div className="text-center italic font-display text-lg text-primary py-4 border-t border-border">
            {sermon.benediction}
          </div>

          <Button variant="outline" className="w-full" onClick={() => setSermon(null)}>
            <RefreshCw className="h-4 w-4 mr-2" /> Generate Another
          </Button>
        </article>
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
