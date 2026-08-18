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

export interface SermonHighlight extends Highlight {
  sermon_id: string;
  source_type: "sermon";
}

export interface DevotionalHighlight extends Highlight {
  devotional_id: string;
  source_type: "devotional";
}

export function useHighlights(devotionalId?: string, sermonId?: string) {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const fetch = useCallback(async () => {
    setHighlights([]);
    if (!user) return;
    if (devotionalId) {
      const { data } = await supabase
        .from("devotional_highlights")
        .select("id, text, section, color, note")
        .eq("devotional_id", devotionalId);
      if (data) setHighlights(data as Highlight[]);
    }
    if (sermonId) {
      const { data } = await supabase
        .from("devotional_highlights")
        .select("id, text, section, color, note")
        .eq("sermon_id", sermonId);
      if (data) setHighlights(data as Highlight[]);
    }
  }, [user, devotionalId, sermonId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addHighlight = useCallback(async (hl: { text: string; section: string; color: string; note?: string }) => {
    if (!user) throw new Error("Sign in to save highlights");
    const { data, error } = await supabase.from("devotional_highlights").insert({
      user_id: user.id,
      devotional_id: devotionalId ?? null,
      sermon_id: sermonId ?? null,
      text: hl.text,
      section: hl.section,
      color: hl.color,
      note: hl.note || null,
      source_type: devotionalId ? "devotional" : "sermon",
    }).select("id, text, section, color, note").single();
    if (error) throw error;
    if (data) setHighlights((prev) => [...prev, data as Highlight]);
  }, [user, devotionalId, sermonId]);

  const removeHighlight = useCallback(async (id: string) => {
    await supabase.from("devotional_highlights").delete().eq("id", id);
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { highlights, addHighlight, removeHighlight };
}
