import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SermonRecord {
  id: string;
  topic: string;
  style: string;
  audience: string;
  title: string;
  content: any;
  saved: boolean;
  bookmarked: boolean;
  completed: boolean;
  notes: string | null;
  createdAt: string;
}

function map(row: any): SermonRecord {
  return {
    id: row.id,
    topic: row.topic,
    style: row.style,
    audience: row.audience,
    title: row.title,
    content: row.content,
    saved: row.saved,
    bookmarked: row.bookmarked,
    completed: row.completed,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export interface SermonHighlight {
  id: string;
  text: string;
  section: string;
  color: string;
  note?: string;
}

export function useSermons() {
  const { user } = useAuth();
  const [sermons, setSermons] = useState<SermonRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) { setSermons([]); setLoading(false); return; }
    const { data } = await supabase
      .from("sermons" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSermons((data as any[]).map(map));
    setLoading(false);
  }, [user]);

  useEffect(() => { refetch(); }, [refetch]);

  const createSermon = useCallback(async (payload: {
    topic: string; style: string; audience: string; title: string; content: any;
  }) => {
    if (!user) return null;
    const { data } = await supabase.from("sermons" as any).insert({
      user_id: user.id,
      topic: payload.topic,
      style: payload.style,
      audience: payload.audience,
      title: payload.title,
      content: payload.content,
      saved: true,
    }).select("*").single();
    if (data) {
      const rec = map(data);
      setSermons((prev) => [rec, ...prev]);
      return rec;
    }
    return null;
  }, [user]);

  const updateSermon = useCallback(async (id: string, patch: Partial<Pick<SermonRecord, "saved"|"bookmarked"|"completed"|"notes">>) => {
    await supabase.from("sermons" as any).update(patch).eq("id", id);
    setSermons((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } as SermonRecord : s));
  }, []);

  const deleteSermon = useCallback(async (id: string) => {
    await supabase.from("sermons" as any).delete().eq("id", id);
    setSermons((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getSermonHighlights = useCallback(async (sermonId: string) => {
    if (!user) return [];
    const { data } = await supabase
      .from("devotional_highlights")
      .select("id, text, section, color, note")
      .eq("sermon_id", sermonId);
    return data as SermonHighlight[];
  }, [user]);

  return { sermons, loading, createSermon, updateSermon, deleteSermon, refetch, getSermonHighlights };
}