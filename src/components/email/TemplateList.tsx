import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Eye, Pencil, Trash2, FileText, Code } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const AVAILABLE_VARIABLES = ['first_name', 'last_name', 'company', 'source', 'offer_link'];

export function TemplateList() {
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [editId, setEditId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body_html: '', variables: '' });

  const handleCreate = () => {
    createTemplate.mutate({
      name: form.name,
      subject: form.subject,
      body_html: form.body_html,
      variables: form.variables.split(',').map(v => v.trim()).filter(Boolean),
    }, { onSuccess: () => { setCreateOpen(false); resetForm(); } });
  };

  const handleUpdate = () => {
    if (!editId) return;
    updateTemplate.mutate({
      id: editId,
      name: form.name,
      subject: form.subject,
      body_html: form.body_html,
      variables: form.variables.split(',').map(v => v.trim()).filter(Boolean),
    }, { onSuccess: () => { setEditId(null); resetForm(); } });
  };

  const resetForm = () => setForm({ name: '', subject: '', body_html: '', variables: '' });
  const openEdit = (t: any) => {
    setForm({ name: t.name, subject: t.subject, body_html: t.body_html, variables: (t.variables || []).join(', ') });
    setEditId(t.id);
  };

  const previewTemplate = templates.find(t => t.id === previewId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">{templates.length} Templates verfügbar</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-module-green hover:bg-module-green-light text-module-green-foreground">
              <Plus className="h-4 w-4 mr-1" /> Neues Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Neues Template</DialogTitle></DialogHeader>
            <TemplateForm form={form} setForm={setForm} onSubmit={handleCreate} isPending={createTemplate.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editId} onOpenChange={o => { if (!o) { setEditId(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Template bearbeiten</DialogTitle></DialogHeader>
          <TemplateForm form={form} setForm={setForm} onSubmit={handleUpdate} isPending={updateTemplate.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewId} onOpenChange={o => { if (!o) setPreviewId(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Vorschau: {previewTemplate?.name}</DialogTitle></DialogHeader>
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Betreff: {previewTemplate?.subject}</p>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewTemplate?.body_html || '' }} />
          </div>
        </DialogContent>
      </Dialog>

      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-module-green-muted mb-3">
              <FileText className="h-8 w-8 text-module-green" />
            </div>
            <h3 className="font-semibold mb-1">Keine Templates</h3>
            <p className="text-sm text-muted-foreground mb-4">Erstelle dein erstes Email Template</p>
            <Button size="sm" className="bg-module-green hover:bg-module-green-light text-module-green-foreground" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Template erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(t => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-module-green-muted">
                      <FileText className="h-4 w-4 text-module-green" />
                    </div>
                    <CardTitle className="text-sm">{t.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground truncate">Betreff: {t.subject}</p>
                <div className="flex flex-wrap gap-1">
                  {(t.variables || []).map(v => (
                    <Badge key={v} variant="outline" className="text-[10px] border-module-green/30 text-module-green-muted-foreground">
                      <Code className="h-2.5 w-2.5 mr-0.5" />{`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'dd.MM.yy', { locale: de })}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewId(t.id)}><Eye className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteTemplate.mutate(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateForm({ form, setForm, onSubmit, isPending }: { form: any; setForm: any; onSubmit: () => void; isPending: boolean }) {
  return (
    <div className="space-y-4">
      <div><Label>Name</Label><Input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} required /></div>
      <div><Label>Betreff</Label><Input value={form.subject} onChange={e => setForm((f: any) => ({ ...f, subject: e.target.value }))} required /></div>
      <div>
        <Label>Verfügbare Variablen</Label>
        <div className="flex flex-wrap gap-1 mt-1 mb-2">
          {AVAILABLE_VARIABLES.map(v => (
            <Badge key={v} variant="outline" className="text-xs cursor-pointer hover:bg-module-green-muted border-module-green/30"
              onClick={() => setForm((f: any) => ({ ...f, variables: f.variables ? `${f.variables}, ${v}` : v }))}>
              {`{{${v}}}`}
            </Badge>
          ))}
        </div>
        <Input value={form.variables} onChange={e => setForm((f: any) => ({ ...f, variables: e.target.value }))} placeholder="first_name, company, offer_link" />
      </div>
      <div>
        <Label>HTML Body</Label>
        <Textarea rows={10} value={form.body_html} onChange={e => setForm((f: any) => ({ ...f, body_html: e.target.value }))} placeholder="<h1>Hallo {{first_name}}</h1>" className="font-mono text-sm" />
      </div>
      <div className="text-xs text-muted-foreground">
        Standard-Footer mit Unsubscribe-Link wird automatisch angehängt.
      </div>
      <Button onClick={onSubmit} disabled={isPending} className="w-full bg-module-green hover:bg-module-green-light text-module-green-foreground">
        {isPending ? 'Speichern...' : 'Speichern'}
      </Button>
    </div>
  );
}
