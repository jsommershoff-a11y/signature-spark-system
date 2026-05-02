import { useState } from 'react';
import { useFollowUpTemplateVersions, type FollowUpTemplateVersionRow } from '@/hooks/useFollowUpTemplates';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { History, RotateCcw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Props {
  templateId: string | null;
  templateLabel?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHANGE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  create: 'default',
  update: 'secondary',
  rollback: 'outline',
};

export default function FollowUpTemplateHistoryDialog({
  templateId, templateLabel, open, onOpenChange,
}: Props) {
  const { versions, isLoading, rollback } = useFollowUpTemplateVersions(templateId);
  const [preview, setPreview] = useState<FollowUpTemplateVersionRow | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<FollowUpTemplateVersionRow | null>(null);

  const handleRollback = async () => {
    if (!rollbackTarget) return;
    try {
      await rollback.mutateAsync(rollbackTarget.id);
      toast.success(`Auf Version ${rollbackTarget.version_number} zurückgesetzt`);
      setRollbackTarget(null);
    } catch (err: any) {
      toast.error('Rollback fehlgeschlagen', { description: err?.message });
    }
  };

  return (
    <>
      <ResponsiveFormDialog
        open={open}
        onOpenChange={onOpenChange}
        title={
          <span className="flex items-center gap-2">
            <History className="h-5 w-5" /> Versionshistorie
            {templateLabel && <span className="text-muted-foreground">— {templateLabel}</span>}
          </span> as any
        }
        description="Alle Änderungen dieser Vorlage. Du kannst jede frühere Version wiederherstellen."
        footer={
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Schließen</Button>
        }
      >
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Lade Historie…</div>
        ) : versions.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">Keine Versionen vorhanden.</div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Betreff</TableHead>
                  <TableHead>Geändert</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v, idx) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">
                      v{v.version_number}
                      {idx === 0 && <Badge variant="outline" className="ml-2">aktuell</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={CHANGE_VARIANT[v.change_type] ?? 'secondary'}>
                        {v.change_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{v.label}</TableCell>
                    <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                      {v.subject}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(v.created_at), 'dd.MM.yy HH:mm', { locale: de })}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => setPreview(v)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        disabled={idx === 0}
                        onClick={() => setRollbackTarget(v)}
                        title={idx === 0 ? 'Aktuelle Version' : 'Wiederherstellen'}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </ResponsiveFormDialog>

      {/* Preview dialog */}
      <ResponsiveFormDialog
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
        title={preview ? `Version v${preview.version_number} — Vorschau` : ''}
        description={preview ? `Status: ${preview.is_active ? 'Aktiv' : 'Inaktiv'} · Sortierung: ${preview.sort_order}` : ''}
        footer={<Button variant="ghost" onClick={() => setPreview(null)}>Schließen</Button>}
      >
        {preview && (
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Label</div>
              <div className="font-medium">{preview.label}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Betreff</div>
              <div>{preview.subject}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Body</div>
              <pre className="font-mono text-xs whitespace-pre-wrap bg-muted p-3 rounded-md max-h-[40vh] overflow-auto">
                {preview.body}
              </pre>
            </div>
          </div>
        )}
      </ResponsiveFormDialog>

      <AlertDialog open={!!rollbackTarget} onOpenChange={(o) => !o && setRollbackTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Auf Version v{rollbackTarget?.version_number} zurücksetzen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Die aktuelle Vorlage wird mit dem Inhalt dieser Version überschrieben.
              Eine neue Versions-Markierung „rollback" wird angelegt — die Historie bleibt erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollback} disabled={rollback.isPending}>
              Wiederherstellen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
