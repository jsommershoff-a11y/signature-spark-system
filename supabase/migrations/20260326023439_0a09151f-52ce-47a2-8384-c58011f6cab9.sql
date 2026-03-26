-- Prompt Library: categories and individual prompts with tier gating
CREATE TABLE public.prompt_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.prompt_categories(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  prompt_text text NOT NULL,
  min_tier text NOT NULL DEFAULT 'basic',
  is_customizable boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  url text,
  icon_url text,
  min_tier text NOT NULL DEFAULT 'basic',
  is_featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read prompt categories"
  ON public.prompt_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read prompts"
  ON public.prompts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read tools"
  ON public.tools FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage prompt categories"
  ON public.prompt_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage prompts"
  ON public.prompts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage tools"
  ON public.tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));