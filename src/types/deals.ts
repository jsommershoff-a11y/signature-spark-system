export type DealStage = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Deal {
  id: string;
  title: string;
  stage: DealStage;
  value: number | null;
  currency: string;
  probability: number;
  expected_close_date: string | null;
  lead_id: string | null;
  customer_id: string | null;
  owner_id: string | null;
  lost_reason: string | null;
  notes: string | null;
  stage_updated_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const DEAL_STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'new',         label: 'Neu',         color: 'bg-slate-500' },
  { id: 'qualified',   label: 'Qualifiziert', color: 'bg-blue-500' },
  { id: 'proposal',    label: 'Angebot',      color: 'bg-amber-500' },
  { id: 'negotiation', label: 'Verhandeln',   color: 'bg-orange-500' },
  { id: 'won',         label: 'Gewonnen',     color: 'bg-emerald-600' },
  { id: 'lost',        label: 'Verloren',     color: 'bg-red-500' },
];

export const DEFAULT_PROBABILITY: Record<DealStage, number> = {
  new: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  won: 100,
  lost: 0,
};
