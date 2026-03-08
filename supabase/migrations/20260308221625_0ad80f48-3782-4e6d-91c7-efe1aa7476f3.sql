
-- Learning path level enum
CREATE TYPE public.learning_path_level AS ENUM ('starter', 'fortgeschritten', 'experte');

-- Learning paths table (represents a topic like "KI-Prompting")
CREATE TABLE public.learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'BookOpen',
  color text DEFAULT 'orange',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read learning paths
CREATE POLICY "Authenticated can read learning_paths" ON public.learning_paths
  FOR SELECT TO authenticated USING (true);

-- Staff can manage
CREATE POLICY "Staff can manage learning_paths" ON public.learning_paths
  FOR ALL USING (has_min_role(auth.uid(), 'teamleiter'::app_role));

-- Add learning_path_id and level to courses
ALTER TABLE public.courses
  ADD COLUMN learning_path_id uuid REFERENCES public.learning_paths(id) ON DELETE SET NULL,
  ADD COLUMN path_level learning_path_level DEFAULT 'starter';

-- Index for fast lookup
CREATE INDEX idx_courses_learning_path ON public.courses(learning_path_id, path_level);
