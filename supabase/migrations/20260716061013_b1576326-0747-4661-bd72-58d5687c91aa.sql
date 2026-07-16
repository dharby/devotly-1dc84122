
CREATE TABLE public.sermons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'expository',
  audience TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  saved BOOLEAN NOT NULL DEFAULT true,
  bookmarked BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sermons TO authenticated;
GRANT ALL ON public.sermons TO service_role;

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sermons"
  ON public.sermons FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sermons_updated_at
  BEFORE UPDATE ON public.sermons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_sermons_user ON public.sermons(user_id, created_at DESC);
