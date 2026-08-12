import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { PLAN_DAYS, currentPlanDay } from "@/lib/readingPlan";

export interface ReadingPlan {
  id: string;
  start_date: string;
  translation: string;
  reminder_enabled: boolean;
  reminder_time: string;
}

export function useReadingPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setPlan(null); setCompletedDays([]); setLoading(false); return; }
    const [{ data: planRow }, { data: progress }] = await Promise.all([
      supabase.from("bible_reading_plans").select("*").maybeSingle(),
      supabase.from("bible_reading_progress").select("day_number"),
    ]);
    setPlan((planRow as ReadingPlan) ?? null);
    setCompletedDays(((progress as { day_number: number }[]) ?? []).map((p) => p.day_number).sort((a, b) => a - b));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const startPlan = useCallback(async (startDate?: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("bible_reading_plans")
      .upsert(
        { user_id: user.id, start_date: startDate ?? new Date().toISOString().slice(0, 10) },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (data) setPlan(data as ReadingPlan);
  }, [user]);

  const updatePlan = useCallback(async (patch: Partial<Omit<ReadingPlan, "id">>) => {
    if (!plan) return;
    setPlan((p) => (p ? { ...p, ...patch } : p));
    await supabase.from("bible_reading_plans").update(patch).eq("id", plan.id);
  }, [plan]);

  const toggleDay = useCallback(async (day: number) => {
    if (!user) return;
    if (completedDays.includes(day)) {
      setCompletedDays((prev) => prev.filter((d) => d !== day));
      await supabase.from("bible_reading_progress").delete().eq("day_number", day).eq("user_id", user.id);
    } else {
      setCompletedDays((prev) => [...prev, day].sort((a, b) => a - b));
      await supabase.from("bible_reading_progress").insert({ user_id: user.id, day_number: day });
    }
  }, [user, completedDays]);

  const resetPlan = useCallback(async () => {
    if (!user) return;
    await supabase.from("bible_reading_progress").delete().eq("user_id", user.id);
    setCompletedDays([]);
    await startPlan(new Date().toISOString().slice(0, 10));
  }, [user, startPlan]);

  const today = plan ? currentPlanDay(plan.start_date) : 1;
  const percent = Math.round((completedDays.length / PLAN_DAYS) * 100);

  return { plan, completedDays, loading, today, percent, startPlan, updatePlan, toggleDay, resetPlan, refresh: fetchAll };
}
