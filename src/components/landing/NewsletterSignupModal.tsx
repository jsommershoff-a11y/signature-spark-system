import { useState, useEffect } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, Calendar, Sparkles, Video, Clock, Mail, MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getNextLiveCalls, formatLiveCall } from "@/config/liveCalls";
import { buildWhatsAppLink } from "@/config/whatsapp";

// Plausibilitäts- & Format-Check für internationale Telefonnummern (E.164-orientiert).
// Erlaubt führendes "+", Ziffern, sowie typische Trennzeichen (Leerzeichen, "-", "/", "(", ")").
// Nach Normalisierung müssen 8–15 Ziffern übrig bleiben (ITU-T E.164).
const PHONE_ALLOWED_CHARS = /^[+0-9\s\-/().]+$/;
const normalizePhone = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
};

const whatsappSchema = z
  .string()
  .trim()
  .max(40, "WhatsApp-Nummer ist zu lang.")
  .refine((v) => v === "" || PHONE_ALLOWED_CHARS.test(v), {
    message: "WhatsApp-Nummer enthält ungültige Zeichen.",
  })
  .refine(
    (v) => {
      if (v === "") return true;
      const digits = v.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    },
    { message: "WhatsApp-Nummer muss 8–15 Ziffern enthalten (z. B. +49 170 1234567)." }
  )
  .refine(
    (v) => {
      if (v === "") return true;
      // Empfehlung: internationales Format mit "+" oder mit "00" als Auslandspräfix.
      return v.startsWith("+") || v.startsWith("00") || v.startsWith("0");
    },
    { message: "Bitte im internationalen Format eingeben (z. B. +49 …)." }
  )
  .optional()
  .or(z.literal(""));

const Schema = z.object({
  email: z.string().trim().email("Bitte gültige E-Mail eingeben.").max(320),
  name: z.string().trim().min(2, "Bitte Namen angeben.").max(200),
  whatsapp: whatsappSchema,
  consent: z.literal(true, { errorMap: () => ({ message: "Bitte Einwilligung bestätigen." }) }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
};

export const NewsletterSignupModal = ({ open, onOpenChange, source = "footer_modal" }: Props) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [mailStatus, setMailStatus] = useState<"sent" | "queued" | "already" | "failed">("queued");
  const [form, setForm] = useState({ email: "", name: "", whatsapp: "", consent: false });
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const upcomingCalls = getNextLiveCalls(2);

  // Live-Validierung der WhatsApp-Nummer (nur wenn nicht leer)
  const whatsappError = (() => {
    if (!form.whatsapp.trim()) return null;
    const res = whatsappSchema.safeParse(form.whatsapp);
    return res.success ? null : res.error.issues[0]?.message ?? "Ungültige Nummer.";
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normalisierte Nummer für Validierung & Versand
    const payload = { ...form, whatsapp: normalizePhone(form.whatsapp) };
    const parsed = Schema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-signup", {
        body: { ...parsed.data, source },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error ?? error?.message);
      const d = (data as any) ?? {};
      const status: "sent" | "queued" | "already" | "failed" = d.already_confirmed
        ? "already"
        : d.mail_sent === true
          ? "sent"
          : d.mail_sent === false
            ? "failed"
            : "queued";
      setMailStatus(status);
      setDone(true);
      toast.success(
        status === "already"
          ? "Du bist bereits eingetragen."
          : "Fast geschafft – bitte E-Mail bestätigen!",
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Eintragung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  // Cooldown-Timer für Resend-Button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const resendConfirmation = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-signup", {
        body: {
          email: form.email,
          name: form.name,
          whatsapp: normalizePhone(form.whatsapp),
          consent: true,
          source: `${source}_resend`,
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error ?? error?.message);
      const d = (data as any) ?? {};
      if (d.already_confirmed) {
        setMailStatus("already");
        toast.info("Diese Adresse ist bereits bestätigt.");
      } else {
        setMailStatus(d.mail_sent ? "sent" : "queued");
        toast.success("Bestätigungs-Mail erneut angefordert.");
      }
      setResendCooldown(30);
    } catch (err: any) {
      setMailStatus("failed");
      toast.error(err?.message ?? "Erneuter Versand fehlgeschlagen.");
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="space-y-4 py-2">
            <div className="text-center space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl">Eintragung erfolgreich! 🎉</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Danke{form.name ? `, ${form.name.split(" ")[0]}` : ""} – wir haben deine Anmeldung erhalten.
              </p>
            </div>

            {/* E-Mail-Bestätigung */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  Bestätigungs-Mail
                </div>
                {(() => {
                  const map = {
                    sent: { label: "✓ Gesendet", cls: "bg-green-100 text-green-700 border-green-300" },
                    queued: { label: "⏳ In Warteschlange", cls: "bg-amber-100 text-amber-700 border-amber-300" },
                    already: { label: "✓ Bereits bestätigt", cls: "bg-blue-100 text-blue-700 border-blue-300" },
                    failed: { label: "⚠ Versand fehlgeschlagen", cls: "bg-red-100 text-red-700 border-red-300" },
                  } as const;
                  const s = map[mailStatus];
                  return (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${s.cls}`}>
                      {s.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground">
                {mailStatus === "already" ? (
                  <>Diese Adresse <strong className="text-foreground break-all">{form.email}</strong> ist bereits bestätigt.</>
                ) : mailStatus === "failed" ? (
                  <>Wir konnten die Mail an <strong className="text-foreground break-all">{form.email}</strong> aktuell nicht zustellen. Bitte später erneut versuchen oder uns kontaktieren.</>
                ) : (
                  <>Mail an <strong className="text-foreground break-all">{form.email}</strong>. Klick auf den Link darin, um deinen <strong>30-Tage-Zugang</strong> freizuschalten.</>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Keine Mail? Bitte Spam-Ordner prüfen.
              </p>
              {mailStatus !== "already" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resendConfirmation}
                  disabled={resending || resendCooldown > 0}
                  className="w-full mt-1"
                >
                  {resending ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Wird gesendet…</>
                  ) : resendCooldown > 0 ? (
                    <><Clock className="h-3.5 w-3.5 mr-2" /> Erneut senden in {resendCooldown}s</>
                  ) : (
                    <><RefreshCw className="h-3.5 w-3.5 mr-2" /> Bestätigungs-Mail erneut senden</>
                  )}
                </Button>
              )}
            </div>

            {/* WhatsApp-Bestätigung – nur wenn Nummer angegeben */}
            {form.whatsapp.trim() && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  WhatsApp-Bestätigung
                </div>
                <p className="text-xs text-muted-foreground">
                  Sende uns die vorbereitete Nachricht – damit bestätigst du deine Anmeldung und aktivierst die Live-Call-Reminder direkt auf deinem Handy.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <a
                    href={buildWhatsAppLink(
                      [
                        `Hallo KRS-Team,`,
                        ``,
                        `hiermit bestätige ich meine Newsletter-Anmeldung${form.name ? ` (${form.name})` : ""}.`,
                        `E-Mail: ${form.email}`,
                        ``,
                        `Bitte aktiviert meinen 30-Tage-Zugang sowie die Live-Call-Reminder auf dieser WhatsApp-Nummer.`,
                        ``,
                        `Danke!`,
                      ].join("\n"),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp-Bestätigung senden
                  </a>
                </Button>
              </div>
            )}

            <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
              Verstanden
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                1 Monat kostenlos im Mitgliederbereich
              </DialogTitle>
              <DialogDescription>
                Newsletter abonnieren + sofort 30 Tage Vollzugriff auf den Mitgliederbereich.
              </DialogDescription>
            </DialogHeader>

            {/* Live-Call Hinweis – stark hervorgehoben */}
            <div className="relative rounded-lg border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-3.5">
              <div className="absolute -top-2 right-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                ● Live inklusive
              </div>
              <div className="flex gap-3">
                <Video className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    2× pro Woche Live-Call: Di & Do · 19:00
                  </div>
                  <p className="text-muted-foreground mt-1">
                    Schau <strong>live im Bildschirm-Sharing</strong> zu, wie wir Prompts schreiben,
                    KI-Workflows bauen und reale Kundenfälle lösen – stell deine Fragen direkt im Call.
                  </p>
                </div>
              </div>

              {upcomingCalls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Nächste Live-Calls
                  </div>
                  <ul className="space-y-1">
                    {upcomingCalls.map((c, i) => (
                      <li key={i} className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="font-medium text-foreground">{formatLiveCall(c.date)}</span>
                        <span className="text-muted-foreground truncate">{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <form onSubmit={submit} className="space-y-3">
              <div>
                <Label htmlFor="ns-email">E-Mail *</Label>
                <Input
                  id="ns-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="du@firma.de"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="ns-name">Name *</Label>
                <Input
                  id="ns-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Max Mustermann"
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="ns-whatsapp">WhatsApp-Nummer (optional)</Label>
                <Input
                  id="ns-whatsapp"
                  type="tel"
                  inputMode="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  onBlur={(e) => setForm({ ...form, whatsapp: normalizePhone(e.target.value) })}
                  placeholder="+49 170 1234567"
                  autoComplete="tel"
                  aria-invalid={!!whatsappError}
                  aria-describedby="ns-whatsapp-help"
                  className={whatsappError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <p
                  id="ns-whatsapp-help"
                  className={`text-[11px] mt-1 ${whatsappError ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {whatsappError ?? "Empfohlen für Live-Call-Reminder. Internationales Format, z. B. +49 170 1234567."}
                </p>
              </div>

              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={form.consent}
                  onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
                  className="mt-0.5"
                />
                <span>
                  Ich willige ein, Newsletter, Live-Call-Termine und Mitgliederbereich-Infos per E-Mail
                  und WhatsApp zu erhalten. Abmeldung jederzeit möglich.{" "}
                  <a href="/datenschutz" target="_blank" className="underline">Datenschutz</a> ·{" "}
                  <a href="/agb" target="_blank" className="underline">AGB</a>
                </span>
              </label>

              <Button type="submit" disabled={loading || !!whatsappError} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Jetzt eintragen & 30 Tage freischalten
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterSignupModal;
