import { useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PipelineItem, PipelineStage, CrmLead } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';

export interface PipelineItemWithLead extends PipelineItem {
  lead: CrmLead;
}

export interface PipelineData {
  [key: string]: PipelineItemWithLead[];
}

const STAGES: PipelineStage[] = [
  'new_lead',
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
  'lost'
];

export function usePipeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pipelineItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_items')
        .select(`
          *,
          lead:crm_leads(
            *,
            owner:profiles!crm_leads_owner_user_id_fkey(id, first_name, last_name, full_name)
          )
        `)
        .order('pipeline_priority_score', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        lead: item.lead as CrmLead
      })) as PipelineItemWithLead[];
    },
  });

  const pipelineByStage = useMemo(() => {
    const byStage: PipelineData = {};
    STAGES.forEach(stage => {
      byStage[stage] = pipelineItems.filter(item => item.stage === stage);
    });
    return byStage;
  }, [pipelineItems]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('pipeline-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pipeline_items' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pipeline'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const moveToStage = async (itemId: string, newStage: PipelineStage): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pipeline_items')
        .update({ 
          stage: newStage, 
          stage_updated_at: new Date().toISOString() 
        })
        .eq('id', itemId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });

      toast({
        title: 'Pipeline aktualisiert',
        description: 'Lead wurde verschoben.',
      });

      return true;
    } catch (err) {
      toast({
        title: 'Fehler beim Verschieben',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updatePriority = async (itemId: string, priority: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('pipeline_items')
        .update({ pipeline_priority_score: priority })
        .eq('id', itemId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['pipeline'] });

      return true;
    } catch (err) {
      toast({
        title: 'Fehler beim Aktualisieren der Priorität',
        description: (err as Error).message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getStageCount = (stage: PipelineStage): number => {
    return pipelineByStage[stage]?.length || 0;
  };

  const getTotalValue = (stage: PipelineStage): number => {
    return getStageCount(stage);
  };

  return {
    pipelineItems,
    pipelineByStage,
    loading: isLoading,
    error: error as Error | null,
    refetch,
    moveToStage,
    updatePriority,
    getStageCount,
    getTotalValue,
  };
}
