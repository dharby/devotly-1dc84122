import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Note {
  id: string;
  title: string;
  body: string;
  folder: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user) { setNotes([]); setLoading(false); return; }
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (data) setNotes(data as Note[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const createNote = useCallback(async (folder = "Notes") => {
    if (!user) return null;
    const { data } = await supabase
      .from("notes")
      .insert({ user_id: user.id, title: "", body: "", folder })
      .select()
      .single();
    await fetchNotes();
    return (data as Note) ?? null;
  }, [user, fetchNotes]);

  const updateNote = useCallback(async (id: string, patch: Partial<Pick<Note, "title" | "body" | "folder" | "pinned">>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    await supabase.from("notes").update(patch).eq("id", id);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
  }, []);

  return { notes, loading, createNote, updateNote, deleteNote, refresh: fetchNotes };
}
