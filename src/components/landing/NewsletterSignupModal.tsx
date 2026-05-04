import { useState, useEffect } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, Calendar, Sparkles, Video, Clock, Mail, MessageCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
  const [supportStarted, setSupportStarted] = useState(false);
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

            {/* Aktivierungs-Timeline */}
            <div className="rounded-lg border border-amber-300/50 bg-amber-50 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <Clock className="h-4 w-4" />
                Freischaltung in unter 1 Minute
              </div>
              <ol className="space-y-1.5 text-xs text-amber-900/90">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">✓</span>
                  <span><strong>Anmeldung erhalten</strong> – jetzt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${mailStatus === "sent" || mailStatus === "already" ? "bg-green-600 text-white" : "bg-amber-400 text-amber-950 animate-pulse"}`}>
                    {mailStatus === "sent" || mailStatus === "already" ? "✓" : "2"}
                  </span>
                  <span>
                    <strong>Bestätigung per Mail</strong> – du klickst auf den Link
                    <span className="block text-[10px] text-amber-800/70">typischerweise innerhalb von 1–3 Min nach Eintragung</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">3</span>
                  <span>
                    <strong>30-Tage-Zugang aktiv</strong> – sofort nach Klick (&lt; 1 Min)
                    <span className="block text-[10px] text-amber-800/70">Magic-Link landet automatisch in deinem Postfach</span>
                  </span>
                </li>
              </ol>
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

            {/* FAQ */}
            <Accordion type="single" collapsible className="rounded-lg border bg-muted/30 px-3">
              <AccordionItem value="why" className="border-b last:border-b-0">
                <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline">
                  Warum muss ich überhaupt bestätigen?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-3">
                  Aus rechtlichen Gründen (Double-Opt-In nach DSGVO) müssen wir prüfen, dass die Adresse wirklich dir gehört. Erst nach deiner Bestätigung schalten wir den 30-Tage-Zugang frei und versenden Live-Call-Reminder.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="no-mail" className="border-b last:border-b-0">
                <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline">
                  Keine Bestätigungs-Mail erhalten?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-3 space-y-1.5">
                  <p>1. Prüfe deinen <strong>Spam- bzw. Werbung-Ordner</strong> (oft landet die erste Mail dort).</p>
                  <p>2. Warte 1–2 Minuten – die Zustellung kann je nach Provider kurz dauern.</p>
                  <p>3. Direkt hier erneut anfordern:</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={resendConfirmation}
                    disabled={resending || resendCooldown > 0 || mailStatus === "already"}
                    className="w-full h-8 text-xs"
                  >
                    {resending ? (
                      <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Wird gesendet…</>
                    ) : resendCooldown > 0 ? (
                      <><Clock className="h-3 w-3 mr-1.5" /> Erneut senden in {resendCooldown}s</>
                    ) : (
                      <><RefreshCw className="h-3 w-3 mr-1.5" /> Bestätigungs-Mail jetzt erneut senden</>
                    )}
                  </Button>
                  <p>4. Falls auch das nicht klappt: Schreib uns kurz an <a href="mailto:info@krs-signature.de" className="underline text-primary">info@krs-signature.de</a>.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="no-wa" className="border-b-0">
                <AccordionTrigger className="text-xs font-semibold py-2.5 hover:no-underline">
                  WhatsApp-Bestätigung funktioniert nicht?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground pb-3 space-y-1.5">
                  <p>• Stelle sicher, dass WhatsApp auf deinem Gerät installiert ist.</p>
                  <p>• Wenn der Button keinen Chat öffnet, speichere unsere Nummer manuell: <strong>+49 175 1127114</strong> und sende uns die vorbereitete Bestätigungsnachricht.</p>
                  <p>• Die WhatsApp-Bestätigung ist optional – die E-Mail-Bestätigung reicht für deinen Zugang aus.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Direkter Support-Kontakt – Fallback wenn Mail/WhatsApp scheitern */}
            {(() => {
              const optInLabel: Record<typeof mailStatus, string> = {
                sent: "Opt-in erteilt – Double-Opt-in-Mail versendet, aber noch nicht bestätigt",
                queued: "Opt-in erteilt – Double-Opt-in-Mail wird gerade versendet",
                already: "Double-Opt-in bereits abgeschlossen (E-Mail bestätigt)",
                failed: "Opt-in erteilt – Double-Opt-in-Mail konnte NICHT zugestellt werden",
              };
              const reasonLabel: Record<typeof mailStatus, string> = {
                sent: "Bestätigungs-Mail nicht angekommen (nicht im Posteingang/Spam auffindbar)",
                queued: "Bestätigungs-Mail noch nicht eingetroffen – Versand hängt in der Warteschlange",
                already: "Zugang trotz abgeschlossenem Double-Opt-in nicht freigeschaltet",
                failed: "Versand der Bestätigungs-Mail ist fehlgeschlagen (Zustellfehler vom Mailserver)",
              };
              const subject = `Hilfe bei Newsletter-Bestätigung [${mailStatus}]`;
              const body = [
                `Hallo KRS-Team,`,
                ``,
                `meine Newsletter-Bestätigung funktioniert nicht. Bitte schaltet meinen 30-Tage-Zugang manuell frei.`,
                ``,
                `Meine Daten:`,
                `• Name: ${form.name || "(bitte ergänzen)"}`,
                `• E-Mail: ${form.email}`,
                `• WhatsApp: ${form.whatsapp || "(nicht angegeben)"}`,
                ``,
                `Opt-in / Double-Opt-in-Status:`,
                `• ${optInLabel[mailStatus]}`,
                `• Technischer Status-Code: ${mailStatus}`,
                ``,
                `Grund der Fehlermeldung:`,
                `• ${reasonLabel[mailStatus]}`,
                ``,
                `• Zeitpunkt: ${new Date().toLocaleString("de-DE")}`,
                `• Seite: ${typeof window !== "undefined" ? window.location.href : ""}`,
                ``,
                `Danke!`,
              ].join("\n");
              const mailto = `mailto:info@krs-signature.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              return (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-background p-3 space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    Nichts klappt? Wir schalten dich manuell frei – meist binnen 1 Werktag.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild size="sm" variant="outline" className="text-xs" onClick={() => setSupportStarted(true)}>
                      <a href={mailto}>
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Support-Mail
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="text-xs" onClick={() => setSupportStarted(true)}>
                      <a
                        href={buildWhatsAppLink(
                          [
                            `Hallo KRS-Team,`,
                            ``,
                            `meine Newsletter-Bestätigung funktioniert nicht.`,
                            `Name: ${form.name || "(bitte ergänzen)"}`,
                            `E-Mail: ${form.email}`,
                            ``,
                            `Opt-in-Status: ${optInLabel[mailStatus]} (Code: ${mailStatus})`,
                            `Grund: ${reasonLabel[mailStatus]}`,
                            ``,
                            `Bitte schaltet meinen 30-Tage-Zugang manuell frei. Danke!`,
                          ].join("\n"),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Support-WhatsApp
                      </a>
                    </Button>
                  </div>
                  {supportStarted && (
                    <div className="rounded-md bg-green-50 border border-green-300 p-2.5 space-y-2 mt-1">
                      <p className="text-[11px] text-green-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        Support-Anfrage gestartet. Wir melden uns in Kürze.
                      </p>
                      <Button asChild size="sm" className="w-full h-8 text-xs bg-green-600 hover:bg-green-700 text-white">
                        <Link to="/auth" onClick={() => onOpenChange(false)}>
                          Weiter zum Login / Aktivierung
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}

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
