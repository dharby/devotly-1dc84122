import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { FASTING_PLANS, type FastingPlan } from "@/lib/fastingStore";

export interface ActiveFast {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  durationDays: number;
  checkins: string[];
  completed: boolean;
}

export function useFasts() {
  const { user } = useAuth();
  const [fasts, setFasts] = useState<ActiveFast[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFasts = useCallback(async () => {
    if (!user) { setFasts([]); setLoading(false); return; }
    const { data } = await supabase
      .from("fasts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setFasts(data.map((r: any) => ({
        id: r.id,
        planId: r.plan_id,
        planName: r.plan_name,
        startDate: r.start_date,
        durationDays: r.duration_days,
        checkins: (r.checkins || []) as string[],
        completed: r.completed,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFasts(); }, [fetchFasts]);

  const startFast = useCallback(async (plan: FastingPlan) => {
    if (!user) return;
    await supabase.from("fasts").insert({
      user_id: user.id,
      plan_id: plan.id,
      plan_name: plan.name,
      duration_days: plan.durationDays,
    });
    await fetchFasts();
  }, [user, fetchFasts]);

  const checkinFast = useCallback(async (fastId: string) => {
    if (!user) return;
    const fast = fasts.find((f) => f.id === fastId);
    if (!fast) return;
    const today = new Date().toISOString().split("T")[0];
    if (fast.checkins.includes(today)) return;
    const newCheckins = [...fast.checkins, today];
    const completed = newCheckins.length >= fast.durationDays;
    await supabase.from("fasts").update({
      checkins: newCheckins,
      completed,
    }).eq("id", fastId);
    await fetchFasts();
  }, [user, fasts, fetchFasts]);

  const deleteFast = useCallback(async (fastId: string) => {
    if (!user) return;
    await supabase.from("fasts").delete().eq("id", fastId).eq("user_id", user.id);
    await fetchFasts();
  }, [user, fetchFasts]);

  const updateFast = useCallback(async (
    fastId: string,
    updates: Partial<Pick<ActiveFast, "planId" | "planName" | "durationDays" | "startDate">>,
  ) => {
    if (!user) return;
    const fast = fasts.find((f) => f.id === fastId);
    if (!fast) return;
    const merged = { ...fast, ...updates };
    const completed = merged.checkins.length >= merged.durationDays;
    await supabase.from("fasts").update({
      plan_id: merged.planId,
      plan_name: merged.planName,
      duration_days: merged.durationDays,
      start_date: merged.startDate,
      completed,
    }).eq("id", fastId).eq("user_id", user.id);
    await fetchFasts();
  }, [user, fasts, fetchFasts]);

  return { fasts, loading, startFast, checkinFast, deleteFast, updateFast };
}
