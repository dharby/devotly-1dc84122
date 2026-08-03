ALTER TABLE public.devotionals
  ADD COLUMN IF NOT EXISTS translation text NOT NULL DEFAULT 'ESV',
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '[]'::jsonb;