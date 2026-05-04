import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PipelineStage } from '@/types/crm';
import {
  registerCrmDialogPrefsSyncer,
  applyServerStageDialogPrefs,
} from '@/lib/crm/stage-dialog-prefs';

const META_KEY = 'crm_dialog_prefs';

interface ServerPrefs {
  transition?: PipelineStage[];
  skip?: PipelineStage[];
  updated_at?: string;
}

/**
 * Synchronisiert die Skip-Dialog-Suppressions zwischen LocalStorage und
 * `profiles.meta.crm_dialog_prefs`, damit die Stillstellungen device-übergreifend
 * gelten. Beim Login zieht der Server-Stand und überschreibt LocalStorage,
 * danach werden lokale Änderungen debounced zurückgespiegelt.
 */
export function useCrmDialogPrefsSync() {
  const { user, profile } = useAuth();
  const hasHydrated = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from server once profile is available
  useEffect(() => {
    if (!user || !profile || hasHydrated.current) return;
    const meta = (profile as { meta?: Record<string, unknown> }).meta || {};
    const server = meta[META_KEY] as ServerPrefs | undefined;
    if (server) applyServerStageDialogPrefs(server);
    hasHydrated.current = true;

    // Notify other listeners (CrmDialogPrefsCard) of refreshed local data
    window.dispatchEvent(new StorageEvent('storage', { key: 'crm:stage-dialog:hydrated' }));
  }, [user, profile]);

  // Register debounced syncer
  useEffect(() => {
    if (!user) {
      registerCrmDialogPrefsSyncer(null);
      hasHydrated.current = false;
      return;
    }

    registerCrmDialogPrefsSyncer((snapshot) => {
      if (!hasHydrated.current) return; // avoid overwriting server with empty
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const currentMeta = (profile as { meta?: Record<string, unknown> } | null)?.meta || {};
        const nextMeta = {
          ...currentMeta,
          [META_KEY]: {
            transition: snapshot.transition,
            skip: snapshot.skip,
            updated_at: new Date().toISOString(),
          } satisfies ServerPrefs,
        };
        await supabase
          .from('profiles')
          .update({ meta: nextMeta } as never)
          .eq('user_id', user.id);
      }, 600);
    });

    return () => {
      registerCrmDialogPrefsSyncer(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, profile]);
}
