import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SipgateDevice {
  id: string;
  alias: string;
  type: string;
  online: boolean;
}

interface SyncResult {
  success: boolean;
  synced: number;
  skipped: number;
  total: number;
}

interface ConnectionInfo {
  success: boolean;
  user: string;
  masterSipId: string;
  locale: string;
}

async function callSipgateApi(action: string, params: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke('sipgate-api', {
    body: { action, ...params },
  });

  if (error) throw new Error(error.message || 'Sipgate API error');
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useSipgate() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async (): Promise<ConnectionInfo | null> => {
    setIsLoading(true);
    try {
      const result = await callSipgateApi('test_connection');
      toast({
        title: 'Sipgate verbunden',
        description: `Verbunden als ${result.user}`,
      });
      return result as ConnectionInfo;
    } catch (err) {
      toast({
        title: 'Verbindung fehlgeschlagen',
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const initiateCall = async (
    callee: string,
    caller: string,
    leadId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      await callSipgateApi('initiate_call', { caller, callee });
      toast({
        title: 'Anruf gestartet',
        description: `Verbindung zu ${callee} wird aufgebaut...`,
      });

      // Create a call record if we have a lead
      if (leadId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
          .single();

        if (profile) {
          await supabase.from('calls').insert({
            lead_id: leadId,
            conducted_by: profile.id,
            provider: 'sipgate',
            call_type: 'phone',
            status: 'in_progress',
            started_at: new Date().toISOString(),
            notes: `Click-to-Call via Sipgate: ${callee}`,
            meta: { sipgate_click_to_call: true, callee, caller },
          });
          queryClient.invalidateQueries({ queryKey: ['calls'] });
        }
      }

      return true;
    } catch (err) {
      toast({
        title: 'Anruf fehlgeschlagen',
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getDevices = async (): Promise<SipgateDevice[]> => {
    try {
      const result = await callSipgateApi('get_devices');
      return (result.devices || []) as SipgateDevice[];
    } catch (err) {
      console.error('Failed to get devices:', err);
      return [];
    }
  };

  const syncHistory = async (limit = 50): Promise<SyncResult | null> => {
    setIsLoading(true);
    try {
      const result = await callSipgateApi('sync_history', { limit });
      toast({
        title: 'Sipgate Sync abgeschlossen',
        description: `${result.synced} neue Calls importiert, ${result.skipped} übersprungen.`,
      });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      return result as SyncResult;
    } catch (err) {
      toast({
        title: 'Sync fehlgeschlagen',
        description: err instanceof Error ? err.message : 'Unbekannter Fehler',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    testConnection,
    initiateCall,
    getDevices,
    syncHistory,
  };
}
