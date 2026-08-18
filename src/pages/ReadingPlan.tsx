import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookMarked, Check, ChevronLeft, ChevronRight, Bell, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useReadingPlan } from "@/hooks/useReadingPlan";
import { getReadingForDay, PLAN_DAYS } from "@/lib/readingPlan";
import { scheduleReminder, cancelReminder, requestNotificationPermission } from "@/lib/notifications";
import ConfirmDelete from "@/components/ConfirmDelete";
import { toast } from "sonner";

const ReadingPlan = () => {
  const navigate = useNavigate();
  const { plan, completedDays, loading, today, percent, startPlan, updatePlan, toggleDay, resetPlan, cancelPlan } = useReadingPlan();
  const [viewDay, setViewDay] = useState<number | null>(null);

  const day = viewDay ?? today;
  const reading = getReadingForDay(day);
  const isDone = completedDays.includes(day);

  const handleReminderToggle = async (checked: boolean) => {
    if (checked) {
      const perm = await requestNotificationPermission();
      if (perm !== "granted") { toast.error("Notifications are blocked in your browser settings"); return; }
      await updatePlan({ reminder_enabled: true });
      await scheduleReminder("reading", plan?.reminder_time || "07:30");
      toast.success("Reading reminder on");
    } else {
      await updatePlan({ reminder_enabled: false });
      cancelReminder("reading");
    }
  };

  const handleTimeChange = async (time: string) => {
    await updatePlan({ reminder_time: time });
    if (plan?.reminder_enabled) await scheduleReminder("reading", time);
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-display text-2xl font-bold">Bible in a Year</h1>
      </div>

      {loading ? (
        <p className="px-6 text-sm text-muted-foreground animate-pulse">Loading your plan…</p>
      ) : !plan ? (
        <div className="px-6">
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <BookMarked className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold mb-1">Read the whole Bible in 365 days</h2>
            <p className="text-sm text-muted-foreground mb-5">
              A daily Old Testament portion paired with Psalms and the New Testament, about 3–4 chapters a day.
            </p>
            <Button variant="golden" className="rounded-xl w-full" onClick={() => startPlan()}>Start the plan</Button>
          </div>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="px-6 mb-5">
            <div className="bg-gradient-golden rounded-2xl p-5 shadow-warm text-primary-foreground">
              <p className="text-xs uppercase tracking-wider opacity-80 font-semibold mb-1">Your progress</p>
              <p className="font-display text-3xl font-bold mb-2">{completedDays.length} / {PLAN_DAYS} days</p>
              <div className="h-2 rounded-full bg-primary-foreground/25 overflow-hidden">
                <div className="h-full bg-primary-foreground rounded-full transition-all" style={{ width: `${Math.max(percent, 1)}%` }} />
              </div>
              <p className="text-xs opacity-80 mt-2">Started {new Date(`${plan.start_date}T00:00:00`).toLocaleDateString()} · {percent}% complete</p>
            </div>
          </div>

          {/* Day reading */}
          <div className="px-6 mb-5">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setViewDay(Math.max(1, day - 1))} className="p-2 text-muted-foreground disabled:opacity-30" disabled={day <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold">
                Day {day}{day === today && <span className="text-primary"> · Today</span>}
              </p>
              <button onClick={() => setViewDay(Math.min(PLAN_DAYS, day + 1))} className="p-2 text-muted-foreground disabled:opacity-30" disabled={day >= PLAN_DAYS}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">Old Testament</p>
              <p className="font-display text-lg font-semibold mb-3">{reading.oldTestament.join(", ")}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">Psalms & New Testament</p>
              <p className="font-display text-lg font-semibold mb-4">{reading.newTestament.join(", ")}</p>

              <div className="flex gap-2">
                <Button variant={isDone ? "secondary" : "default"} className="flex-1 rounded-xl" onClick={() => toggleDay(day)}>
                  <Check className="h-4 w-4 mr-1" /> {isDone ? "Read" : "Mark as read"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => navigate(`/scripture?q=${encodeURIComponent(reading.all[0] || "")}`)}
                >
                  Look up
                </Button>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div className="px-6 mb-5">
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Daily reading reminder</p>
                  <p className="text-xs text-muted-foreground">A nudge with today's chapters.</p>
                </div>
                <Switch checked={plan.reminder_enabled} onCheckedChange={handleReminderToggle} />
              </div>
              {plan.reminder_enabled && (
                <input
                  type="time"
                  value={plan.reminder_time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="mt-3 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                />
              )}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="px-6 mb-6">
            <h3 className="font-display text-sm font-semibold mb-2">All 365 days</h3>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: PLAN_DAYS }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  onClick={() => setViewDay(d)}
                  className={cn(
                    "aspect-square rounded-[4px] text-[8px] font-medium flex items-center justify-center transition-colors",
                    completedDays.includes(d)
                      ? "bg-primary text-primary-foreground"
                      : d === today
                        ? "border border-primary text-primary"
                        : "bg-muted text-muted-foreground",
                    d === day && "ring-2 ring-primary/50",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 flex flex-col gap-2">
            <ConfirmDelete
              title="Restart the plan?"
              description="Your reading progress will be cleared and the plan will restart from today."
              confirmLabel="Restart"
              onConfirm={async () => { await resetPlan(); setViewDay(null); }}
              trigger={(open) => (
                <Button variant="outline" className="w-full rounded-xl" onClick={open}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Restart plan
                </Button>
              )}
            />
            <ConfirmDelete
              title="Cancel the plan?"
              description="The Bible reading plan and all your progress will be removed. You can start again anytime."
              confirmLabel="Cancel plan"
              onConfirm={async () => { await cancelPlan(); setViewDay(null); }}
              trigger={(open) => (
                <Button variant="ghost" className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" onClick={open}>
                  Cancel plan
                </Button>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ReadingPlan;
