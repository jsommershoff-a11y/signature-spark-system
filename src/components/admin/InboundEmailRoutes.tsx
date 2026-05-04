import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Star, ShieldCheck, Mail } from "lucide-react";

export type InboundRoute = {
  id: string;
  label: string;
  local_part: string;
  reply_domain: string;
  default_priority: "low" | "normal" | "high";
  is_default: boolean;
  enabled: boolean;
  description: string | null;
};

const LOCAL_RE = /^[a-z0-9._-]+$/i;
const DOMAIN_RE = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

export function InboundEmailRoutes({
  routes,
  onChange,
}: {
  routes: InboundRoute[];
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    label: "",
    local_part: "support",
    reply_domain: "",
    default_priority: "normal" as const,
    is_default: false,
    description: "",
  });

  const create = async () => {
    if (!draft.label.trim()) return toast.error("Label fehlt");
    if (!LOCAL_RE.test(draft.local_part)) return toast.error("Ungültiger Local-Part");
    if (!DOMAIN_RE.test(draft.reply_domain)) return toast.error("Ungültige Domain");
    setBusy(true);
    try {
      if (draft.is_default) {
        await supabase.from("inbound_email_config").update({ is_default: false }).eq("is_default", true);
      }
      const { error } = await supabase.from("inbound_email_config").insert({
        label: draft.label.trim(),
        local_part: draft.local_part.trim().toLowerCase(),
        reply_domain: draft.reply_domain.trim().toLowerCase(),
        default_priority: draft.default_priority,
        is_default: draft.is_default,
        description: draft.description.trim() || null,
        enabled: true,
      });
      if (error) throw error;
      toast.success("Route angelegt");
      setDraft({ label: "", local_part: "support", reply_domain: draft.reply_domain, default_priority: "normal", is_default: false, description: "" });
      onChange();
    } catch (e: any) {
      toast.error(e?.message ?? "Konnte Route nicht anlegen");
    } finally {
      setBusy(false);
    }
  };

  const update = async (id: string, patch: Partial<InboundRoute>) => {
    setBusy(true);
    try {
      if (patch.is_default) {
        await supabase.from("inbound_email_config").update({ is_default: false }).eq("is_default", true);
      }
      const { error } = await supabase.from("inbound_email_config").update(patch).eq("id", id);
      if (error) throw error;
      onChange();
    } catch (e: any) {
      toast.error(e?.message ?? "Update fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Diese Inbound-Route wirklich löschen?")) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("inbound_email_config").delete().eq("id", id);
      if (error) throw error;
      toast.success("Route gelöscht");
      onChange();
    } catch (e: any) {
      toast.error(e?.message ?? "Löschen fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" /> Inbound-Routen (Reply-Adressen)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {routes.length === 0 ? (
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              Noch keine Routen konfiguriert. Lege unten eine an, z. B.{" "}
              <code>support+ticket@reply.deine-domain.de</code>. Eingehende Mails an dieses Postfach werden
              automatisch dem Ticket zugeordnet (anhand des <code>+&lt;id&gt;</code>-Suffix).
            </AlertDescription>
          </Alert>
        ) : (
          <ul className="space-y-2">
            {routes.map((r) => (
              <li key={r.id} className="rounded border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2">
                      {r.label}
                      {r.is_default && <Badge variant="outline" className="border-primary text-primary">Default</Badge>}
                      {!r.enabled && <Badge variant="secondary">Deaktiviert</Badge>}
                    </div>
                    <code className="text-xs text-muted-foreground">
                      {r.local_part}+&lt;ticket-id&gt;@{r.reply_domain}
                    </code>
                    {r.description && <div className="text-xs text-muted-foreground mt-1">{r.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={r.enabled}
                      disabled={busy}
                      onCheckedChange={(v) => update(r.id, { enabled: v })}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy || r.is_default}
                      onClick={() => update(r.id, { is_default: true })}
                      title="Als Default setzen"
                    >
                      <Star className={`h-4 w-4 ${r.is_default ? "fill-primary text-primary" : ""}`} />
                    </Button>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded border border-dashed p-3 space-y-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Neue Route</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="z. B. Support Inbox" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Default-Priorität</Label>
              <Select value={draft.default_priority} onValueChange={(v: any) => setDraft({ ...draft, default_priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">low</SelectItem>
                  <SelectItem value="normal">normal</SelectItem>
                  <SelectItem value="high">high</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Local-Part (vor dem +)</Label>
              <Input value={draft.local_part} onChange={(e) => setDraft({ ...draft, local_part: e.target.value })} placeholder="support" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reply-Domain</Label>
              <Input value={draft.reply_domain} onChange={(e) => setDraft({ ...draft, reply_domain: e.target.value })} placeholder="reply.deine-domain.de" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Beschreibung (optional)</Label>
              <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={draft.is_default} onCheckedChange={(v) => setDraft({ ...draft, is_default: v })} />
                Als Default-Route verwenden (Bestätigungsmails)
              </label>
              <Button size="sm" onClick={create} disabled={busy}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Route anlegen
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Beispiel-Adresse: <code>{draft.local_part || "support"}+abcd1234@{draft.reply_domain || "reply.deine-domain.de"}</code> —
            das Inbound-Webhook erkennt den 8-stelligen Ticket-Hash nach dem <code>+</code> automatisch.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
