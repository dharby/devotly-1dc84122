import { supabase } from "@/integrations/supabase/client";
import { getSettings } from "./settingsStore";

export interface DailyWord {
  word: string;
  original: string;
  transliteration: string;
  meaning: string;
  reference: string;
  verse: string;
  application: string;
}

export interface DailyScripture {
  reference: string;
  text: string;
  translation: string;
  reflection: string;
}

export interface DailyContent {
  date: string;
  word: DailyWord;
  scripture: DailyScripture;
}

const KEY = "daily_content";

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getCachedDailyContent(): DailyContent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyContent;
    return parsed?.date === todayKey() ? parsed : null;
  } catch {
    return null;
  }
}

let inflight: Promise<DailyContent | null> | null = null;

/** Fetch today's word + scripture, cached per day in localStorage. */
export async function getDailyContent(force = false): Promise<DailyContent | null> {
  if (!force) {
    const cached = getCachedDailyContent();
    if (cached) return cached;
    if (inflight) return inflight;
  }

  inflight = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke("daily-word", {
        body: { date: todayKey(), translation: getSettings().bibleTranslation },
      });
      if (error || !data?.word || !data?.scripture) return null;
      const content: DailyContent = { date: todayKey(), word: data.word, scripture: data.scripture };
      localStorage.setItem(KEY, JSON.stringify(content));
      return content;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
