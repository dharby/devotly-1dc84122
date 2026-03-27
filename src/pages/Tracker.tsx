import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentStreak, getTrackerDays } from "@/lib/devotionalStore";

const Tracker = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const streak = getCurrentStreak();
  const trackerDays = getTrackerDays();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const isCompleted = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return trackerDays.some((d) => d.date === dateStr && d.completed);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="font-display text-lg font-semibold">Devotional Tracker</h1>
      </div>

      {/* Streak Banner */}
      <div className="px-6 pt-6 mb-6">
        <div className="bg-gradient-golden rounded-2xl p-6 shadow-golden text-center">
          <Flame className="h-10 w-10 text-primary-foreground mx-auto mb-2" />
          <p className="font-display text-4xl font-bold text-primary-foreground">{streak}</p>
          <p className="text-sm text-primary-foreground/80 font-medium">
            Day Streak
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-6">
        <div className="bg-card rounded-2xl border border-border p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-display font-semibold">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const done = isCompleted(day);
              const today = isToday(day);
              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                    done && "bg-primary text-primary-foreground",
                    today && !done && "ring-2 ring-primary/40",
                    !done && !today && "text-foreground/70"
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded ring-2 ring-primary/40" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
