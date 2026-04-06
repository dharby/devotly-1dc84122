import { useState } from "react";
import { ChevronLeft, Plus, CheckCircle2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { FASTING_PLANS, type FastingPlan } from "@/lib/fastingStore";
import { useFasts, type ActiveFast } from "@/hooks/useFasts";

const FastingTracker = () => {
  const navigate = useNavigate();
  const { fasts, startFast, checkinFast } = useFasts();
  const [showPlans, setShowPlans] = useState(false);

  const handleStart = async (plan: FastingPlan) => {
    await startFast(plan);
    setShowPlans(false);
  };

  const handleCheckin = async (fastId: string) => {
    await checkinFast(fastId);
  };

  const today = new Date().toISOString().split("T")[0];
  const activeFasts = fasts.filter((f) => !f.completed);
  const completedFasts = fasts.filter((f) => f.completed);

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold">Fasting Tracker</h1>
          </div>
          <Button variant="golden" size="sm" className="rounded-xl" onClick={() => setShowPlans(true)}>
            <Plus className="h-4 w-4 mr-1" /> New Fast
          </Button>
        </div>
      </div>

      <div className="px-6 pt-6 animate-fade-in">
        {showPlans && (
          <div className="mb-6">
            <h2 className="font-display text-base font-semibold mb-3">Choose a Fasting Plan</h2>
            <div className="space-y-2">
              {FASTING_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleStart(plan)}
                  className="w-full text-left bg-card rounded-xl p-4 border border-border hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-sm">{plan.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{plan.durationDays} days</span>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-3 rounded-xl" onClick={() => setShowPlans(false)}>Cancel</Button>
          </div>
        )}

        {activeFasts.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-base font-semibold mb-3">Active Fasts</h2>
            <div className="space-y-3">
              {activeFasts.map((fast) => (
                <FastCard key={fast.id} fast={fast} today={today} onCheckin={handleCheckin} />
              ))}
            </div>
          </div>
        )}

        {activeFasts.length === 0 && !showPlans && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Calendar className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">No Active Fasts</h2>
            <p className="text-sm text-muted-foreground mb-4">Start a fasting plan to draw closer to God</p>
            <Button variant="golden" className="rounded-xl" onClick={() => setShowPlans(true)}>
              <Plus className="h-4 w-4 mr-2" /> Start a Fast
            </Button>
          </div>
        )}

        {completedFasts.length > 0 && (
          <div>
            <h2 className="font-display text-base font-semibold mb-3">Completed</h2>
            <div className="space-y-2">
              {completedFasts.map((fast) => (
                <div key={fast.id} className="bg-card rounded-xl p-4 border border-border opacity-70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <p className="font-display font-semibold text-sm">{fast.planName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fast.checkins.length}/{fast.durationDays} days · Started {fast.startDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function FastCard({ fast, today, onCheckin }: { fast: ActiveFast; today: string; onCheckin: (id: string) => void }) {
  const progressPercent = (fast.checkins.length / fast.durationDays) * 100;
  const checkedInToday = fast.checkins.includes(today);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-display font-semibold text-sm">{fast.planName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Day {fast.checkins.length} of {fast.durationDays} · Started {fast.startDate}</p>
        </div>
        <span className="text-xs font-bold text-primary">{Math.round(progressPercent)}%</span>
      </div>
      <Progress value={progressPercent} className="h-2 mb-3" />
      <Button variant={checkedInToday ? "secondary" : "golden"} size="sm" className="w-full rounded-xl" onClick={() => onCheckin(fast.id)} disabled={checkedInToday}>
        <CheckCircle2 className={cn("h-4 w-4 mr-1", checkedInToday && "fill-current")} />
        {checkedInToday ? "Checked in today" : "Check in for today"}
      </Button>
    </div>
  );
}

export default FastingTracker;
