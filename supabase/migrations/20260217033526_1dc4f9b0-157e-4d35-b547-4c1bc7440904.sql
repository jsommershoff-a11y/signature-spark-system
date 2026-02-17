
-- goals table
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  target_amount integer NOT NULL DEFAULT 100,
  current_amount integer NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- goal_milestones table
CREATE TABLE public.goal_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

-- RLS for goals
CREATE POLICY "Staff can read own goals" ON public.goals
  FOR SELECT USING (
    has_min_role(auth.uid(), 'mitarbeiter') AND
    (user_id = get_user_profile_id(auth.uid()) OR
     created_by = get_user_profile_id(auth.uid()))
  );

CREATE POLICY "Teamleiter can read all goals" ON public.goals
  FOR SELECT USING (
    has_min_role(auth.uid(), 'teamleiter')
  );

CREATE POLICY "Teamleiter can insert goals" ON public.goals
  FOR INSERT WITH CHECK (
    has_min_role(auth.uid(), 'teamleiter')
  );

CREATE POLICY "Teamleiter can update goals" ON public.goals
  FOR UPDATE USING (
    has_min_role(auth.uid(), 'teamleiter')
  );

CREATE POLICY "Admin can delete goals" ON public.goals
  FOR DELETE USING (
    has_role(auth.uid(), 'admin')
  );

-- RLS for milestones (inherits from goal access via RLS on goals)
CREATE POLICY "Staff can read milestones" ON public.goal_milestones
  FOR SELECT USING (
    goal_id IN (SELECT id FROM public.goals)
  );

CREATE POLICY "Staff can manage milestones" ON public.goal_milestones
  FOR ALL USING (
    has_min_role(auth.uid(), 'mitarbeiter') AND
    goal_id IN (SELECT id FROM public.goals)
  );

-- updated_at trigger
CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
