CREATE TABLE public.saved_scriptures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference text NOT NULL,
  snippet text NOT NULL DEFAULT '',
  paraphrase text NOT NULL DEFAULT '',
  context text,
  themes jsonb NOT NULL DEFAULT '[]'::jsonb,
  query text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_scriptures TO authenticated;
GRANT ALL ON public.saved_scriptures TO service_role;

ALTER TABLE public.saved_scriptures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved scriptures"
ON public.saved_scriptures FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.devotional_highlights ALTER COLUMN devotional_id DROP NOT NULL;
ALTER TABLE public.devotional_highlights ADD COLUMN IF NOT EXISTS sermon_id uuid REFERENCES public.sermons(id) ON DELETE CASCADE;
ALTER TABLE public.devotional_highlights ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'devotional';