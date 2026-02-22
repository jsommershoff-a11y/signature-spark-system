import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PipelineItem, PipelineStage, CrmLead } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';

export interface PipelineItemWithLead extends PipelineItem {
  lead: CrmLead;
}

export interface PipelineData {
  [key: string]: PipelineItemWithLead[];
}

export function usePipeline() {
  const [pipelineItems, setPipelineItems] = useState<PipelineItemWithLead[]>([]);
  const [pipelineByStage, setPipelineByStage] = useState<PipelineData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchPipeline = useCallback(async () => {
    try {
      setLoading(true);
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

      const items = (data || []).map(item => ({
        ...item,
        lead: item.lead as CrmLead
      })) as PipelineItemWithLead[];

      setPipelineItems(items);

      // Group by stage
      const byStage: PipelineData = {};
      const stages: PipelineStage[] = [
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

      stages.forEach(stage => {
        byStage[stage] = items.filter(item => item.stage === stage);
      });

      setPipelineByStage(byStage);
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Fehler beim Laden der Pipeline',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  // Realtime: auto-refresh on pipeline_items changes
  useEffect(() => {
    const channel = supabase
      .channel('pipeline-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pipeline_items' },
        () => {
          fetchPipeline();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPipeline]);

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

      // Optimistically update local state
      setPipelineItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, stage: newStage, stage_updated_at: new Date().toISOString() }
            : item
        )
      );

      // Re-group by stage
      const updatedItems = pipelineItems.map(item => 
        item.id === itemId 
          ? { ...item, stage: newStage }
          : item
      );

      const byStage: PipelineData = {};
      const stages: PipelineStage[] = [
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

      stages.forEach(stage => {
        byStage[stage] = updatedItems.filter(item => item.stage === stage);
      });

      setPipelineByStage(byStage);

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

      await fetchPipeline();

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
    // This would calculate monetary value if we had that field
    return getStageCount(stage);
  };

  return {
    pipelineItems,
    pipelineByStage,
    loading,
    error,
    refetch: fetchPipeline,
    moveToStage,
    updatePriority,
    getStageCount,
    getTotalValue,
  };
}
