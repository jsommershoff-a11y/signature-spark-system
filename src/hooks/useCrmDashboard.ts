import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PIPELINE_STAGE_LABELS,
  type PipelineStage,
} from '@/types/crm';

export type LeadSourceType =
  | 'inbound_paid'
  | 'inbound_organic'
  | 'referral'
  | 'outbound_ai'
  | 'outbound_manual'
  | 'partner';

export const SOURCE_LABELS: Record<LeadSourceType, string> = {
  inbound_paid: 'Inbound (Paid)',
  inbound_organic: 'Inbound (Organic)',
  referral: 'Empfehlung',
  outbound_ai: 'Outbound (AI)',
  outbound_manual: 'Outbound (Manuell)',
  partner: 'Partner',
};

export interface SourceStat {
  source: LeadSourceType;
  label: string;
  total: number;
  won: number;
  lost: number;
  conversionRate: number;
}

export interface StageStat {
  stage: PipelineStage;
  label: string;
  count: number;
}

export interface DealStat {
  stage: string;
  label: string;
  count: number;
  value: number;
}

export interface CrmDashboardData {
  totalLeads: number;
  newLeads7d: number;
  newLeads30d: number;
  totalWon: number;
  totalLost: number;
  openLeads: number;
  conversionRate: number;
  sources: SourceStat[];
  stages: StageStat[];
  deals: DealStat[];
  totalDealValue: number;
  wonDealValue: number;
  lastUpdated: string;
}

const DEAL_STAGE_LABELS: Record<string, string> = {
  new: 'Neu',
  qualified: 'Qualifiziert',
  proposal: 'Angebot',
  negotiation: 'Verhandeln',
  won: 'Gewonnen',
  lost: 'Verloren',
};

async function fetchDashboard(): Promise<CrmDashboardData> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: leads, error: leadsErr }, { data: pipeline, error: pipeErr }, dealsRes] =
    await Promise.all([
      supabase
        .from('crm_leads')
        .select('id, source_type, created_at')
        .is('deleted_at', null),
      supabase.from('pipeline_items').select('stage, lead_id'),
      supabase.from('deals').select('stage, value'),
    ]);

  if (leadsErr) throw leadsErr;
  if (pipeErr) throw pipeErr;

  const leadsList = leads || [];
  const pipelineList = pipeline || [];
  const dealsList = (dealsRes.data as Array<{ stage: string; value: number | null }>) || [];

  // Map lead -> stage
  const leadStage = new Map<string, PipelineStage>();
  pipelineList.forEach((p: any) => {
    if (p.lead_id) leadStage.set(p.lead_id, p.stage);
  });

  // Stage counts
  const stageCounts = new Map<PipelineStage, number>();
  pipelineList.forEach((p: any) => {
    stageCounts.set(p.stage, (stageCounts.get(p.stage) || 0) + 1);
  });

  const stages: StageStat[] = (Object.keys(PIPELINE_STAGE_LABELS) as PipelineStage[]).map(
    (s) => ({
      stage: s,
      label: PIPELINE_STAGE_LABELS[s],
      count: stageCounts.get(s) || 0,
    })
  );

  // Source stats
  const sourceMap = new Map<LeadSourceType, { total: number; won: number; lost: number }>();
  leadsList.forEach((l: any) => {
    const src = l.source_type as LeadSourceType;
    const cur = sourceMap.get(src) || { total: 0, won: 0, lost: 0 };
    cur.total += 1;
    const stage = leadStage.get(l.id);
    if (stage === 'won') cur.won += 1;
    else if (stage === 'lost') cur.lost += 1;
    sourceMap.set(src, cur);
  });

  const sources: SourceStat[] = (Object.keys(SOURCE_LABELS) as LeadSourceType[]).map((s) => {
    const v = sourceMap.get(s) || { total: 0, won: 0, lost: 0 };
    const closed = v.won + v.lost;
    return {
      source: s,
      label: SOURCE_LABELS[s],
      total: v.total,
      won: v.won,
      lost: v.lost,
      conversionRate: closed > 0 ? (v.won / closed) * 100 : 0,
    };
  });

  const totalWon = stageCounts.get('won') || 0;
  const totalLost = stageCounts.get('lost') || 0;
  const closed = totalWon + totalLost;
  const totalLeads = leadsList.length;
  const openLeads = totalLeads - totalWon - totalLost;
  const newLeads7d = leadsList.filter((l: any) => l.created_at >= sevenDaysAgo).length;
  const newLeads30d = leadsList.filter((l: any) => l.created_at >= thirtyDaysAgo).length;

  // Deals
  const dealMap = new Map<string, { count: number; value: number }>();
  dealsList.forEach((d) => {
    const cur = dealMap.get(d.stage) || { count: 0, value: 0 };
    cur.count += 1;
    cur.value += Number(d.value || 0);
    dealMap.set(d.stage, cur);
  });
  const deals: DealStat[] = Object.keys(DEAL_STAGE_LABELS).map((s) => {
    const v = dealMap.get(s) || { count: 0, value: 0 };
    return { stage: s, label: DEAL_STAGE_LABELS[s], count: v.count, value: v.value };
  });
  const totalDealValue = dealsList.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const wonDealValue = dealsList
    .filter((d) => d.stage === 'won')
    .reduce((sum, d) => sum + Number(d.value || 0), 0);

  return {
    totalLeads,
    newLeads7d,
    newLeads30d,
    totalWon,
    totalLost,
    openLeads,
    conversionRate: closed > 0 ? (totalWon / closed) * 100 : 0,
    sources,
    stages,
    deals,
    totalDealValue,
    wonDealValue,
    lastUpdated: new Date().toISOString(),
  };
}

export function useCrmDashboard() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['crm-dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('crm-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crm_leads' },
        () => queryClient.invalidateQueries({ queryKey: ['crm-dashboard'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pipeline_items' },
        () => queryClient.invalidateQueries({ queryKey: ['crm-dashboard'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals' },
        () => queryClient.invalidateQueries({ queryKey: ['crm-dashboard'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
