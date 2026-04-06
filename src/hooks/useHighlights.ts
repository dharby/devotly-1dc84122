import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Highlight {
  id: string;
  text: string;
  section: string;
  color: string;
  note?: string;
}

export function useHighlights(devotionalId: string) {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const fetch = useCallback(async () => {
    if (!user || !devotionalId) return;
    const { data } = await supabase
      .from("devotional_highlights")
      .select("id, text, section, color, note")
      .eq("devotional_id", devotionalId);
    if (data) setHighlights(data);
  }, [user, devotionalId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addHighlight = useCallback(async (hl: Omit<Highlight, "id">) => {
    if (!user) return;
    const { data } = await supabase.from("devotional_highlights").insert({
      user_id: user.id,
      devotional_id: devotionalId,
      text: hl.text,
      section: hl.section,
      color: hl.color,
      note: hl.note || null,
    }).select("id, text, section, color, note").single();
    if (data) setHighlights((prev) => [...prev, data]);
  }, [user, devotionalId]);

  const removeHighlight = useCallback(async (id: string) => {
    await supabase.from("devotional_highlights").delete().eq("id", id);
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { highlights, addHighlight, removeHighlight };
}
