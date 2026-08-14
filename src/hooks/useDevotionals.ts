import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Devotional {
  id: string;
  title: string;
  topic: string;
  tone: "personal" | "family" | "encouraging" | "deep";
  scripture: string;
  scriptureReference: string;
  translation?: string;
  translations?: { version: string; text: string }[];
  greekLatinInsights?: string;
  reflection: string;
  prayer: string;
  declaration?: string;
  createdAt: string;
  completed: boolean;
  saved: boolean;
}

export function useDevotionals() {
  const { user } = useAuth();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevotionals = useCallback(async () => {
    if (!user) { setDevotionals([]); setLoading(false); return; }
    const { data } = await supabase
      .from("devotionals")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setDevotionals(data.map(mapRow));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchDevotionals(); }, [fetchDevotionals]);

  const saveDevotional = useCallback(async (dev: Devotional) => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("devotionals")
      .select("id")
      .eq("id", dev.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("devotionals").update({
        title: dev.title,
        topic: dev.topic,
        tone: dev.tone,
        scripture: dev.scripture,
        scripture_reference: dev.scriptureReference,
        translation: dev.translation || "ESV",
        translations: dev.translations || [],
        greek_latin_insights: dev.greekLatinInsights || null,
        reflection: dev.reflection,
        prayer: dev.prayer,
        declaration: dev.declaration || null,
        completed: dev.completed,
        saved: dev.saved,
      }).eq("id", dev.id);
    } else {
      await supabase.from("devotionals").insert({
        id: dev.id,
        user_id: user.id,
        title: dev.title,
        topic: dev.topic,
        tone: dev.tone,
        scripture: dev.scripture,
        scripture_reference: dev.scriptureReference,
        translation: dev.translation || "ESV",
        translations: dev.translations || [],
        greek_latin_insights: dev.greekLatinInsights || null,
        reflection: dev.reflection,
        prayer: dev.prayer,
        declaration: dev.declaration || null,
        completed: dev.completed,
        saved: dev.saved,
        created_at: dev.createdAt,
      });
    }
    await fetchDevotionals();
  }, [user, fetchDevotionals]);

  const deleteDevotional = useCallback(async (id: string) => {
    setDevotionals((prev) => prev.filter((d) => d.id !== id));
    await supabase.from("devotional_highlights").delete().eq("devotional_id", id);
    await supabase.from("devotionals").delete().eq("id", id);
  }, []);

  return { devotionals, loading, saveDevotional, deleteDevotional, refetch: fetchDevotionals };
}

function mapRow(row: any): Devotional {
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    tone: row.tone,
    scripture: row.scripture,
    scriptureReference: row.scripture_reference,
    translation: row.translation || "ESV",
    translations: Array.isArray(row.translations) ? row.translations : [],
    greekLatinInsights: row.greek_latin_insights,
    reflection: row.reflection,
    prayer: row.prayer,
    declaration: row.declaration,
    createdAt: row.created_at,
    completed: row.completed,
    saved: row.saved,
  };
}
