import { useState, useEffect, useCallback } from 'react';
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
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('crm_leads')
        .select(`
          *,
          owner:profiles!crm_leads_owner_user_id_fkey(id, first_name, last_name, full_name),
          pipeline_item:pipeline_items(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
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
      if (filters?.stage) {
        // Filter by pipeline stage - we need to filter in memory after the join
        const { data, error } = await query;
        if (error) throw error;
        
        const filteredData = (data || []).filter(lead => 
          lead.pipeline_item?.[0]?.stage === filters.stage
        );
        
        setLeads(filteredData.map(lead => ({
          ...lead,
          pipeline_item: lead.pipeline_item?.[0] || null
        })) as CrmLead[]);
        return;
      }

      const { data, error } = await query;
      if (error) throw error;

      setLeads((data || []).map(lead => ({
        ...lead,
        pipeline_item: lead.pipeline_item?.[0] || null
      })) as CrmLead[]);
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Fehler beim Laden der Leads',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const createLead = async (input: CreateLeadInput): Promise<CrmLead | null> => {
    try {
      // Convert to database-compatible format
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

      setLeads(prev => [newLead, ...prev]);
      
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
      // Convert to database-compatible format
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

      setLeads(prev => prev.map(lead => 
        lead.id === id ? updatedLead : lead
      ));

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

      setLeads(prev => prev.filter(lead => lead.id !== id));

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

      await fetchLeads();

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
      const { error } = await supabase
        .from('pipeline_items')
        .update({ 
          stage, 
          stage_updated_at: new Date().toISOString() 
        })
        .eq('lead_id', leadId);

      if (error) throw error;

      await fetchLeads();

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
    leads,
    loading,
    error,
    refetch: fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    assignLead,
    updatePipelineStage,
  };
}
