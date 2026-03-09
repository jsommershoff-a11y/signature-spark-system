import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TemplateForm {
  name: string;
  subject: string;
  body_html: string;
  variables: string;
}

const emptyForm: TemplateForm = { name: '', subject: '', body_html: '', variables: '' };

export default function AdminEmailTemplates() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>(emptyForm);

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

  const saveMutation = useMutation({
    mutationFn: async (f: TemplateForm) => {
      const vars = f.variables.split(',').map(v => v.trim()).filter(Boolean);
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
      toast({ title: editId ? 'Template aktualisiert' : 'Template erstellt' });
    },
    onError: (err: any) => toast({ title: 'Fehler', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'email-templates'] });
      toast({ title: 'Template gelöscht' });
    },
  });

  const openEdit = (t: any) => {
    setEditId(t.id);
    setForm({ name: t.name, subject: t.subject, body_html: t.body_html, variables: (t.variables || []).join(', ') });
    setOpen(true);
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? 'Template bearbeiten' : 'Neues Template'}</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }}
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Betreff</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Variablen (kommagetrennt)</Label>
                <Input value={form.variables} onChange={e => setForm(f => ({ ...f, variables: e.target.value }))} placeholder="first_name, company" />
              </div>
              <div className="space-y-2">
                <Label>HTML Body</Label>
                <Textarea rows={8} value={form.body_html} onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))} required />
              </div>
              <Button type="submit" disabled={saveMutation.isPending} className="w-full">
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Speichern
              </Button>
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
                  <TableCell className="text-sm max-w-[200px] truncate">{t.subject}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(t.variables || []).map((v: string) => (
                        <Badge key={v} variant="outline" className="text-[10px]">{v}</Badge>
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
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(t.id)}>
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
