import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface TrackerDay {
  date: string;
  completed: boolean;
  devotionalId?: string;
}

export function useTracker() {
  const { user } = useAuth();
  const [trackerDays, setTrackerDays] = useState<TrackerDay[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTracker = useCallback(async () => {
    if (!user) { setTrackerDays([]); setStreak(0); setLoading(false); return; }
    const { data } = await supabase
      .from("tracker_days")
      .select("date, completed, devotional_id")
      .order("date", { ascending: false });
    if (data) {
      const days = data.map((r: any) => ({
        date: r.date,
        completed: r.completed,
        devotionalId: r.devotional_id,
      }));
      setTrackerDays(days);
      setStreak(calcStreak(days));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTracker(); }, [fetchTracker]);

  const markDayComplete = useCallback(async (date: string, devotionalId?: string) => {
    if (!user) return;
    await supabase.from("tracker_days").upsert({
      user_id: user.id,
      date,
      completed: true,
      devotional_id: devotionalId || null,
    }, { onConflict: "user_id,date" });
    await fetchTracker();
  }, [user, fetchTracker]);

  return { trackerDays, streak, loading, markDayComplete, refetch: fetchTracker };
}

function calcStreak(days: TrackerDay[]): number {
  if (!days.length) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (days.find((x) => x.date === dateStr && x.completed)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}
