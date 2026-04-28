-- 1. Zoom Summary Run-Log
CREATE TABLE public.zoom_summary_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','success','failed','partial')),
  emails_scanned INT NOT NULL DEFAULT 0,
  summaries_parsed INT NOT NULL DEFAULT 0,
  leads_matched INT NOT NULL DEFAULT 0,
  pending_matches INT NOT NULL DEFAULT 0,
  offers_drafted INT NOT NULL DEFAULT 0,
  followups_created INT NOT NULL DEFAULT 0,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  triggered_by TEXT NOT NULL DEFAULT 'cron',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_zoom_runs_started ON public.zoom_summary_runs (started_at DESC);

-- 2. Zoom Summaries (parsed)
CREATE TABLE public.zoom_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_message_id TEXT NOT NULL UNIQUE,
  gmail_thread_id TEXT,
  subject TEXT,
  from_address TEXT,
  received_at TIMESTAMPTZ,
  meeting_topic TEXT,
  meeting_date TIMESTAMPTZ,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_summary TEXT,
  ai_extraction JSONB NOT NULL DEFAULT '{}'::jsonb,
  intent TEXT CHECK (intent IN ('interest','followup','rejection','unclear')),
  matched_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  matched_via TEXT,
  match_confidence NUMERIC,
  calendar_event_id TEXT,
  calendar_source TEXT,
  offer_draft_id UUID,
  followup_task_id UUID,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_zoom_summaries_lead ON public.zoom_summaries (matched_lead_id);
CREATE INDEX idx_zoom_summaries_intent ON public.zoom_summaries (intent);
CREATE INDEX idx_zoom_summaries_received ON public.zoom_summaries (received_at DESC);

-- 3. Pending Matches (manual review)
CREATE TABLE public.pending_zoom_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zoom_summary_id UUID NOT NULL REFERENCES public.zoom_summaries(id) ON DELETE CASCADE,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_lead_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','ignored')),
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pending_matches_status ON public.pending_zoom_matches (status, created_at DESC);

-- 4. Offer Drafts (KI-generiert, vor Freigabe)
CREATE TABLE public.offer_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  zoom_summary_id UUID REFERENCES public.zoom_summaries(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review_required','correction','approved','sent','rejected')),
  
  -- A) Problem-Analyse
  problem_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- B) Lösungskonzept
  solution_concept JSONB NOT NULL DEFAULT '{}'::jsonb,
  matched_catalog_product_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_custom_solution BOOLEAN NOT NULL DEFAULT false,
  required_connectors JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- C) Kostenanalyse (intern)
  internal_cost_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- D) Preisstrategie
  pricing_strategy JSONB NOT NULL DEFAULT '{}'::jsonb,
  suggested_price_cents INT,
  min_price_cents INT,
  margin_percent NUMERIC,
  -- E) Nutzenanalyse
  benefit_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- F) Kunden-Zuarbeiten
  client_inputs_required JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- QA / Review
  qa_checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  qa_passed BOOLEAN NOT NULL DEFAULT false,
  reviewer_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  converted_offer_id UUID,
  
  ai_model TEXT,
  ai_tokens_used INT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_offer_drafts_lead ON public.offer_drafts (lead_id);
CREATE INDEX idx_offer_drafts_status ON public.offer_drafts (status, created_at DESC);

-- 5. Product Pattern Suggestions (Lernsystem)
CREATE TABLE public.product_pattern_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_signature TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  occurrence_count INT NOT NULL DEFAULT 1,
  example_draft_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_product_name TEXT,
  suggested_price_range JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','converted','dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pattern_status ON public.product_pattern_suggestions (status, occurrence_count DESC);

-- updated_at trigger
CREATE TRIGGER trg_offer_drafts_updated
  BEFORE UPDATE ON public.offer_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= RLS =============
ALTER TABLE public.zoom_summary_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoom_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_zoom_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pattern_suggestions ENABLE ROW LEVEL SECURITY;

-- zoom_summary_runs: Admin only
CREATE POLICY "admin_read_runs" ON public.zoom_summary_runs
  FOR SELECT USING (public.has_min_role(auth.uid(), 'admin'::app_role));

-- zoom_summaries: Admin alles, Vertriebspartner nur eigene Leads
CREATE POLICY "admin_all_summaries" ON public.zoom_summaries
  FOR ALL USING (public.has_min_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "owner_read_summaries" ON public.zoom_summaries
  FOR SELECT USING (
    matched_lead_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.crm_leads l
      WHERE l.id = matched_lead_id
        AND l.owner_user_id = public.get_user_profile_id(auth.uid())
    )
  );

-- pending_zoom_matches: Admin only
CREATE POLICY "admin_all_pending" ON public.pending_zoom_matches
  FOR ALL USING (public.has_min_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));

-- offer_drafts: Admin alles, Owner nur eigene
CREATE POLICY "admin_all_drafts" ON public.offer_drafts
  FOR ALL USING (public.has_min_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "owner_read_drafts" ON public.offer_drafts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.crm_leads l
      WHERE l.id = lead_id
        AND l.owner_user_id = public.get_user_profile_id(auth.uid())
    )
  );

CREATE POLICY "owner_update_drafts" ON public.offer_drafts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.crm_leads l
      WHERE l.id = lead_id
        AND l.owner_user_id = public.get_user_profile_id(auth.uid())
    )
  );

-- product_pattern_suggestions: Admin only
CREATE POLICY "admin_all_patterns" ON public.product_pattern_suggestions
  FOR ALL USING (public.has_min_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_min_role(auth.uid(), 'admin'::app_role));