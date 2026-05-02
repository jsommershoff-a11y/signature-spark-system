import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, startOfMonth } from 'date-fns';

export type TimeRange = '7d' | '30d' | '90d' | '12m';

function getStartDate(range: TimeRange): string {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  return subDays(new Date(), days).toISOString();
}

export function useRevenueData(range: TimeRange) {
  return useQuery({
    queryKey: ['reports', 'revenue', range],
    queryFn: async () => {
      const since = getStartDate(range);

      const [ordersRes, pipelineRes] = await Promise.all([
        supabase
          .from('orders')
          .select('amount_cents, paid_at, status')
          .eq('status', 'paid')
          .gte('paid_at', since),
        supabase.from('pipeline_items').select('stage'),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (pipelineRes.error) throw pipelineRes.error;

      // Group orders by month
      const monthMap: Record<string, number> = {};
      for (const o of ordersRes.data ?? []) {
        if (!o.paid_at) continue;
        const key = format(new Date(o.paid_at), 'yyyy-MM');
        monthMap[key] = (monthMap[key] ?? 0) + o.amount_cents;
      }

      const revenueByMonth = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, cents]) => ({
          month: format(startOfMonth(new Date(month + '-01')), 'MMM yyyy'),
          revenue: Math.round(cents / 100),
        }));

      // Pipeline stage distribution
      const stageMap: Record<string, number> = {};
      for (const p of pipelineRes.data ?? []) {
        const s = p.stage ?? 'unknown';
        stageMap[s] = (stageMap[s] ?? 0) + 1;
      }

      const pipelineDistribution = Object.entries(stageMap).map(([stage, count]) => ({
        stage,
        count,
      }));

      return { revenueByMonth, pipelineDistribution };
    },
  });
}

export function useTeamPerformance(range: TimeRange) {
  return useQuery({
    queryKey: ['reports', 'team', range],
    queryFn: async () => {
      const since = getStartDate(range);

      const [leadsRes, callsRes, ordersRes] = await Promise.all([
        supabase.from('crm_leads').select('owner_user_id').gte('created_at', since),
        supabase.from('calls').select('conducted_by').gte('created_at', since),
        supabase
          .from('orders')
          .select('lead_id, amount_cents, status')
          .eq('status', 'paid')
          .gte('paid_at', since),
      ]);

      if (leadsRes.error) throw leadsRes.error;
      if (callsRes.error) throw callsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      // Get lead owners for orders
      const leadOwners: Record<string, string> = {};
      for (const l of leadsRes.data ?? []) {
        if (l.owner_user_id) {
          // We need a map of lead_id -> owner, but we only have owner_user_id from leads
          // We'll aggregate by owner_user_id
        }
      }

      // Count leads per owner
      const leadCount: Record<string, number> = {};
      for (const l of leadsRes.data ?? []) {
        if (!l.owner_user_id) continue;
        leadCount[l.owner_user_id] = (leadCount[l.owner_user_id] ?? 0) + 1;
      }

      // Count calls per conductor
      const callCount: Record<string, number> = {};
      for (const c of callsRes.data ?? []) {
        if (!c.conducted_by) continue;
        callCount[c.conducted_by] = (callCount[c.conducted_by] ?? 0) + 1;
      }

      // Collect all profile IDs
      const allIds = new Set([...Object.keys(leadCount), ...Object.keys(callCount)]);

      if (allIds.size === 0) return [];

      // Fetch profile names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name')
        .in('id', Array.from(allIds));

      const nameMap: Record<string, string> = {};
      for (const p of profiles ?? []) {
        nameMap[p.id] = p.full_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unbekannt';
      }

      return Array.from(allIds).map((id) => ({
        id,
        name: nameMap[id] ?? 'Unbekannt',
        leads: leadCount[id] ?? 0,
        calls: callCount[id] ?? 0,
      }));
    },
  });
}

const STAGE_ORDER = [
  'new_lead',
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
  'lost',
];

import { PIPELINE_STAGE_LABELS, type PipelineStage } from '@/types/crm';
const STAGE_LABELS: Record<string, string> = PIPELINE_STAGE_LABELS as Record<string, string>;

export function useConversionFunnel() {
  return useQuery({
    queryKey: ['reports', 'funnel'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pipeline_items').select('stage');
      if (error) throw error;

      const stageMap: Record<string, number> = {};
      for (const p of data ?? []) {
        const s = p.stage ?? 'unknown';
        stageMap[s] = (stageMap[s] ?? 0) + 1;
      }

      return STAGE_ORDER.filter((s) => s !== 'lost').map((stage) => ({
        stage,
        label: STAGE_LABELS[stage] ?? stage,
        count: stageMap[stage] ?? 0,
      }));
    },
  });
}

export function useActivityData(range: TimeRange) {
  return useQuery({
    queryKey: ['reports', 'activity', range],
    queryFn: async () => {
      const since = getStartDate(range);
      const { data, error } = await supabase
        .from('activities')
        .select('type, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Group by week and type
      const weekMap: Record<string, Record<string, number>> = {};
      for (const a of data ?? []) {
        const weekKey = format(new Date(a.created_at), 'yyyy-\'W\'ww');
        if (!weekMap[weekKey]) weekMap[weekKey] = {};
        weekMap[weekKey][a.type] = (weekMap[weekKey][a.type] ?? 0) + 1;
      }

      const allTypes = [...new Set((data ?? []).map((a) => a.type))];

      return {
        series: Object.entries(weekMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([week, types]) => ({
            week,
            ...Object.fromEntries(allTypes.map((t) => [t, types[t] ?? 0])),
          })),
        types: allTypes,
      };
    },
  });
}
