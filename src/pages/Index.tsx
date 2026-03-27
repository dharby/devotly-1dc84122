import { useNavigate } from "react-router-dom";
import { BookOpen, Flame, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentStreak, getDevotionals, getTrackerDays } from "@/lib/devotionalStore";
import heroImage from "@/assets/hero-devotional.jpg";

const Index = () => {
  const navigate = useNavigate();
  const streak = getCurrentStreak();
  const totalDevotionals = getDevotionals().length;
  const completedDays = getTrackerDays().filter((d) => d.completed).length;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Peaceful devotional scene"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="relative px-6 pt-14 pb-10">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">
            Good {getGreeting()},
          </h1>
          <p className="text-muted-foreground text-base">
            Begin your day in God's presence.
          </p>
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
      <div className="px-6 mb-8">
        <button
          onClick={() => navigate("/generate")}
          className="w-full bg-gradient-golden rounded-2xl p-6 shadow-golden text-primary-foreground text-left transition-transform active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                  Today's Devotional
                </span>
              </div>
              <h2 className="font-display text-xl font-bold mb-1">
                Generate a New Devotion
              </h2>
              <p className="text-sm opacity-80">
                Enter any topic and receive a Spirit-led devotional
              </p>
            </div>
            <ArrowRight className="h-6 w-6 mt-1 flex-shrink-0" />
          </div>
        </button>
      </div>

      {/* Quick Topics */}
      <div className="px-6 mb-8">
        <h3 className="font-display text-lg font-semibold mb-3">Quick Topics</h3>
        <div className="flex flex-wrap gap-2">
          {["Faith", "Love", "Anxiety", "Purpose", "Gratitude", "Marriage", "Peace", "Strength"].map(
            (topic) => (
              <Button
                key={topic}
                variant="soft"
                size="sm"
                className="rounded-full"
                onClick={() => navigate(`/generate?topic=${topic}`)}
              >
                {topic}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Recent Devotionals */}
      <div className="px-6">
        <h3 className="font-display text-lg font-semibold mb-3">Recent</h3>
        {getDevotionals()
          .slice(0, 3)
          .map((d) => (
            <div
              key={d.id}
              className="bg-card rounded-xl p-4 mb-3 border border-border cursor-pointer hover:shadow-warm transition-shadow"
              onClick={() => navigate(`/saved`)}
            >
              <p className="font-display font-semibold text-sm">{d.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {d.scriptureReference} · {new Date(d.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        {getDevotionals().length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No devotionals yet. Start your journey today! ✨
          </p>
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
