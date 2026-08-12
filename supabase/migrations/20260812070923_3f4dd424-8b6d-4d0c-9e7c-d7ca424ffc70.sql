CREATE TABLE public.bible_reading_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  translation text NOT NULL DEFAULT 'ESV',
  reminder_enabled boolean NOT NULL DEFAULT false,
  reminder_time text NOT NULL DEFAULT '07:30',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_reading_plans TO authenticated;
GRANT ALL ON public.bible_reading_plans TO service_role;
ALTER TABLE public.bible_reading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reading plan" ON public.bible_reading_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_bible_reading_plans_updated_at BEFORE UPDATE ON public.bible_reading_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bible_reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_reading_progress TO authenticated;
GRANT ALL ON public.bible_reading_progress TO service_role;
ALTER TABLE public.bible_reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reading progress" ON public.bible_reading_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);