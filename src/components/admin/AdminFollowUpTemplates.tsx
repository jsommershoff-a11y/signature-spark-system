import { useMemo, useState } from 'react';
import { useFollowUpTemplatesAdmin, type FollowUpTemplateRow } from '@/hooks/useFollowUpTemplates';
import type { FollowUpVariant } from '@/lib/sales-scripts/follow-up';
import { validateFollowUpTemplate } from '@/lib/sales-scripts/template-validation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';
import { Pencil, Plus, Trash2, Mail, History, AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import FollowUpTemplateHistoryDialog from './FollowUpTemplateHistoryDialog';
import { FollowUpTemplatePreview } from './FollowUpTemplatePreview';

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
  active_from: string | null;
  active_until: string | null;
  variants: FollowUpVariant[];
  stages: string[];
}

const EMPTY_FORM: FormState = {
  template_key: '',
  label: '',
  description: '',
  subject: '',
  body: '',
  sort_order: 100,
  is_active: true,
  active_from: null,
  active_until: null,
  variants: [],
  stages: [],
};

const PIPELINE_STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'new_lead', label: 'Neu' },
  { value: 'setter_call_scheduled', label: 'Setter-Call geplant' },
  { value: 'setter_call_done', label: 'Setter-Call gehalten' },
  { value: 'analysis_ready', label: 'Analyse bereit' },
  { value: 'offer_draft', label: 'Angebotsentwurf' },
  { value: 'offer_sent', label: 'Angebot versendet' },
  { value: 'payment_unlocked', label: 'Zahlung freigeschaltet' },
  { value: 'won', label: 'Gewonnen' },
  { value: 'lost', label: 'Verloren' },
];

type LiveState = 'active' | 'inactive' | 'scheduled' | 'expired';

function getLiveState(row: { is_active: boolean; active_from: string | null; active_until: string | null }): LiveState {
  if (!row.is_active) return 'inactive';
  const now = Date.now();
  if (row.active_from && new Date(row.active_from).getTime() > now) return 'scheduled';
  if (row.active_until && new Date(row.active_until).getTime() < now) return 'expired';
  return 'active';
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

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
      active_from: row.active_from ?? null,
      active_until: row.active_until ?? null,
      variants: Array.isArray(row.variants) ? row.variants : [],
      stages: Array.isArray(row.stages) ? row.stages : [],
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.template_key.trim() || !form.label.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error('Schlüssel, Label, Betreff und Body sind Pflicht');
      return;
    }
    if (form.active_from && form.active_until &&
        new Date(form.active_from).getTime() >= new Date(form.active_until).getTime()) {
      toast.error('„Aktiv bis" muss später als „Go-Live ab" sein');
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
                    {(() => {
                      const state = getLiveState(t);
                      if (state === 'active') return <Badge variant="default">Aktiv</Badge>;
                      if (state === 'scheduled')
                        return <Badge variant="outline" title={`Go-Live: ${new Date(t.active_from!).toLocaleString('de-DE')}`}>Geplant</Badge>;
                      if (state === 'expired')
                        return <Badge variant="outline" title={`Abgelaufen: ${new Date(t.active_until!).toLocaleString('de-DE')}`}>Abgelaufen</Badge>;
                      return <Badge variant="secondary">Inaktiv</Badge>;
                    })()}
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

          {/* Zeitsteuerung */}
          <div className="space-y-3 border-t pt-4">
            <div>
              <Label>Zeitsteuerung (optional)</Label>
              <p className="text-xs text-muted-foreground">
                Vorlage erscheint nur innerhalb dieses Zeitfensters. Leer = unbegrenzt.
                Der Aktiv-Schalter oben muss zusätzlich gesetzt sein.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="active_from" className="text-xs">Go-Live ab</Label>
                <Input
                  id="active_from"
                  type="datetime-local"
                  value={toLocalInputValue(form.active_from)}
                  onChange={(e) => setForm({ ...form, active_from: fromLocalInputValue(e.target.value) })}
                />
                {form.active_from && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                    onClick={() => setForm({ ...form, active_from: null })}
                  >
                    Zurücksetzen
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="active_until" className="text-xs">Aktiv bis</Label>
                <Input
                  id="active_until"
                  type="datetime-local"
                  value={toLocalInputValue(form.active_until)}
                  onChange={(e) => setForm({ ...form, active_until: fromLocalInputValue(e.target.value) })}
                />
                {form.active_until && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                    onClick={() => setForm({ ...form, active_until: null })}
                  >
                    Zurücksetzen
                  </button>
                )}
              </div>
            </div>
            {form.active_from && form.active_until &&
              new Date(form.active_from).getTime() >= new Date(form.active_until).getTime() && (
                <p className="text-xs text-destructive">
                  „Aktiv bis" muss später als „Go-Live ab" sein.
                </p>
            )}
          </div>

          {/* Pipeline-Stage-Zuordnung */}
          <div className="space-y-2 border-t pt-4">
            <div>
              <Label>Pipeline-Stages (Default-Vorlage)</Label>
              <p className="text-xs text-muted-foreground">
                Diese Vorlage wird in der PipelineCard automatisch vorgeschlagen,
                wenn der Lead in einer der angehakten Phasen ist.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PIPELINE_STAGE_OPTIONS.map((opt) => {
                const active = form.stages.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? form.stages.filter((s) => s !== opt.value)
                        : [...form.stages, opt.value];
                      setForm({ ...form, stages: next });
                    }}
                    className={
                      'text-left text-xs rounded-md border px-2 py-1.5 transition ' +
                      (active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted/40 text-muted-foreground')
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* A/B Varianten */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>A/B-Varianten</Label>
                <p className="text-xs text-muted-foreground">
                  Beim Versand wird gewichtet zufällig eine Variante gewählt. Leer = nur Standard verwenden.
                </p>
              </div>
              <Button
                type="button" size="sm" variant="outline"
                onClick={() => {
                  const next = [...form.variants];
                  const id = String.fromCharCode(65 + next.length); // A, B, C ...
                  next.push({ id, weight: 1, subject: '', body: [] });
                  setForm({ ...form, variants: next });
                }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Variante
              </Button>
            </div>

            {form.variants.length === 0 ? (
              <div className="text-xs text-muted-foreground">Keine Varianten – nur Standard-Vorlage wird verwendet.</div>
            ) : (
              form.variants.map((v, idx) => (
                <div key={idx} className="space-y-2 rounded-md border p-3 bg-muted/20">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Variant-ID</Label>
                      <Input
                        value={v.id}
                        onChange={(e) => {
                          const next = [...form.variants];
                          next[idx] = { ...v, id: e.target.value };
                          setForm({ ...form, variants: next });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Gewicht</Label>
                      <Input
                        type="number" min={0}
                        value={v.weight ?? 1}
                        onChange={(e) => {
                          const next = [...form.variants];
                          next[idx] = { ...v, weight: parseFloat(e.target.value) || 0 };
                          setForm({ ...form, variants: next });
                        }}
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button
                        type="button" variant="ghost" size="sm"
                        className="text-destructive"
                        onClick={() => {
                          const next = form.variants.filter((_, i) => i !== idx);
                          setForm({ ...form, variants: next });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Betreff (überschreibt Standard, optional)</Label>
                    <Input
                      value={v.subject ?? ''}
                      onChange={(e) => {
                        const next = [...form.variants];
                        next[idx] = { ...v, subject: e.target.value || undefined };
                        setForm({ ...form, variants: next });
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Body (überschreibt Standard, optional)</Label>
                    <Textarea
                      rows={6}
                      className="font-mono text-xs"
                      value={(v.body ?? []).join('\n')}
                      onChange={(e) => {
                        const next = [...form.variants];
                        const lines = e.target.value.split('\n');
                        next[idx] = { ...v, body: e.target.value ? lines : undefined };
                        setForm({ ...form, variants: next });
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Live-Vorschau */}
          <div className="border-t pt-4">
            <FollowUpTemplatePreview
              templateKey={form.template_key}
              subject={form.subject}
              body={form.body}
              variants={form.variants}
              stages={form.stages}
            />
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
