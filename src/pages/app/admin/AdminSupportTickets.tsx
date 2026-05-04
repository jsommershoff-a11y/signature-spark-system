import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTickets, useUpdateTicket, type TicketStatus, type TicketPriority, type SupportTicket } from "@/hooks/useTickets";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { LifeBuoy, RefreshCw, Mail, ArrowLeft, Send, MessageSquare } from "lucide-react";

type ThreadMessage = {
  id: string;
  ticket_id: string;
  direction: string;
  from_email: string | null;
  from_name: string | null;
  to_email: string | null;
  subject: string | null;
  body_text: string | null;
  body_html: string | null;
  created_at: string;
};

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Offen" },
  { value: "in_progress", label: "In Bearbeitung" },
  { value: "waiting", label: "Warten" },
  { value: "closed", label: "Geschlossen" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const fmt = (iso: string) => format(new Date(iso), "dd.MM.yyyy HH:mm", { locale: de });
const ref = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

const statusVariant = (s: TicketStatus) =>
  s === "open" ? "default" : s === "closed" ? "secondary" : s === "waiting" ? "outline" : "default";
const priorityVariant = (p: TicketPriority) =>
  p === "urgent" || p === "high" ? "destructive" : p === "low" ? "secondary" : "outline";

export default function AdminSupportTickets() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: tickets = [], isLoading, refetch, isFetching } = useTickets(statusFilter, priorityFilter);
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return tickets;
    return tickets.filter(
      (t) =>
        t.subject?.toLowerCase().includes(s) ||
        t.sender_email?.toLowerCase().includes(s) ||
        t.id.toLowerCase().startsWith(s.replace(/^#/, "")),
    );
  }, [tickets, search]);

  const selected = useMemo(() => tickets.find((t) => t.id === selectedId) ?? null, [tickets, selectedId]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            Support-Tickets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Übersicht, Thread-Verlauf und Statusverwaltung aller Support-Tickets.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {selected ? (
        <TicketDetail
          ticket={selected}
          onBack={() => setSelectedId(null)}
          onChanged={() => refetch()}
        />
      ) : (
        <>
          <Card>
            <CardContent className="pt-4 grid sm:grid-cols-[1fr_180px_180px] gap-2">
              <Input
                placeholder="Suche: Betreff, Absender oder #ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isLoading ? "Lade…" : `${filtered.length} Ticket${filtered.length === 1 ? "" : "s"}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground italic py-6 text-center">
                  Keine Tickets gefunden.
                </div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => setSelectedId(t.id)}
                        className="w-full text-left py-3 px-2 hover:bg-muted/50 rounded transition flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">{ref(t.id)}</span>
                            <span className="font-medium truncate">{t.subject}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                            <Mail className="h-3 w-3" />
                            <span>{t.sender_email ?? "—"}</span>
                            <span>·</span>
                            <span>{fmt(t.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant={priorityVariant(t.priority)} className="text-[10px]">{t.priority}</Badge>
                          <Badge variant={statusVariant(t.status)} className="text-[10px]">{t.status}</Badge>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function TicketDetail({
  ticket, onBack, onChanged,
}: {
  ticket: SupportTicket;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [messages, setMessages] = useState<ThreadMessage[] | null>(null);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const updateTicket = useUpdateTicket();

  const loadMessages = async () => {
    setLoadingMsgs(true);
    const { data, error } = await supabase
      .from("support_ticket_messages")
      .select("id, ticket_id, direction, from_email, from_name, to_email, subject, body_text, body_html, created_at")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    setMessages((data as ThreadMessage[]) ?? []);
    setLoadingMsgs(false);
  };

  useEffect(() => { loadMessages(); /* eslint-disable-next-line */ }, [ticket.id]);

  const setStatus = async (status: TicketStatus) => {
    await updateTicket.mutateAsync({ id: ticket.id, patch: { status } });
    onChanged();
  };
  const setPriority = async (priority: TicketPriority) => {
    await updateTicket.mutateAsync({ id: ticket.id, patch: { priority } });
    onChanged();
  };

  const saveNote = async () => {
    setSavingNote(true);
    const { error } = await supabase
      .from("support_tickets")
      .update({ internal_notes: note.trim() || null })
      .eq("id", ticket.id);
    setSavingNote(false);
    if (error) return toast.error(error.message);
    toast.success("Interne Notiz gespeichert");
    onChanged();
  };

  useEffect(() => { setNote(ticket.internal_notes ?? ""); }, [ticket.id, ticket.internal_notes]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Zurück zur Liste
        </Button>
        <div className="flex items-center gap-2">
          <Select value={ticket.priority} onValueChange={(v: any) => setPriority(v)}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ticket.status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{ref(ticket.id)}</span>
                <span>·</span>
                <span>{fmt(ticket.created_at)}</span>
                <span>·</span>
                <span>{ticket.source}</span>
              </div>
              <CardTitle className="text-lg mt-1">{ticket.subject}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                <Mail className="h-3.5 w-3.5 inline mr-1" />
                {ticket.sender_name ? `${ticket.sender_name} <${ticket.sender_email}>` : ticket.sender_email ?? "—"}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={priorityVariant(ticket.priority)}>{ticket.priority}</Badge>
              <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm whitespace-pre-wrap border-t pt-4">
          {ticket.body || <em className="text-muted-foreground">Kein Initial-Body.</em>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Thread-Verlauf
            {messages && <Badge variant="outline">{messages.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMsgs ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="text-sm text-muted-foreground italic py-4 text-center">
              Noch keine Nachrichten im Thread.
            </div>
          ) : (
            <ol className="space-y-3">
              {messages.map((m) => {
                const inbound = m.direction === "inbound";
                return (
                  <li
                    key={m.id}
                    className={`rounded-lg border p-3 ${inbound ? "bg-muted/30" : "bg-primary/5 border-primary/20"}`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant={inbound ? "secondary" : "default"} className="text-[10px]">
                          {inbound ? "Eingehend" : "Ausgehend"}
                        </Badge>
                        <span>{m.from_name ? `${m.from_name} <${m.from_email}>` : m.from_email ?? "—"}</span>
                      </div>
                      <span>{fmt(m.created_at)}</span>
                    </div>
                    {m.subject && <div className="text-xs font-medium mb-1">{m.subject}</div>}
                    <div className="text-sm whitespace-pre-wrap">
                      {m.body_text || <em className="text-muted-foreground">Kein Text-Body.</em>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Interne Notiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nur intern sichtbar — z. B. Zuordnung, Recherche-Notizen…"
            rows={4}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={saveNote} disabled={savingNote}>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Notiz speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
