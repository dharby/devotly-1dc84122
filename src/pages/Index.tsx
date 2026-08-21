import { useNavigate } from "react-router-dom";
import { BookOpen, Flame, Calendar, ArrowRight, Sparkles, Timer, UtensilsCrossed, Bookmark, Users, Lightbulb, ScrollText, History, X, Search, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDevotionals } from "@/hooks/useDevotionals";
import { useSermons } from "@/hooks/useSermons";
import { useTracker } from "@/hooks/useTracker";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FloatingOrbs } from "@/components/motion";
import heroImage from "@/assets/hero-devotional.jpg";
import { getDailySuggestion } from "@/lib/dailyTopics";



interface RecentTopic { topic: string; kind: "devotional" | "sermon"; at: number }

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { devotionals } = useDevotionals();
  const { sermons } = useSermons();
  const { streak, trackerDays } = useTracker();
  const dailySuggestion = getDailySuggestion();
  const totalDevotionals = devotionals.length;
  const savedSermons = sermons.filter((s) => s.bookmarked).length;
  const completedDays = trackerDays.filter((d) => d.completed).length;

  const [recentTopics, setRecentTopics] = useState<RecentTopic[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recent_topics");
      if (raw) setRecentTopics(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const clearRecent = () => {
    localStorage.removeItem("recent_topics");
    setRecentTopics([]);
  };

  const openTopic = (t: RecentTopic) => {
    navigate(t.kind === "sermon"
      ? `/sermon?topic=${encodeURIComponent(t.topic)}`
      : `/generate?topic=${encodeURIComponent(t.topic)}`);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.img initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }} src={heroImage} alt="Peaceful devotional scene" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <FloatingOrbs />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="relative px-6 pt-14 pb-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-medium text-muted-foreground mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </motion.p>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Good {getGreeting()}{user?.email ? `, ${user.email.split("@")[0]}` : ""},
          </h1>
          <p className="text-muted-foreground text-base">Begin your day in God's presence.</p>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ initial: {}, animate: { transition: { staggerChildren: 0.07 } } }} className="px-6 -mt-2">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard icon={<Flame className="h-5 w-5 text-primary" />} value={streak} label="Day Streak" delay={0} />
          <StatCard icon={<BookOpen className="h-5 w-5 text-primary" />} value={totalDevotionals} label="Devotionals" delay={0.07} />
          <StatCard icon={<ScrollText className="h-5 w-5 text-primary" />} value={savedSermons} label="Sermons" delay={0.14} />
          <StatCard icon={<Calendar className="h-5 w-5 text-primary" />} value={completedDays} label="Days Active" delay={0.21} />
        </div>
      </motion.div>

      {/* Main Action */}
      <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="px-6 mb-6">
        <motion.button whileHover={{ scale: 1.015, y: -2 }} whileTap={{ scale: 0.985 }} onClick={() => navigate("/generate")} className="w-full bg-gradient-golden rounded-2xl p-6 shadow-golden text-primary-foreground text-left relative overflow-hidden group">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12" initial={{ x: "-120%" }} whileHover={{ x: "120%" }} transition={{ duration: 0.9 }} />
          <div className="flex items-start justify-between relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <motion.span animate={{ rotate: [0, 14, -10, 0] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 4 }}><Sparkles className="h-5 w-5" /></motion.span>
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">Today's Devotional</span>
              </div>
              <h2 className="font-display text-xl font-bold mb-1">Generate a New Devotion</h2>
              <p className="text-sm opacity-80">Reflect on any topic — crafted for your journey</p>
            </div>
            <motion.span whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}><ArrowRight className="h-6 w-6 mt-1 flex-shrink-0" /></motion.span>
          </div>
        </motion.button>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <button
          onClick={() => navigate("/sermon")}
          className="w-full bg-card border border-border rounded-2xl p-5 text-left hover:shadow-warm transition-all mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
              <ScrollText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold">Full Sermon & Bible Study</p>
              <p className="text-xs text-muted-foreground">Extensive preaching on any topic or passage</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => navigate("/scripture")} className="bg-card rounded-xl p-3 border border-border text-center hover:shadow-warm transition-shadow">
            <Search className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Scripture</p>
          </button>
          <button onClick={() => navigate("/notes")} className="bg-card rounded-xl p-3 border border-border text-center hover:shadow-warm transition-shadow">
            <NotebookPen className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
          </button>
          <button onClick={() => navigate("/prayer-timer")} className="bg-card rounded-xl p-3 border border-border text-center hover:shadow-warm transition-shadow">
            <Timer className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Prayer</p>
          </button>
          <button onClick={() => navigate("/fasting")} className="bg-card rounded-xl p-3 border border-border text-center hover:shadow-warm transition-shadow">
            <UtensilsCrossed className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Fasting</p>
          </button>
          <button onClick={() => navigate("/family")} className="bg-card rounded-xl p-3 border border-border text-center hover:shadow-warm transition-shadow">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Family</p>
          </button>
          <button onClick={() => navigate("/tracker")} className="bg-card rounded-xl p-3 border border-border text-center hover:shadow-warm transition-shadow">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tracker</p>
          </button>
        </div>
      </div>

      {/* Daily Suggestion */}
      <div className="px-6 mb-6">
        <button
          onClick={() => navigate(`/generate?topic=${encodeURIComponent(dailySuggestion.topic)}`)}
          className="w-full bg-accent rounded-2xl p-5 border border-border text-left transition-transform active:scale-[0.98] hover:shadow-warm"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Today's Suggested Topic</p>
              <p className="font-display text-base font-bold">{dailySuggestion.topic}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{dailySuggestion.verse}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
          </div>
        </button>
      </div>


      {/* Suggested Topics — generate as devotional OR sermon */}
      <div className="px-6 mb-8 stagger">
        <h3 className="font-display text-lg font-semibold mb-3">Suggested Topics</h3>
        <div className="space-y-2">
          {["Faith", "Love", "Anxiety", "Purpose", "Gratitude", "Marriage", "Peace", "Strength", "Forgiveness", "Hope"].map((topic) => (
            <div key={topic} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
              <span className="flex-1 text-sm font-medium">{topic}</span>
              <button
                onClick={() => navigate(`/generate?topic=${encodeURIComponent(topic)}`)}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                Devotional
              </button>
              <button
                onClick={() => navigate(`/sermon?topic=${encodeURIComponent(topic)}`)}
                className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium hover:bg-accent/80 transition-colors"
              >
                Sermon
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Topics */}
      {recentTopics.length > 0 && (
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Recent Topics
            </h3>
            <button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTopics.map((t) => (
              <button
                key={`${t.kind}-${t.at}`}
                onClick={() => openTopic(t)}
                className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium hover:border-primary/40 transition-all flex items-center gap-1.5"
              >
                {t.kind === "sermon" ? <ScrollText className="h-3 w-3 text-primary" /> : <Sparkles className="h-3 w-3 text-primary" />}
                {t.topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Devotionals */}
      <div className="px-6 stagger">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold">Recent Devotionals</h3>
          <button onClick={() => navigate("/saved")} className="text-xs text-primary font-medium flex items-center gap-1">
            <Bookmark className="h-3 w-3" /> View All
          </button>
        </div>
        {devotionals.slice(0, 3).map((d) => (
          <div key={d.id} className="bg-card rounded-xl p-4 mb-3 border border-border cursor-pointer hover:shadow-warm transition-shadow" onClick={() => navigate("/saved")}>
            <p className="font-display font-semibold text-sm">{d.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{d.scriptureReference} · {new Date(d.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {devotionals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No devotionals yet. Start your journey today! ✨</p>
        )}
      </div>
    </div>
  );
};

function StatCard({ icon, value, label, delay = 0 }: { icon: React.ReactNode; value: number; label: string; delay?: number }) {
  return (
    <motion.div variants={{ initial: { opacity: 0, y: 14, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 } }} transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }} whileHover={{ y: -2 }} className="bg-card rounded-xl p-3 border border-border text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.25 }} className="font-display text-xl font-bold">{value}</motion.p>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export default Index;
