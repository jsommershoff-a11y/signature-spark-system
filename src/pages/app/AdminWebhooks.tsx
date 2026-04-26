import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { RefreshCw, Play, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  "stripe": "Stripe (Payment)",
  "stripe-connect": "Stripe Connect",
  "twilio": "Twilio",
  "zoom": "Zoom",
  "sipgate": "Sipgate",
  "gmail": "Gmail Notification",
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "received": "secondary",
  "processing": "secondary",
  "processed": "default",
  "failed": "destructive",
  "replayed": "default",
  "signature_invalid": "destructive",
};

interface WebhookEvent {
  id: string;
  source: string;
  event_type: string | null;
  status: string;
  signature_valid: boolean | null;
  error: string | null;
  received_at: string;
  processed_at: string | null;
  replayed_at: string | null;
  replayed_count: number;
}

const AdminWebhooks = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string | null>(null);

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ["webhook-events", filter],
    queryFn: async () => {
      let q = supabase
        .from("webhook_events" as never)
        .select(
          "id, source, event_type, status, signature_valid, error, received_at, processed_at, replayed_at, replayed_count",
        )
        .order("received_at", { ascending: false })
        .limit(200);
      if (filter) q = q.eq("source", filter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as WebhookEvent[];
    },
  });

  const replayMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${supabaseUrl}/functions/v1/webhook-replay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ event_id: eventId }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `Replay failed (${resp.status})`);
      }
      return resp.json();
    },
    onSuccess: (data: { target: string; replay_status: number }) => {
      toast({
        title: "Replay erfolgreich",
        description: `Target: ${data.target} · HTTP ${data.replay_status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["webhook-events"] });
    },
    onError: (e: Error) => {
      toast({
        title: "Replay fehlgeschlagen",
        description: e.message,
        variant: "destructive",
      });
    },
  });

  const sources = Array.from(new Set(events.map((e) => e.source)));

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Webhook-Events</h1>
          <p className="text-sm text-muted-foreground">
            Letzte 200 eingehende Webhook-Aufrufe. Logger (<code>_shared/webhook-logger</code>)
            in den Edge Functions aktivieren, damit Events erscheinen.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button
          variant={filter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(null)}
        >
          Alle ({events.length})
        </Button>
        {sources.map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {SOURCE_LABELS[s] ?? s}
          </Button>
        ))}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quelle</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sig</TableHead>
              <TableHead>Empfangen</TableHead>
              <TableHead>Replays</TableHead>
              <TableHead className="text-right">Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Lade Events…
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Noch keine Events. Logger in den Webhook-Functions aktivieren.
                </TableCell>
              </TableRow>
            ) : (
              events.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {SOURCE_LABELS[e.source] ?? e.source}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {e.event_type ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[e.status] ?? "outline"} className="text-xs">
                      {e.status}
                    </Badge>
                    {e.error && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[240px]" title={e.error}>
                          {e.error}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {e.signature_valid === true && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" aria-label="Signatur gültig" />
                    )}
                    {e.signature_valid === false && (
                      <AlertCircle className="w-4 h-4 text-destructive" aria-label="Signatur ungültig" />
                    )}
                    {e.signature_valid === null && (
                      <Clock className="w-4 h-4 text-muted-foreground" aria-label="nicht geprüft" />
                    )}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(e.received_at), "dd.MM.yyyy HH:mm:ss", { locale: de })}
                  </TableCell>
                  <TableCell className="text-xs">{e.replayed_count}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => replayMutation.mutate(e.id)}
                      disabled={replayMutation.isPending}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Replay
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminWebhooks;
