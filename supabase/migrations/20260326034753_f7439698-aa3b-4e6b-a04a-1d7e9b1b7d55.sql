-- Live Events / Calendar system

-- 1. Events table
CREATE TABLE public.live_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  meeting_url text, -- Zoom/Google Meet link
  meeting_provider text DEFAULT 'zoom', -- zoom, google_meet, teams
  is_recurring boolean DEFAULT false,
  recurrence_rule text, -- e.g. 'weekly', 'biweekly'
  max_participants integer,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view events
CREATE POLICY "Authenticated users can view events"
  ON public.live_events FOR SELECT TO authenticated
  USING (true);

-- Only admin/gruppenbetreuer can manage events
CREATE POLICY "Staff can manage events"
  ON public.live_events FOR ALL TO authenticated
  USING (has_min_role(auth.uid(), 'gruppenbetreuer'))
  WITH CHECK (has_min_role(auth.uid(), 'gruppenbetreuer'));

-- 2. Event registrations
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.live_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  registered_at timestamptz NOT NULL DEFAULT now(),
  attended boolean DEFAULT false,
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations"
  ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_min_role(auth.uid(), 'gruppenbetreuer'));

CREATE POLICY "Users can register for events"
  ON public.event_registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unregister"
  ON public.event_registrations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can manage registrations"
  ON public.event_registrations FOR ALL TO authenticated
  USING (has_min_role(auth.uid(), 'gruppenbetreuer'))
  WITH CHECK (has_min_role(auth.uid(), 'gruppenbetreuer'));

-- 3. Topic submissions for live calls
CREATE TABLE public.event_topic_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.live_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  description text,
  votes integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_topic_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view topics"
  ON public.event_topic_submissions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can submit topics"
  ON public.event_topic_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own topics"
  ON public.event_topic_submissions FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can manage topics"
  ON public.event_topic_submissions FOR ALL TO authenticated
  USING (has_min_role(auth.uid(), 'gruppenbetreuer'))
  WITH CHECK (has_min_role(auth.uid(), 'gruppenbetreuer'));

-- Updated_at trigger for live_events
CREATE TRIGGER update_live_events_updated_at
  BEFORE UPDATE ON public.live_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();