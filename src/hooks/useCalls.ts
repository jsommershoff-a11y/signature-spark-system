import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { 
  Call, 
  CreateCallInput, 
  UpdateCallInput, 
  CallFilters,
  Transcript,
  AiAnalysis
} from '@/types/calls';

export function useCalls(filters?: CallFilters) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchCalls = useCallback(async () => {
    if (!profile) return;
    
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('calls')
        .select(`
          *,
          lead:crm_leads(id, first_name, last_name, email, company),
          conductor:profiles!calls_conducted_by_fkey(id, first_name, last_name, full_name)
        `)
        .order('scheduled_at', { ascending: false, nullsFirst: false });

      // Apply filters
      if (filters?.lead_id) {
        query = query.eq('lead_id', filters.lead_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.conducted_by) {
        query = query.eq('conducted_by', filters.conducted_by);
      }
      if (filters?.from_date) {
        query = query.gte('scheduled_at', filters.from_date);
      }
      if (filters?.to_date) {
        query = query.lte('scheduled_at', filters.to_date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setCalls(data as Call[] || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching calls:', err);
    } finally {
      setLoading(false);
    }
  }, [profile, filters?.lead_id, filters?.status, filters?.conducted_by, filters?.from_date, filters?.to_date]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const createCall = async (data: CreateCallInput): Promise<Call | null> => {
    try {
      const { data: newCall, error } = await supabase
        .from('calls')
        .insert({
          ...data,
          conducted_by: data.conducted_by || profile?.id,
        })
        .select(`
          *,
          lead:crm_leads(id, first_name, last_name, email, company),
          conductor:profiles!calls_conducted_by_fkey(id, first_name, last_name, full_name)
        `)
        .single();

      if (error) throw error;

      setCalls(prev => [newCall as Call, ...prev]);
      toast({
        title: 'Call geplant',
        description: 'Der Call wurde erfolgreich angelegt.',
      });
      return newCall as Call;
    } catch (err) {
      console.error('Error creating call:', err);
      toast({
        title: 'Fehler',
        description: 'Call konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCall = async (data: UpdateCallInput): Promise<Call | null> => {
    try {
      const { id, ...updateData } = data;
      const { data: updatedCall, error } = await supabase
        .from('calls')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          lead:crm_leads(id, first_name, last_name, email, company),
          conductor:profiles!calls_conducted_by_fkey(id, first_name, last_name, full_name)
        `)
        .single();

      if (error) throw error;

      setCalls(prev => prev.map(c => c.id === id ? updatedCall as Call : c));
      return updatedCall as Call;
    } catch (err) {
      console.error('Error updating call:', err);
      toast({
        title: 'Fehler',
        description: 'Call konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const startCall = async (callId: string): Promise<boolean> => {
    const result = await updateCall({
      id: callId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });
    return !!result;
  };

  const endCall = async (callId: string): Promise<boolean> => {
    const call = calls.find(c => c.id === callId);
    const startedAt = call?.started_at ? new Date(call.started_at) : new Date();
    const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000);

    const result = await updateCall({
      id: callId,
      status: 'completed',
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
    });
    return !!result;
  };

  const deleteCall = async (callId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', callId);

      if (error) throw error;

      setCalls(prev => prev.filter(c => c.id !== callId));
      toast({
        title: 'Call gelöscht',
        description: 'Der Call wurde erfolgreich gelöscht.',
      });
      return true;
    } catch (err) {
      console.error('Error deleting call:', err);
      toast({
        title: 'Fehler',
        description: 'Call konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    calls,
    loading,
    error,
    refetch: fetchCalls,
    createCall,
    updateCall,
    startCall,
    endCall,
    deleteCall,
  };
}

// Hook for single call with full details
export function useCallDetail(callId: string | undefined) {
  const [call, setCall] = useState<Call | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCallDetail = useCallback(async () => {
    if (!callId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch call with related data
      const { data: callData, error: callError } = await supabase
        .from('calls')
        .select(`
          *,
          lead:crm_leads(id, first_name, last_name, email, company, phone),
          conductor:profiles!calls_conducted_by_fkey(id, first_name, last_name, full_name)
        `)
        .eq('id', callId)
        .single();

      if (callError) throw callError;
      setCall(callData as Call);

      // Fetch transcript
      const { data: transcriptData } = await supabase
        .from('transcripts')
        .select('*')
        .eq('call_id', callId)
        .maybeSingle();

      if (transcriptData) {
        setTranscript({
          ...transcriptData,
          segments: transcriptData.segments as unknown as import('@/types/calls').TranscriptSegment[] | undefined,
        } as Transcript);
      } else {
        setTranscript(null);
      }

      // Fetch analysis
      const { data: analysisData } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('call_id', callId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      // Type assertion for analysis_json
      if (analysisData) {
        setAnalysis(analysisData as unknown as AiAnalysis);
      } else {
        setAnalysis(null);
      }
    } catch (err) {
      console.error('Error fetching call detail:', err);
      toast({
        title: 'Fehler',
        description: 'Call-Details konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [callId, toast]);

  useEffect(() => {
    fetchCallDetail();
  }, [fetchCallDetail]);

  return {
    call,
    transcript,
    analysis,
    loading,
    refetch: fetchCallDetail,
  };
}
