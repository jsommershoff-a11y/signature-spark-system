import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AiAnalysis } from '@/types/calls';

export function useAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const fetchAnalysis = useCallback(async (callId: string): Promise<AiAnalysis | null> => {
    try {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('call_id', callId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      return data as unknown as AiAnalysis | null;
    } catch (err) {
      console.error('Error fetching analysis:', err);
      return null;
    }
  }, []);

  const getLatestAnalysis = useCallback(async (leadId: string): Promise<AiAnalysis | null> => {
    try {
      const { data, error } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as AiAnalysis | null;
    } catch (err) {
      console.error('Error fetching latest analysis:', err);
      return null;
    }
  }, []);

  const regenerateAnalysis = useCallback(async (callId: string): Promise<AiAnalysis | null> => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-call', {
        body: { call_id: callId },
      });

      if (error) throw error;

      toast({
        title: 'Analyse gestartet',
        description: 'Die KI-Analyse wird erstellt. Dies kann einige Sekunden dauern.',
      });

      // Poll for result
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const analysis = await fetchAnalysis(callId);
        if (analysis && new Date(analysis.created_at) > new Date(Date.now() - 60000)) {
          toast({
            title: 'Analyse abgeschlossen',
            description: 'Die KI-Analyse wurde erfolgreich erstellt.',
          });
          return analysis;
        }
        attempts++;
      }

      throw new Error('Analyse-Timeout');
    } catch (err) {
      console.error('Error regenerating analysis:', err);
      toast({
        title: 'Fehler',
        description: 'Die Analyse konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [fetchAnalysis, toast]);

  return {
    analyzing,
    fetchAnalysis,
    getLatestAnalysis,
    regenerateAnalysis,
  };
}
