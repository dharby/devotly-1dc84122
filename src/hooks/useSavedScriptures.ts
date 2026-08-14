import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SavedScripture {
  id: string;
  reference: string;
  snippet: string;
  paraphrase: string;
  context: string | null;
  themes: string[];
  query: string;
  created_at: string;
}

function map(row: any): SavedScripture {
  return {
    id: row.id,
    reference: row.reference,
    snippet: row.snippet ?? "",
    paraphrase: row.paraphrase ?? "",
    context: row.context ?? null,
    themes: Array.isArray(row.themes) ? row.themes : [],
    query: row.query ?? "",
    created_at: row.created_at,
  };
}

export function useSavedScriptures() {
  const { user } = useAuth();
  const [scriptures, setScriptures] = useState<SavedScripture[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) { setScriptures([]); setLoading(false); return; }
    const { data } = await supabase
      .from("saved_scriptures" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setScriptures((data as any[]).map(map));
    setLoading(false);
  }, [user]);

  useEffect(() => { refetch(); }, [refetch]);

  const saveScripture = useCallback(async (payload: {
    reference: string; snippet?: string; paraphrase?: string; context?: string | null; themes?: string[]; query?: string;
  }) => {
    if (!user) return null;
    const { data, error } = await supabase.from("saved_scriptures" as any).insert({
      user_id: user.id,
      reference: payload.reference,
      snippet: payload.snippet ?? "",
      paraphrase: payload.paraphrase ?? "",
      context: payload.context ?? null,
      themes: payload.themes ?? [],
      query: payload.query ?? "",
    }).select("*").single();
    if (error || !data) return null;
    const rec = map(data);
    setScriptures((prev) => [rec, ...prev]);
    return rec;
  }, [user]);

  const deleteScripture = useCallback(async (id: string) => {
    await supabase.from("saved_scriptures" as any).delete().eq("id", id);
    setScriptures((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { scriptures, loading, saveScripture, deleteScripture, refetch };
}
