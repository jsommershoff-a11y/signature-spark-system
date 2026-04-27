import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Mail, Eye, Code2, Variable } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TemplateForm {
  name: string;
  subject: string;
  body_html: string;
  variables: string;
}

const emptyForm: TemplateForm = { name: '', subject: '', body_html: '', variables: '' };

const SUGGESTED_VARS = [
  'first_name', 'last_name', 'full_name', 'company', 'email', 'phone',
  'link', 'unsubscribe_url', 'date', 'amount', 'product', 'sender',
];

const SAMPLE_DEFAULTS: Record<string, string> = {
  first_name: 'Max',
  last_name: 'Muster',
  full_name: 'Max Muster',
  company: 'Muster GmbH',
  email: 'max@muster.de',
  phone: '+49 170 1234567',
  link: 'https://ki-automationen.io/app',
  unsubscribe_url: 'https://ki-automationen.io/unsubscribe',
  date: new Date().toLocaleDateString('de-DE'),
  amount: '1.499,00 €',
  product: 'KRS Signature System',
  sender: 'KRS Signature',
};

function renderTemplate(input: string, vars: Record<string, string>): string {
  if (!input) return '';
  return input.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    return vars[key] ?? `{{${key}}}`;
  });
}

function extractVarsFromString(s: string): string[] {
  const set = new Set<string>();
  const re = /\{\{\s*([\w.]+)\s*\}\}/g;
  let m;
  while ((m = re.exec(s ?? '')) !== null) set.add(m[1]);
  return Array.from(set);
}

export default function AdminEmailTemplates() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [sample, setSample] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const [activeField, setActiveField] = useState<'subject' | 'body'>('body');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['admin', 'email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const declaredVars = useMemo(
    () => form.variables.split(',').map(v => v.trim()).filter(Boolean),
    [form.variables],
  );

  const detectedVars = useMemo(
    () => Array.from(new Set([
      ...extractVarsFromString(form.subject),
      ...extractVarsFromString(form.body_html),
    ])),
    [form.subject, form.body_html],
  );

  const allVars = useMemo(
    () => Array.from(new Set([...declaredVars, ...detectedVars])),
    [declaredVars, detectedVars],
  );

  const sampleValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const v of allVars) {
      out[v] = sample[v] ?? SAMPLE_DEFAULTS[v] ?? `[${v}]`;
    }
    return out;
  }, [allVars, sample]);

  const previewSubject = renderTemplate(form.subject, sampleValues);
  const previewBody = renderTemplate(form.body_html, sampleValues);

  const saveMutation = useMutation({
    mutationFn: async (f: TemplateForm) => {
      const vars = Array.from(new Set([
        ...f.variables.split(',').map(v => v.trim()).filter(Boolean),
        ...extractVarsFromString(f.subject),
        ...extractVarsFromString(f.body_html),
      ]));
      const payload = {
        name: f.name,
        subject: f.subject,
        body_html: f.body_html,
        variables: vars,
        created_by: profile!.id,
      };

      if (editId) {
        const { error } = await supabase.from('email_templates').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_templates').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'email-templates'] });
      setOpen(false);
      setEditId(null);
      setForm(emptyForm);
      toast.success(editId ? 'Template aktualisiert' : 'Template erstellt');
    },
    onError: (err: any) => toast.error('Fehler: ' + err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'email-templates'] });
      toast.success('Template gelöscht');
    },
    onError: (err: any) => toast.error('Löschen fehlgeschlagen: ' + err.message),
  });

  const openEdit = (t: any) => {
    setEditId(t.id);
    setForm({
      name: t.name,
      subject: t.subject,
      body_html: t.body_html,
      variables: (t.variables || []).join(', '),
    });
    setSample({});
    setOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setSample({});
    setOpen(true);
  };

  function insertVariable(name: string) {
    const token = `{{${name}}}`;
    if (activeField === 'subject') {
      const el = subjectRef.current;
      const cur = form.subject;
      if (el) {
        const start = el.selectionStart ?? cur.length;
        const end = el.selectionEnd ?? cur.length;
        const next = cur.slice(0, start) + token + cur.slice(end);
        setForm(f => ({ ...f, subject: next }));
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + token.length, start + token.length);
        });
      } else {
        setForm(f => ({ ...f, subject: cur + token }));
      }
    } else {
      const el = bodyRef.current;
      const cur = form.body_html;
      if (el) {
        const start = el.selectionStart ?? cur.length;
        const end = el.selectionEnd ?? cur.length;
        const next = cur.slice(0, start) + token + cur.slice(end);
        setForm(f => ({ ...f, body_html: next }));
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + token.length, start + token.length);
        });
      } else {
        setForm(f => ({ ...f, body_html: cur + token }));
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{templates.length} Templates</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Neues Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Template bearbeiten' : 'Neues Template'}</DialogTitle>
            </DialogHeader>

            <form
              className="grid gap-4 lg:grid-cols-2"
              onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }}
            >
              {/* LEFT — Editor */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="z. B. welcome-customer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Betreff</Label>
                  <Input
                    ref={subjectRef}
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    onFocus={() => setActiveField('subject')}
                    placeholder="Hallo {{first_name}}, willkommen bei {{company}}!"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Variablen (kommagetrennt)</Label>
                    <span className="text-[11px] text-muted-foreground">
                      Erkannt: {detectedVars.length}
                    </span>
                  </div>
                  <Input
                    value={form.variables}
                    onChange={e => setForm(f => ({ ...f, variables: e.target.value }))}
                    placeholder="first_name, company, link"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] text-muted-foreground self-center mr-1 inline-flex items-center gap-1">
                      <Variable className="h-3 w-3" /> einfügen:
                    </span>
                    {Array.from(new Set([...allVars, ...SUGGESTED_VARS])).slice(0, 14).map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="text-[11px] rounded-md border bg-muted/40 hover:bg-muted px-1.5 py-0.5 font-mono"
                      >
                        {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>HTML Body</Label>
                  <Textarea
                    ref={bodyRef}
                    rows={14}
                    value={form.body_html}
                    onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))}
                    onFocus={() => setActiveField('body')}
                    placeholder={`<p>Hallo {{first_name}},</p>\n<p>vielen Dank für dein Interesse an {{company}}.</p>\n<p><a href="{{link}}">Zum nächsten Schritt</a></p>`}
                    className="font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* RIGHT — Preview & Sample */}
              <div className="space-y-3">
                <Tabs defaultValue="preview">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="preview" className="gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Vorschau
                    </TabsTrigger>
                    <TabsTrigger value="html" className="gap-1.5">
                      <Code2 className="h-3.5 w-3.5" /> HTML
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-3 space-y-2">
                    <div className="rounded-md border bg-muted/30 px-3 py-2">
                      <div className="text-[10px] uppercase text-muted-foreground tracking-wide">Betreff</div>
                      <div className="text-sm font-medium truncate">{previewSubject || '—'}</div>
                    </div>
                    <div
                      className="rounded-md border bg-background p-4 text-sm prose prose-sm max-w-none dark:prose-invert min-h-[280px] max-h-[420px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: previewBody || '<p class="text-muted-foreground">Noch kein Inhalt</p>' }}
                    />
                  </TabsContent>

                  <TabsContent value="html" className="mt-3">
                    <pre className="rounded-md border bg-muted/30 p-3 text-[11px] overflow-auto max-h-[460px] whitespace-pre-wrap">
{previewBody || '—'}
                    </pre>
                  </TabsContent>
                </Tabs>

                {allVars.length > 0 && (
                  <div className="space-y-2 rounded-md border p-3">
                    <Label className="text-xs">Vorschau-Werte</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {allVars.map(v => (
                        <div key={v} className="space-y-1">
                          <div className="text-[10px] font-mono text-muted-foreground">{`{{${v}}}`}</div>
                          <Input
                            value={sample[v] ?? SAMPLE_DEFAULTS[v] ?? ''}
                            placeholder={`[${v}]`}
                            onChange={e => setSample(s => ({ ...s, [v]: e.target.value }))}
                            className="h-7 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 flex items-center justify-end gap-2 border-t pt-3">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Speichern
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Noch keine Templates</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Betreff</TableHead>
                <TableHead>Variablen</TableHead>
                <TableHead className="w-[120px]">Erstellt</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-sm max-w-[220px] truncate">{t.subject}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(t.variables || []).map((v: string) => (
                        <Badge key={v} variant="outline" className="text-[10px] font-mono">{v}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(t.created_at), 'dd.MM.yy', { locale: de })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => {
                          if (confirm(`Template "${t.name}" wirklich löschen?`)) deleteMutation.mutate(t.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
