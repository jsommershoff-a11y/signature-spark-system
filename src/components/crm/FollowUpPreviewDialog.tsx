import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';
import { Mail, Send, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient?: string | null;
  label?: string;
  subject: string;
  body: string;
  isInCooldown?: boolean;
  cooldownText?: string | null;
  onConfirm: () => void;
}

export function FollowUpPreviewDialog({
  open, onOpenChange, recipient, label, subject, body,
  isInCooldown, cooldownText, onConfirm,
}: Props) {
  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Follow-up Vorschau${label ? ` — ${label}` : ''}`}
      description={recipient ? `Empfänger: ${recipient}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={onConfirm} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            E-Mail öffnen
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        {isInCooldown && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/30 p-2 text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <span>
              Hinweis: An diesen Empfänger ging vor weniger als 24h ein Follow-up
              {cooldownText ? ` (verbleibend ${cooldownText})` : ''}. Du kannst dennoch erneut senden.
            </span>
          </div>
        )}

        <div>
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
            <Mail className="h-3 w-3" /> Betreff
          </div>
          <div className="rounded-md border bg-muted/40 px-3 py-2 font-medium">{subject}</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Body</div>
          <pre className="rounded-md border bg-muted/40 p-3 text-xs font-mono whitespace-pre-wrap max-h-[45vh] overflow-auto">
            {body}
          </pre>
        </div>

        <div className="flex flex-wrap gap-1 pt-1">
          <Badge variant="outline" className="text-[10px]">Wird im Mail-Client geöffnet</Badge>
          <Badge variant="outline" className="text-[10px]">Activity-Log automatisch</Badge>
        </div>
      </div>
    </ResponsiveFormDialog>
  );
}
