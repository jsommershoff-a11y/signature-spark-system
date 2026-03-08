import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, X, Minimize2, Maximize2, User, Building2, Clock, FileText, ExternalLink, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useIncomingCall, type CallPopupStatus } from '@/hooks/useIncomingCall';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function StatusIndicator({ status }: { status: CallPopupStatus }) {
  if (status === 'ringing') {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
    );
  }
  return <span className="inline-flex rounded-full h-3 w-3 bg-destructive" />;
}

const STATUS_LABELS: Record<CallPopupStatus, string> = {
  ringing: 'Eingehend',
  active: 'Aktiv',
  ended: 'Beendet',
};

export function IncomingCallPopup() {
  const { callData, minimized, dismiss, toggleMinimize } = useIncomingCall();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  if (!callData) return null;

  const displayName = callData.leadName || callData.phoneNumber || 'Unbekannt';

  const handleSaveNote = async () => {
    if (!note.trim() || !callData.leadId) return;
    setSaving(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', (await supabase.auth.getUser()).data.user?.id || '').single();
      if (profile) {
        await supabase.from('activities').insert({
          lead_id: callData.leadId,
          user_id: profile.id,
          type: 'note' as any,
          content: note.trim(),
          metadata: { source: 'incoming_call_popup', call_id: callData.callId },
        });
        toast({ title: 'Notiz gespeichert' });
        setNote('');
        setShowNote(false);
      }
    } catch {
      toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Minimized pill
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 md:right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg cursor-pointer animate-in slide-in-from-bottom-4"
           onClick={toggleMinimize}>
        <StatusIndicator status={callData.status} />
        {callData.isUnknownContact && <AlertCircle className="h-3.5 w-3.5 text-amber-300" />}
        <Phone className="h-4 w-4" />
        <span className="text-sm font-medium truncate max-w-[140px]">{displayName}</span>
        <span className="text-sm tabular-nums">{formatDuration(callData.durationSeconds)}</span>
        <Maximize2 className="h-3.5 w-3.5 ml-1 opacity-70" />
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed z-50 shadow-2xl border border-border rounded-xl bg-card text-card-foreground animate-in slide-in-from-bottom-4",
      "bottom-4 right-4 w-[340px] max-w-[calc(100vw-2rem)]",
      "md:bottom-6 md:right-6 md:w-[380px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <StatusIndicator status={callData.status} />
          <span className="text-sm font-semibold">{STATUS_LABELS[callData.status]}</span>
          <span className="text-xs text-muted-foreground tabular-nums">{formatDuration(callData.durationSeconds)}</span>
          {callData.isUnknownContact && (
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
              Unbekannt
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMinimize}>
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={dismiss}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Caller info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-semibold text-base truncate">{displayName}</span>
          </div>
          {callData.leadCompany && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">{callData.leadCompany}</span>
            </div>
          )}
          {callData.leadStatus && (
            <Badge variant="secondary" className="text-xs mt-1">{callData.leadStatus}</Badge>
          )}
          {callData.phoneNumber && callData.leadName && (
            <p className="text-xs text-muted-foreground">{callData.phoneNumber}</p>
          )}
        </div>

        {/* Unknown contact info */}
        {callData.isUnknownContact && (
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Kein CRM-Lead zu dieser Nummer gefunden.
            </p>
          </div>
        )}

        {/* Last activity */}
        {callData.lastActivity && (
          <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground line-clamp-2">{callData.lastActivity}</p>
          </div>
        )}

        {/* Call outcome after ended */}
        {callData.status === 'ended' && callData.callReached !== null && (
          <div className="flex items-center gap-2">
            <Badge variant={callData.callReached ? "default" : "destructive"} className="text-xs">
              {callData.callReached ? 'Erreicht' : 'Nicht erreicht'}
            </Badge>
          </div>
        )}

        {/* Inline note */}
        {showNote && callData.leadId && (
          <div className="space-y-2">
            <Textarea
              placeholder="Notiz zum Anruf..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="text-sm min-h-[60px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveNote} disabled={saving || !note.trim()}>
                {saving ? 'Speichern...' : 'Speichern'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowNote(false); setNote(''); }}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {/* Recording */}
        {callData.status === 'ended' && callData.recordingUrl && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>Aufnahme verfügbar</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={() => { navigate(`/app/calls`); dismiss(); }}
        >
          <Phone className="h-3.5 w-3.5 mr-1" />
          Call öffnen
        </Button>
        {callData.leadId && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => { navigate(`/app/crm`); dismiss(); }}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            Lead öffnen
          </Button>
        )}
        {callData.isUnknownContact && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs border-amber-500 text-amber-700 hover:bg-amber-50"
            onClick={() => { navigate(`/app/crm?action=create&phone=${encodeURIComponent(callData.phoneNumber)}`); dismiss(); }}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            Lead anlegen
          </Button>
        )}
        {callData.leadId && !showNote && (
          <Button
            size="sm"
            variant="secondary"
            className="text-xs"
            onClick={() => setShowNote(true)}
          >
            <FileText className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
