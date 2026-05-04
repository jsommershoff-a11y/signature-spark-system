import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, Calendar, Sparkles, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Schema = z.object({
  email: z.string().trim().email("Bitte gültige E-Mail eingeben.").max(320),
  name: z.string().trim().min(2, "Bitte Namen angeben.").max(200),
  whatsapp: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
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
  const [form, setForm] = useState({ email: "", name: "", whatsapp: "", consent: false });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Schema.safeParse(form);
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
      setDone(true);
      toast.success("Eintragung erfolgreich – 1 Monat Mitgliederbereich freigeschaltet!");
    } catch (err: any) {
      toast.error(err?.message ?? "Eintragung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <DialogTitle>Du bist drin! 🎉</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Wir haben dir 1 Monat kostenlosen Mitgliederbereich-Zugang freigeschaltet.
              Die Zugangsdaten und Live-Call-Termine bekommst du gleich per E-Mail & WhatsApp.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">Schließen</Button>
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

            {/* Live-Call Hinweis */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex gap-3">
              <Video className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  2× wöchentlich Live-Call inklusive
                </div>
                <p className="text-muted-foreground mt-0.5">
                  Schau live zu, wie wir Prompts & KI-Workflows bauen, optimieren und auf reale
                  Kundenfälle anwenden – mit der Möglichkeit, Fragen direkt zu stellen.
                </p>
              </div>
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
                <Label htmlFor="ns-name">Name (optional)</Label>
                <Input
                  id="ns-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Max Mustermann"
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="ns-whatsapp">WhatsApp-Nummer *</Label>
                <Input
                  id="ns-whatsapp"
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+49 170 1234567"
                  autoComplete="tel"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Für Live-Call-Reminder & Zugangsdaten – Pflicht.
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

              <Button type="submit" disabled={loading} className="w-full">
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
