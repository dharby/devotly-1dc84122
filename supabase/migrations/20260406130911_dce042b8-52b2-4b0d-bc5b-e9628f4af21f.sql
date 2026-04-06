
-- Devotionals table
CREATE TABLE public.devotionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'personal',
  scripture TEXT NOT NULL DEFAULT '',
  scripture_reference TEXT NOT NULL DEFAULT '',
  greek_latin_insights TEXT,
  reflection TEXT NOT NULL DEFAULT '',
  prayer TEXT NOT NULL DEFAULT '',
  declaration TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  saved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own devotionals" ON public.devotionals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Highlights table
CREATE TABLE public.devotional_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  devotional_id UUID REFERENCES public.devotionals(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'content',
  color TEXT NOT NULL DEFAULT 'yellow',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.devotional_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own highlights" ON public.devotional_highlights
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tracker days table
CREATE TABLE public.tracker_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  devotional_id UUID REFERENCES public.devotionals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.tracker_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tracker days" ON public.tracker_days
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Fasting table
CREATE TABLE public.fasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_days INTEGER NOT NULL,
  checkins DATE[] NOT NULL DEFAULT '{}',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own fasts" ON public.fasts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
