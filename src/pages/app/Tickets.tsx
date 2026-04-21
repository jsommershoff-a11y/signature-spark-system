import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useTickets,
  useUpdateTicket,
  useCreateTicket,
  type SupportTicket,
  type TicketStatus,
  type TicketPriority,
} from '@/hooks/useTickets';
import { Plus, Mail, Inbox, Phone as PhoneIcon, Hand } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  waiting: 'Wartet',
  closed: 'Geschlossen',
};
const STATUS_COLOR: Record<TicketStatus, string> = {
  open: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
  in_progress: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  waiting: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
  closed: 'bg-muted text-muted-foreground',
};
const PRIO_COLOR: Record<TicketPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-secondary',
  high: 'bg-orange-500/20 text-orange-700',
  urgent: 'bg-destructive/20 text-destructive',
};
const SOURCE_ICON = {
  email: Mail,
  mail: Inbox,
  manual: Hand,
  phone: PhoneIcon,
} as const;

export default function Tickets() {
  const [tab, setTab] = useState<TicketStatus | 'all'>('open');
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: tickets = [], isLoading } = useTickets(tab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">Support-Anfragen und interne Tickets verwalten</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Neues Ticket
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TicketStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="open">Offen</TabsTrigger>
          <TabsTrigger value="in_progress">In Bearbeitung</TabsTrigger>
          <TabsTrigger value="waiting">Wartet</TabsTrigger>
          <TabsTrigger value="closed">Geschlossen</TabsTrigger>
          <TabsTrigger value="all">Alle</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Lade Tickets…</CardContent></Card>
      ) : tickets.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Keine Tickets in dieser Ansicht.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {tickets.map((t) => {
            const Icon = SOURCE_ICON[t.source];
            return (
              <Card key={t.id} className="cursor-pointer hover:bg-muted/30 transition" onClick={() => setSelected(t)}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-1 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{t.subject}</h3>
                        <Badge variant="outline" className={STATUS_COLOR[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                        <Badge variant="outline" className={PRIO_COLOR[t.priority]}>{t.priority}</Badge>
                      </div>
                      {(t.sender_name || t.sender_email) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {t.sender_name} {t.sender_email && <span>&lt;{t.sender_email}&gt;</span>}
                        </p>
                      )}
                      {t.body && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.body}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: de })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TicketDetail ticket={selected} onClose={() => setSelected(null)} />
      <CreateTicketDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function TicketDetail({ ticket, onClose }: { ticket: SupportTicket | null; onClose: () => void }) {
  const update = useUpdateTicket();
  if (!ticket) return null;
  return (
    <Dialog open={!!ticket} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket.subject}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select
                value={ticket.status}
                onValueChange={(v) => update.mutate({ id: ticket.id, patch: { status: v as TicketStatus } })}
              >
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Priorität</Label>
              <Select
                value={ticket.priority}
                onValueChange={(v) => update.mutate({ id: ticket.id, patch: { priority: v as TicketPriority } })}
              >
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="urgent">Dringend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(ticket.sender_name || ticket.sender_email) && (
            <div className="text-sm">
              <span className="text-muted-foreground">Absender: </span>
              {ticket.sender_name} {ticket.sender_email && <span>&lt;{ticket.sender_email}&gt;</span>}
            </div>
          )}
          {ticket.body && (
            <div>
              <Label className="text-xs">Inhalt</Label>
              <div className="rounded-md border p-3 text-sm whitespace-pre-wrap bg-muted/30">{ticket.body}</div>
            </div>
          )}
          <div>
            <Label htmlFor="notes">Interne Notizen</Label>
            <Textarea
              id="notes"
              defaultValue={ticket.internal_notes ?? ''}
              onBlur={(e) => {
                if (e.target.value !== (ticket.internal_notes ?? '')) {
                  update.mutate({ id: ticket.id, patch: { internal_notes: e.target.value } });
                }
              }}
              rows={4}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateTicketDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const create = useCreateTicket();

  const submit = async () => {
    if (!subject.trim()) return;
    await create.mutateAsync({ subject, body, priority, source: 'manual', status: 'open' });
    setSubject(''); setBody(''); setPriority('normal');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Neues Ticket</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Betreff</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div><Label>Beschreibung</Label><Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <div>
            <Label>Priorität</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="urgent">Dringend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={submit} disabled={create.isPending || !subject.trim()}>Ticket anlegen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
