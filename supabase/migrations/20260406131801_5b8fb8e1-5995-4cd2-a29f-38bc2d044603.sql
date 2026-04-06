
-- 1. Create tables first (no foreign key cross-references yet for RLS)
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  display_name TEXT NOT NULL DEFAULT '',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

CREATE TABLE public.family_devotionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  devotional_id UUID REFERENCES public.devotionals(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_devotionals ENABLE ROW LEVEL SECURITY;

-- 3. Helper function
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id AND family_id = _family_id
  )
$$;

-- 4. Families policies
CREATE POLICY "Authenticated can lookup families" ON public.families
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create families" ON public.families
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owner can update family" ON public.families
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owner can delete family" ON public.families
  FOR DELETE USING (auth.uid() = created_by);

-- 5. Family members policies
CREATE POLICY "Members can view co-members" ON public.family_members
  FOR SELECT USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Users can join families" ON public.family_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave families" ON public.family_members
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Family devotionals policies
CREATE POLICY "Members can view family devotionals" ON public.family_devotionals
  FOR SELECT USING (public.is_family_member(auth.uid(), family_id));

CREATE POLICY "Members can share devotionals" ON public.family_devotionals
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = shared_by AND public.is_family_member(auth.uid(), family_id)
  );

CREATE POLICY "Sharer can remove shared devotional" ON public.family_devotionals
  FOR DELETE USING (auth.uid() = shared_by);
