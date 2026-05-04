import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PipelineStage } from '@/types/crm';

const MANDATORY_KEY = 'crm.mandatory_skip_dialog_stages';

export interface MandatorySkipStagesValue {
  stages: PipelineStage[];
}

/**
 * Globale Admin-Policy: Liste der Ziel-Stages, für die der Skip-Dialog
 * verpflichtend ist. User-Suppressions werden für diese Stages ignoriert.
 */
export function useMandatorySkipStages() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', MANDATORY_KEY)
      .maybeSingle();
    if (!error && data?.value) {
      const v = data.value as unknown as MandatorySkipStagesValue;
      setStages(Array.isArray(v?.stages) ? v.stages : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel('app_settings:crm_mandatory')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings', filter: `key=eq.${MANDATORY_KEY}` },
        () => load()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const save = useCallback(async (next: PipelineStage[]) => {
    const { error } = await supabase
      .from('app_settings')
      .update({ value: { stages: next } as never, updated_at: new Date().toISOString() })
      .eq('key', MANDATORY_KEY);
    if (error) throw error;
    setStages(next);
  }, []);

  return { stages, loading, save, reload: load };
}

export const MANDATORY_SKIP_STAGES_KEY = MANDATORY_KEY;
