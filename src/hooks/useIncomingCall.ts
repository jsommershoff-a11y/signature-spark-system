import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/supabase-js';

export type CallPopupStatus = 'ringing' | 'active' | 'ended';

export interface IncomingCallData {
  callId: string;
  status: CallPopupStatus;
  phoneNumber: string;
  direction: string;
  leadId: string | null;
  leadName: string | null;
  leadCompany: string | null;
  leadStatus: string | null;
  lastActivity: string | null;
  startedAt: string;
  durationSeconds: number;
  recordingUrl: string | null;
}

interface CallRow {
  id: string;
  lead_id: string;
  status: string;
  provider: string;
  meta: Record<string, unknown> | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  recording_url: string | null;
  notes: string | null;
}

export function useIncomingCall() {
  const [callData, setCallData] = useState<IncomingCallData | null>(null);
  const [minimized, setMinimized] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setCallData(null);
    setMinimized(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
  }, []);

  const toggleMinimize = useCallback(() => setMinimized(prev => !prev), []);

  const startTimer = useCallback((startedAt: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      setCallData(prev => prev ? { ...prev, durationSeconds: elapsed } : null);
    }, 1000);
  }, []);

  const fetchLeadDetails = useCallback(async (leadId: string) => {
    const [leadRes, activityRes] = await Promise.all([
      supabase.from('crm_leads').select('first_name, last_name, company, status').eq('id', leadId).maybeSingle(),
      supabase.from('activities').select('content').eq('lead_id', leadId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    return {
      leadName: leadRes.data ? `${leadRes.data.first_name} ${leadRes.data.last_name || ''}`.trim() : null,
      leadCompany: leadRes.data?.company || null,
      leadStatus: leadRes.data?.status || null,
      lastActivity: activityRes.data?.content || null,
    };
  }, []);

  const handleInsert = useCallback(async (payload: RealtimePostgresInsertPayload<CallRow>) => {
    const row = payload.new;
    if (!row || row.provider !== 'sipgate') return;
    
    const meta = row.meta as Record<string, unknown> | null;
    const direction = (meta?.direction as string) || '';
    if (direction !== 'INCOMING') return;
    if (row.status !== 'in_progress') return;

    const phoneNumber = (meta?.source as string) || '';
    let leadDetails = { leadName: null as string | null, leadCompany: null as string | null, leadStatus: null as string | null, lastActivity: null as string | null };

    if (row.lead_id) {
      leadDetails = await fetchLeadDetails(row.lead_id);
    }

    const newCallData: IncomingCallData = {
      callId: row.id,
      status: 'ringing',
      phoneNumber,
      direction,
      leadId: row.lead_id || null,
      ...leadDetails,
      startedAt: row.started_at || new Date().toISOString(),
      durationSeconds: 0,
      recordingUrl: null,
    };

    setCallData(newCallData);
    setMinimized(false);
    startTimer(newCallData.startedAt);

    // Auto-transition to active after 2s
    setTimeout(() => {
      setCallData(prev => prev?.callId === row.id ? { ...prev, status: 'active' } : prev);
    }, 2000);
  }, [fetchLeadDetails, startTimer]);

  const handleUpdate = useCallback((payload: RealtimePostgresUpdatePayload<CallRow>) => {
    const row = payload.new;
    if (!row) return;

    setCallData(prev => {
      if (!prev || prev.callId !== row.id) return prev;

      if (row.status === 'completed' || row.status === 'failed') {
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Auto-dismiss after 30s
        if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
        autoDismissRef.current = setTimeout(() => {
          setCallData(null);
          setMinimized(false);
        }, 30000);

        return {
          ...prev,
          status: 'ended',
          durationSeconds: row.duration_seconds ?? prev.durationSeconds,
          recordingUrl: row.recording_url || prev.recordingUrl,
        };
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('incoming-calls')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls' }, handleInsert as any)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls' }, handleUpdate as any)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
  }, [handleInsert, handleUpdate]);

  return {
    callData,
    minimized,
    dismiss,
    toggleMinimize,
  };
}
