import { useState } from 'react';
import { Phone, Mail, Calendar, FileText, AlertTriangle, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useActivities, type ActivityType } from '@/hooks/useActivities';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

const TYPE_CONFIG: Record<ActivityType, { icon: typeof Phone; label: string; color: string }> = {
  anruf: { icon: Phone, label: 'Anruf', color: 'text-blue-500' },
  email: { icon: Mail, label: 'E-Mail', color: 'text-green-500' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'text-purple-500' },
  notiz: { icon: FileText, label: 'Notiz', color: 'text-muted-foreground' },
  fehler: { icon: AlertTriangle, label: 'Fehler', color: 'text-destructive' },
};

interface ActivityFeedProps {
  leadId?: string;
  customerId?: string;
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
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <cfg.icon className={`h-3 w-3 ${cfg.color}`} />
                    {cfg.label}
                  </span>
                </SelectItem>
              ))}
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
            const isApi = !!(a.metadata as Record<string, unknown>)?.source;

            return (
              <div key={a.id} className="flex gap-3 rounded-md border p-3">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">{a.creator_name}</span>
                    {isApi && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        API
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(a.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">{a.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
