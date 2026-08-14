import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface StoredHighlight {
  id: string;
  text: string;
  section: string;
  color: string;
  note: string | null;
  devotional_id: string | null;
  sermon_id: string | null;
  source_type: string;
  created_at: string;
}

export function useAllHighlights() {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<StoredHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) { setHighlights([]); setLoading(false); return; }
    const { data } = await supabase
      .from("devotional_highlights" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setHighlights(data as any as StoredHighlight[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { refetch(); }, [refetch]);

  const deleteHighlight = useCallback(async (id: string) => {
    await supabase.from("devotional_highlights").delete().eq("id", id);
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return { highlights, loading, deleteHighlight, refetch };
}
