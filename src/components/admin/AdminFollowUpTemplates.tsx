import { useState } from 'react';
import { useFollowUpTemplatesAdmin, type FollowUpTemplateRow } from '@/hooks/useFollowUpTemplates';
import type { FollowUpVariant } from '@/lib/sales-scripts/follow-up';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';
import { Pencil, Plus, Trash2, Mail, History } from 'lucide-react';
import { toast } from 'sonner';
import FollowUpTemplateHistoryDialog from './FollowUpTemplateHistoryDialog';

const PLACEHOLDER_HINT =
  'Verfügbare Platzhalter: {{greeting_name}}, {{when}}, {{company}}, {{stage_label}}, {{context_line}}';

interface FormState {
  template_key: string;
  label: string;
  description: string;
  subject: string;
  body: string;
  sort_order: number;
  is_active: boolean;
  variants: FollowUpVariant[];
}

const EMPTY_FORM: FormState = {
  template_key: '',
  label: '',
  description: '',
  subject: '',
  body: '',
  sort_order: 100,
  is_active: true,
  variants: [],
};

export default function AdminFollowUpTemplates() {
  const { templates, isLoading, create, update, remove } = useFollowUpTemplatesAdmin();
  const [editing, setEditing] = useState<FollowUpTemplateRow | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [historyTarget, setHistoryTarget] = useState<FollowUpTemplateRow | null>(null);

  const startCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const startEdit = (row: FollowUpTemplateRow) => {
    setEditing(row);
    setForm({
      template_key: row.template_key,
      label: row.label,
      description: row.description ?? '',
      subject: row.subject,
      body: row.body,
      sort_order: row.sort_order,
      is_active: row.is_active,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.template_key.trim() || !form.label.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error('Schlüssel, Label, Betreff und Body sind Pflicht');
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...form });
        toast.success('Vorlage aktualisiert');
      } else {
        await create.mutateAsync(form);
        toast.success('Vorlage erstellt');
      }
      setOpen(false);
    } catch (err: any) {
      toast.error('Speichern fehlgeschlagen', { description: err?.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await remove.mutateAsync(deleteId);
      toast.success('Vorlage gelöscht');
    } catch (err: any) {
      toast.error('Löschen fehlgeschlagen', { description: err?.message });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Follow-up Vorlagen
          </CardTitle>
          <CardDescription>
            Sales-Follow-up-Texte zentral pflegen. {PLACEHOLDER_HINT}
          </CardDescription>
        </div>
        <Button size="sm" onClick={startCreate}>
          <Plus className="h-4 w-4 mr-1" /> Neu
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Lade Vorlagen…</div>
        ) : templates.length === 0 ? (
          <div className="text-sm text-muted-foreground">Noch keine Vorlagen angelegt.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sort.</TableHead>
                <TableHead>Schlüssel</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Betreff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{t.sort_order}</TableCell>
                  <TableCell className="font-mono text-xs">{t.template_key}</TableCell>
                  <TableCell className="font-medium">{t.label}</TableCell>
                  <TableCell className="max-w-[280px] truncate text-sm">{t.subject}</TableCell>
                  <TableCell>
                    {t.is_active ? (
                      <Badge variant="default">Aktiv</Badge>
                    ) : (
                      <Badge variant="secondary">Inaktiv</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setHistoryTarget(t)} title="Versionshistorie">
                      <History className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(t.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ResponsiveFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
        description={PLACEHOLDER_HINT}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" form="follow-up-template-form" disabled={create.isPending || update.isPending}>
              Speichern
            </Button>
          </>
        }
      >
        <form id="follow-up-template-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="key">Schlüssel</Label>
              <Input
                id="key"
                value={form.template_key}
                onChange={(e) => setForm({ ...form, template_key: e.target.value })}
                placeholder="confirm"
                disabled={!!editing}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Bestätigung"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Kurzbeschreibung</Label>
            <Input
              id="desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Termin bestätigen & Agenda teilen"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={12}
              className="font-mono text-xs"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sort">Sortierung</Label>
              <Input
                id="sort"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <Label htmlFor="active">Aktiv (in Pipeline-Karte sichtbar)</Label>
            </div>
          </div>
        </form>
      </ResponsiveFormDialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vorlage löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion ist endgültig. Bestehende Aktivitäts-Logs bleiben erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FollowUpTemplateHistoryDialog
        templateId={historyTarget?.id ?? null}
        templateLabel={historyTarget?.label}
        open={!!historyTarget}
        onOpenChange={(o) => !o && setHistoryTarget(null)}
      />
    </Card>
  );
}
