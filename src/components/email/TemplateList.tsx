import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Email Templates</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Neues Template</Button></DialogTrigger>
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
          <div className="border rounded p-4">
            <p className="text-sm font-medium mb-2">Betreff: {previewTemplate?.subject}</p>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewTemplate?.body_html || '' }} />
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Betreff</TableHead>
              <TableHead>Variablen</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="w-[120px]">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.subject}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{(t.variables || []).join(', ') || '–'}</TableCell>
                <TableCell>{format(new Date(t.created_at), 'dd.MM.yy', { locale: de })}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setPreviewId(t.id)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteTemplate.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {templates.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Keine Templates vorhanden</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TemplateForm({ form, setForm, onSubmit, isPending }: { form: any; setForm: any; onSubmit: () => void; isPending: boolean }) {
  return (
    <div className="space-y-4">
      <div><Label>Name</Label><Input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} required /></div>
      <div><Label>Betreff</Label><Input value={form.subject} onChange={e => setForm((f: any) => ({ ...f, subject: e.target.value }))} required /></div>
      <div><Label>Variablen (kommagetrennt)</Label><Input value={form.variables} onChange={e => setForm((f: any) => ({ ...f, variables: e.target.value }))} placeholder="first_name, company, offer_link" /></div>
      <div>
        <Label>HTML Body</Label>
        <Textarea rows={10} value={form.body_html} onChange={e => setForm((f: any) => ({ ...f, body_html: e.target.value }))} placeholder="<h1>Hallo {{first_name}}</h1>" />
      </div>
      <Button onClick={onSubmit} disabled={isPending} className="w-full">{isPending ? 'Speichern...' : 'Speichern'}</Button>
    </div>
  );
}
