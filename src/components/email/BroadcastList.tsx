import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Send } from 'lucide-react';
import { useEmailBroadcasts } from '@/hooks/useEmailBroadcasts';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-100 text-blue-800',
  sending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
};

export function BroadcastList() {
  const { broadcasts, createBroadcast, updateBroadcast } = useEmailBroadcasts();
  const { templates } = useEmailTemplates();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', template_id: '', body_html: '', segment: 'all' });

  const handleCreate = () => {
    createBroadcast.mutate({
      name: form.name,
      subject: form.subject,
      template_id: form.template_id || null,
      body_html: form.body_html || null,
      segment_filter: { type: form.segment },
      status: 'draft',
    }, { onSuccess: () => { setCreateOpen(false); setForm({ name: '', subject: '', template_id: '', body_html: '', segment: 'all' }); } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Broadcasts</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Neuer Broadcast</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Neuer Broadcast</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><Label>Betreff</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required /></div>
              <div>
                <Label>Segment</Label>
                <Select value={form.segment} onValueChange={v => setForm(f => ({ ...f, segment: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Leads</SelectItem>
                    <SelectItem value="new">Neue Leads</SelectItem>
                    <SelectItem value="qualified">Qualifizierte Leads</SelectItem>
                    <SelectItem value="customers">Kunden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Template (optional)</Label>
                <Select value={form.template_id} onValueChange={v => setForm(f => ({ ...f, template_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Kein Template" /></SelectTrigger>
                  <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Inhalt (HTML)</Label><Textarea rows={5} value={form.body_html} onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))} /></div>
              <Button onClick={handleCreate} disabled={createBroadcast.isPending} className="w-full">Erstellen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Betreff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Empfänger</TableHead>
              <TableHead>Erstellt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {broadcasts.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.subject}</TableCell>
                <TableCell><Badge className={STATUS_COLORS[b.status] || ''}>{b.status}</Badge></TableCell>
                <TableCell>{b.total_recipients}</TableCell>
                <TableCell>{format(new Date(b.created_at), 'dd.MM.yy', { locale: de })}</TableCell>
              </TableRow>
            ))}
            {broadcasts.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Keine Broadcasts</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
