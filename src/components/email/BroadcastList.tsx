import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Users, Clock, CheckCircle } from 'lucide-react';
import { useEmailBroadcasts } from '@/hooks/useEmailBroadcasts';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: 'Entwurf', className: 'bg-muted text-muted-foreground', icon: Clock },
  scheduled: { label: 'Geplant', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Clock },
  sending: { label: 'Wird gesendet', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Send },
  sent: { label: 'Gesendet', className: 'bg-module-green-muted text-module-green-muted-foreground', icon: CheckCircle },
};

export function BroadcastList() {
  const { broadcasts, createBroadcast } = useEmailBroadcasts();
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

  const sentCount = broadcasts.filter(b => b.status === 'sent').length;
  const totalRecipients = broadcasts.reduce((sum, b) => sum + (b.total_recipients || 0), 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-module-green-muted border-module-green/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Send className="h-5 w-5 text-module-green" />
            <div>
              <p className="text-2xl font-bold text-module-green">{broadcasts.length}</p>
              <p className="text-xs text-muted-foreground">Broadcasts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-module-green-light" />
            <div>
              <p className="text-2xl font-bold">{sentCount}</p>
              <p className="text-xs text-muted-foreground">Gesendet</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{totalRecipients}</p>
              <p className="text-xs text-muted-foreground">Empfänger</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Broadcasts</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-module-green hover:bg-module-green-light text-module-green-foreground">
              <Plus className="h-4 w-4 mr-1" /> Neuer Broadcast
            </Button>
          </DialogTrigger>
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
              <div><Label>Inhalt (HTML)</Label><Textarea rows={5} value={form.body_html} onChange={e => setForm(f => ({ ...f, body_html: e.target.value }))} className="font-mono text-sm" /></div>
              <Button onClick={handleCreate} disabled={createBroadcast.isPending} className="w-full bg-module-green hover:bg-module-green-light text-module-green-foreground">
                Erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {broadcasts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-module-green-muted mb-3">
              <Send className="h-8 w-8 text-module-green" />
            </div>
            <h3 className="font-semibold mb-1">Keine Broadcasts</h3>
            <p className="text-sm text-muted-foreground mb-4">Sende deinen ersten Broadcast an ein Lead-Segment</p>
            <Button size="sm" className="bg-module-green hover:bg-module-green-light text-module-green-foreground" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Broadcast erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {broadcasts.map(b => {
            const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.draft;
            return (
              <Card key={b.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-module-green-muted">
                        <Send className="h-4 w-4 text-module-green" />
                      </div>
                      <div>
                        <p className="font-medium">{b.name}</p>
                        <p className="text-sm text-muted-foreground">{b.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <p className="font-medium">{b.total_recipients} Empfänger</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(b.created_at), 'dd.MM.yy', { locale: de })}</p>
                      </div>
                      <Badge className={config.className}>{config.label}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
