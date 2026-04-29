import { useState } from 'react';
import { Phone, Mail, Calendar, FileText, AlertTriangle, Loader2, Send, LogIn, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useActivities, type ActivityType, type Activity } from '@/hooks/useActivities';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const TYPE_CONFIG: Record<ActivityType, { icon: typeof Phone; label: string; color: string }> = {
  anruf: { icon: Phone, label: 'Anruf', color: 'text-blue-500' },
  email: { icon: Mail, label: 'E-Mail', color: 'text-green-500' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'text-purple-500' },
  notiz: { icon: FileText, label: 'Notiz', color: 'text-muted-foreground' },
  fehler: { icon: AlertTriangle, label: 'Fehler', color: 'text-destructive' },
  login: { icon: LogIn, label: 'Portal-Login', color: 'text-emerald-500' },
};

// Only these can be created manually
const CREATABLE_TYPES: ActivityType[] = ['anruf', 'email', 'meeting', 'notiz', 'fehler'];

interface ActivityFeedProps {
  leadId?: string;
  customerId?: string;
}

function getEventLabel(a: Activity): { label: string; tone: 'default' | 'secondary' | 'outline' } | null {
  const meta = (a.metadata || {}) as Record<string, unknown>;
  const event = meta.event as string | undefined;
  if (a.type === 'email' && event === 'opened') return { label: 'Geöffnet', tone: 'secondary' };
  if (a.type === 'email' && event === 'clicked') return { label: 'Geklickt', tone: 'default' };
  if (a.type === 'email' && event === 'sent') return { label: 'Versendet', tone: 'outline' };
  if (a.type === 'login') return { label: 'Login', tone: 'secondary' };
  return null;
}

function getSourceLabel(a: Activity): string | null {
  const meta = (a.metadata || {}) as Record<string, unknown>;
  const source = (meta.source || meta.provider || meta.channel) as string | undefined;
  if (source) return String(source);
  if (a.type === 'login') return 'Portal';
  if (a.type === 'email' && meta.event === 'opened') return 'E-Mail-Tracker';
  return null;
}

function getEventLink(a: Activity): { to: string; label: string } | null {
  const meta = (a.metadata || {}) as Record<string, unknown>;
  const messageId = meta.message_id as string | undefined;
  const callId = meta.call_id as string | undefined;
  const offerId = (meta.offer_id || meta.offer_draft_id) as string | undefined;

  if (callId) return { to: `/app/calls/${callId}`, label: 'Call öffnen' };
  if (offerId) return { to: `/app/offers/${offerId}`, label: 'Angebot öffnen' };
  if (a.type === 'email' && messageId) {
    return { to: `/app/email/log?message_id=${messageId}`, label: 'E-Mail öffnen' };
  }
  return null;
}

export function ActivityFeed({ leadId, customerId }: ActivityFeedProps) {
  const { activities, isLoading, createActivity } = useActivities({
    lead_id: leadId,
    customer_id: customerId,
  });

  const [type, setType] = useState<ActivityType>('notiz');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await createActivity.mutateAsync({
        type,
        content: content.trim(),
        lead_id: leadId,
        customer_id: customerId,
      });
      setContent('');
      toast.success('Aktivität gespeichert');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Fehler beim Speichern');
    }
  };

  return (
    <div className="space-y-4">
      {/* Create form */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex gap-2">
          <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CREATABLE_TYPES.map((key) => {
                const cfg = TYPE_CONFIG[key];
                return (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <cfg.icon className={`h-3 w-3 ${cfg.color}`} />
                      {cfg.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || createActivity.isPending}
          >
            {createActivity.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Textarea
          placeholder="Aktivität beschreiben…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          className="min-h-[60px]"
        />
      </div>

      {/* Activity list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          Noch keine Aktivitäten vorhanden
        </p>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => {
            const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.notiz;
            const Icon = cfg.icon;
            const eventBadge = getEventLabel(a);
            const source = getSourceLabel(a);
            const link = getEventLink(a);
            const meta = (a.metadata || {}) as Record<string, unknown>;
            const isApi = !!meta.source && !a.synthetic;

            return (
              <div key={a.id} className="flex gap-3 rounded-md border p-3 hover:bg-muted/30 transition-colors">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">{a.creator_name}</span>
                    {eventBadge && (
                      <Badge variant={eventBadge.tone} className="text-[10px] px-1.5 py-0">
                        {eventBadge.label}
                      </Badge>
                    )}
                    {source && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {source}
                      </Badge>
                    )}
                    {isApi && !source && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        API
                      </Badge>
                    )}
                    <span
                      className="text-xs text-muted-foreground ml-auto"
                      title={format(new Date(a.created_at), 'PPpp', { locale: de })}
                    >
                      {format(new Date(a.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">{a.content}</p>
                  {(link || meta.ip || meta.user_agent) && (
                    <div className="flex items-center gap-3 flex-wrap pt-1">
                      {link && (
                        <Link
                          to={link.to}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {link.label}
                        </Link>
                      )}
                      {meta.ip && (
                        <span className="text-[10px] text-muted-foreground" title={String(meta.user_agent || '')}>
                          IP: {String(meta.ip)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
