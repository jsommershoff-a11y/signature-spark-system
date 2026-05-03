import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { 
  CrmLead, 
  LeadFilters, 
  CreateLeadInput, 
  UpdateLeadInput,
  PipelineStage 
} from '@/types/crm';
import { useToast } from '@/hooks/use-toast';

export function useLeads(filters?: LeadFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('crm_leads')
        .select(`
          *,
          owner:profiles!crm_leads_owner_user_id_fkey(id, first_name, last_name, full_name),
          pipeline_item:pipeline_items(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.source_type) {
        query = query.eq('source_type', filters.source_type);
      }
      if (filters?.owner_user_id) {
        query = query.eq('owner_user_id', filters.owner_user_id);
      }
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = (data || []).map(lead => ({
        ...lead,
        pipeline_item: lead.pipeline_item?.[0] || null
      })) as CrmLead[];

      if (filters?.stage) {
        results = results.filter(lead => 
          (lead as any).pipeline_item?.stage === filters.stage
        );
      }

      return results;
    },
  });

  const createLead = async (input: CreateLeadInput): Promise<CrmLead | null> => {
    try {
      const dbInput = {
        ...input,
        icp_fit_reason: input.icp_fit_reason as Json | undefined,
      };

      const { data, error } = await supabase
        .from('crm_leads')
        .insert(dbInput)
        .select(`
          *,
          owner:profiles!crm_leads_owner_user_id_fkey(id, first_name, last_name, full_name),
          pipeline_item:pipeline_items(*)
        `)
        .single();

      if (error) throw error;

      const newLead = {
        ...data,
        pipeline_item: data.pipeline_item?.[0] || null
      } as CrmLead;

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast({
        title: 'Lead erstellt',
        description: `${input.first_name} ${input.last_name || ''} wurde hinzugefügt.`,
      });

      return newLead;
    } catch (err) {
      toast({
        title: 'Fehler beim Erstellen des Leads',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateLead = async (input: UpdateLeadInput): Promise<CrmLead | null> => {
    try {
      const { id, ...updates } = input;
      const dbUpdates = {
        ...updates,
        icp_fit_reason: updates.icp_fit_reason as Json | undefined,
      };

      const { data, error } = await supabase
        .from('crm_leads')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          owner:profiles!crm_leads_owner_user_id_fkey(id, first_name, last_name, full_name),
          pipeline_item:pipeline_items(*)
        `)
        .single();

      if (error) throw error;

      const updatedLead = {
        ...data,
        pipeline_item: data.pipeline_item?.[0] || null
      } as CrmLead;

      queryClient.invalidateQueries({ queryKey: ['leads'] });

      toast({
        title: 'Lead aktualisiert',
        description: 'Änderungen wurden gespeichert.',
      });

      return updatedLead;
    } catch (err) {
      toast({
        title: 'Fehler beim Aktualisieren',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['leads'] });

      toast({
        title: 'Lead gelöscht',
        description: 'Der Lead wurde erfolgreich entfernt.',
      });

      return true;
    } catch (err) {
      toast({
        title: 'Fehler beim Löschen',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const assignLead = async (leadId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_leads')
        .update({ owner_user_id: userId })
        .eq('id', leadId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['leads'] });

      toast({
        title: 'Lead zugewiesen',
        description: 'Der Lead wurde erfolgreich zugewiesen.',
      });

      return true;
    } catch (err) {
      toast({
        title: 'Fehler bei der Zuweisung',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updatePipelineStage = async (leadId: string, stage: PipelineStage): Promise<boolean> => {
    try {
      // Vorherigen Stand für stage_changed-Log holen
      const { data: existing, error: readErr } = await supabase
        .from('pipeline_items')
        .select('stage')
        .eq('lead_id', leadId)
        .maybeSingle();
      if (readErr) throw readErr;
      const fromStage = (existing?.stage as PipelineStage | undefined) ?? null;
      if (fromStage === stage) return true;

      const { error } = await supabase
        .from('pipeline_items')
        .update({ 
          stage, 
          stage_updated_at: new Date().toISOString() 
        })
        .eq('lead_id', leadId);

      if (error) throw error;

      // Audit-Log: stage_changed
      const { data: userRes } = await supabase.auth.getUser();
      const authUserId = userRes?.user?.id;
      let actorProfileId: string | null = null;
      if (authUserId) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authUserId)
          .maybeSingle();
        actorProfileId = (prof?.id as string | undefined) ?? null;
      }
      const { error: actErr } = await supabase.from('activities').insert({
        lead_id: leadId,
        user_id: actorProfileId,
        type: 'stage_changed' as never,
        content: `Stage gewechselt: ${fromStage ?? '—'} → ${stage}`,
        metadata: { from_stage: fromStage, to_stage: stage } as never,
      });
      if (actErr) console.warn('[stage_changed] activity log failed', actErr);

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      toast({
        title: 'Pipeline aktualisiert',
        description: `Stage auf "${stage}" geändert.`,
      });

      return true;
    } catch (err) {
      toast({
        title: 'Fehler beim Aktualisieren der Pipeline',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    leads: data ?? [],
    loading: isLoading,
    error: error as Error | null,
    refetch,
    createLead,
    updateLead,
    deleteLead,
    assignLead,
    updatePipelineStage,
  };
}
