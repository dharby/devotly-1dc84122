import { useNavigate } from "react-router-dom";
import { BookOpen, Flame, Calendar, ArrowRight, Sparkles, Timer, UtensilsCrossed, Bookmark, Users, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentStreak, getDevotionals, getTrackerDays } from "@/lib/devotionalStore";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-devotional.jpg";

const DAILY_TOPICS = [
  { topic: "God's Faithfulness", verse: "Lamentations 3:22-23" },
  { topic: "Peace in Storms", verse: "John 14:27" },
  { topic: "Strength in Weakness", verse: "2 Corinthians 12:9" },
  { topic: "Walking in Love", verse: "1 John 4:7-8" },
  { topic: "Trusting God's Plan", verse: "Jeremiah 29:11" },
  { topic: "Joy of the Lord", verse: "Nehemiah 8:10" },
  { topic: "Forgiveness", verse: "Colossians 3:13" },
  { topic: "Hope in Christ", verse: "Romans 15:13" },
  { topic: "Patience & Endurance", verse: "James 1:2-4" },
  { topic: "God's Provision", verse: "Philippians 4:19" },
  { topic: "Identity in Christ", verse: "2 Corinthians 5:17" },
  { topic: "Gratitude", verse: "1 Thessalonians 5:18" },
  { topic: "Courage", verse: "Joshua 1:9" },
  { topic: "Grace", verse: "Ephesians 2:8-9" },
  { topic: "Renewed Mind", verse: "Romans 12:2" },
  { topic: "Humility", verse: "Philippians 2:3-4" },
  { topic: "Compassion", verse: "Colossians 3:12" },
  { topic: "Purpose", verse: "Ephesians 2:10" },
  { topic: "Obedience", verse: "John 14:15" },
  { topic: "Wisdom", verse: "James 1:5" },
  { topic: "Rest in God", verse: "Matthew 11:28-30" },
  { topic: "Overcoming Fear", verse: "2 Timothy 1:7" },
  { topic: "Generosity", verse: "2 Corinthians 9:7" },
  { topic: "The Holy Spirit", verse: "John 16:13" },
  { topic: "Contentment", verse: "Philippians 4:11-12" },
  { topic: "Worship", verse: "Psalm 95:1-2" },
  { topic: "Prayer Life", verse: "Philippians 4:6-7" },
  { topic: "God's Sovereignty", verse: "Isaiah 46:10" },
  { topic: "Healing", verse: "Psalm 147:3" },
  { topic: "Perseverance", verse: "Galatians 6:9" },
  { topic: "Spiritual Armor", verse: "Ephesians 6:11" },
];

function getDailySuggestion() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_TOPICS[dayOfYear % DAILY_TOPICS.length];
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const streak = getCurrentStreak();
  const dailySuggestion = getDailySuggestion();
  const totalDevotionals = getDevotionals().length;
  const completedDays = getTrackerDays().filter((d) => d.completed).length;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Peaceful devotional scene" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="relative px-6 pt-14 pb-10">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Good {getGreeting()}{user?.email ? `, ${user.email.split("@")[0]}` : ""},
          </h1>
          <p className="text-muted-foreground text-base">Begin your day in God's presence.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 -mt-2">
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatCard icon={<Flame className="h-5 w-5 text-primary" />} value={streak} label="Day Streak" />
          <StatCard icon={<BookOpen className="h-5 w-5 text-primary" />} value={totalDevotionals} label="Devotionals" />
          <StatCard icon={<Calendar className="h-5 w-5 text-primary" />} value={completedDays} label="Days Active" />
        </div>
      </div>

      {/* Main Action */}
      <div className="px-6 mb-6">
        <button
          onClick={() => navigate("/generate")}
          className="w-full bg-gradient-golden rounded-2xl p-6 shadow-golden text-primary-foreground text-left transition-transform active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">Today's Devotional</span>
              </div>
              <h2 className="font-display text-xl font-bold mb-1">Generate a New Devotion</h2>
              <p className="text-sm opacity-80">Enter any topic and receive a Spirit-led devotional</p>
            </div>
            <ArrowRight className="h-6 w-6 mt-1 flex-shrink-0" />
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-2">
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

      {/* Quick Topics */}
      <div className="px-6 mb-8">
        <h3 className="font-display text-lg font-semibold mb-3">Quick Topics</h3>
        <div className="flex flex-wrap gap-2">
          {["Faith", "Love", "Anxiety", "Purpose", "Gratitude", "Marriage", "Peace", "Strength"].map((topic) => (
            <Button key={topic} variant="soft" size="sm" className="rounded-full" onClick={() => navigate(`/generate?topic=${topic}`)}>
              {topic}
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Devotionals */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold">Recent</h3>
          <button onClick={() => navigate("/saved")} className="text-xs text-primary font-medium flex items-center gap-1">
            <Bookmark className="h-3 w-3" /> View All
          </button>
        </div>
        {getDevotionals().slice(0, 3).map((d) => (
          <div key={d.id} className="bg-card rounded-xl p-4 mb-3 border border-border cursor-pointer hover:shadow-warm transition-shadow" onClick={() => navigate("/saved")}>
            <p className="font-display font-semibold text-sm">{d.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{d.scriptureReference} · {new Date(d.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {getDevotionals().length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No devotionals yet. Start your journey today! ✨</p>
        )}
      </div>
    </div>
  );
};

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-card rounded-xl p-3 border border-border text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export default Index;
