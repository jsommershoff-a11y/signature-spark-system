import { useState } from "react";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LifeBuoy, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Einheitlicher Support-Einstieg für /start und /growth.
 * Verwendet exakt denselben Resend-Mechanismus (Edge Function `support-request`)
 * wie der Newsletter-Modal Success-View.
 */
const Schema = z.object({
  email: z.string().trim().email("Bitte gültige E-Mail eingeben.").max(320),
  name: z.string().trim().max(200).optional().default(""),
  message: z
    .string()
    .trim()
    .min(5, "Bitte beschreibe dein Anliegen kurz.")
    .max(2000),
});

interface Props {
  /** Kontextlabel für Diagnose, z. B. "bundle:start" */
  context: string;
}

export const BundleSupportFAQ = ({ context }: Props) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot — muss leer bleiben
  const [formStartedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const parsed = Schema.safeParse({ email, name, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen.");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("support-request", {
        body: {
          email: parsed.data.email,
          name: parsed.data.name,
          message: parsed.data.message,
          mailStatus: "queued",
          optInLabel: `Support-Anfrage aus FAQ (${context})`,
          reasonLabel: "Allgemeine Support-Frage über Landingpage-FAQ",
          pageUrl: typeof window !== "undefined" ? window.location.href : context,
          website,
          formStartedAt,
        },
      });
      if (error) throw error;
      setSent(true);
      setMessage("");
      if ((data as any)?.deduplicated) {
        toast.success("Anfrage bereits eingegangen – wir melden uns in Kürze.");
      } else {
        toast.success("Support-Anfrage gesendet. Wir melden uns innerhalb von 24 h.");
      }
    } catch (e) {
      console.error("BundleSupportFAQ submit error", e);
      toast.error("Konnte nicht gesendet werden. Bitte E-Mail an info@krs-signature.de.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-background py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem
            value="support"
            className="bg-card rounded-2xl border border-primary/30 px-5 sm:px-8"
          >
            <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground hover:text-primary hover:no-underline py-5">
              <span className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-primary" />
                Du brauchst Support oder hast eine konkrete Frage?
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Schreib uns direkt – deine Anfrage geht über denselben sicheren
                Kanal an unser Team wie alle anderen Support-Tickets. Antwort
                innerhalb von 24 Stunden an Werktagen.
              </p>
              {sent ? (
                <div className="rounded-lg bg-primary/10 border border-primary/30 p-4 text-sm text-foreground">
                  ✓ Deine Anfrage ist eingegangen. Wir melden uns bei{" "}
                  <strong>{email}</strong>.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sup-name" className="text-xs">
                        Name (optional)
                      </Label>
                      <Input
                        id="sup-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dein Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sup-email" className="text-xs">
                        E-Mail *
                      </Label>
                      <Input
                        id="sup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="du@firma.de"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sup-msg" className="text-xs">
                      Dein Anliegen *
                    </Label>
                    <Textarea
                      id="sup-msg"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Beschreibe kurz dein Anliegen oder deine Frage zum Bundle…"
                      rows={4}
                      maxLength={2000}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1 text-right">
                      {message.length}/2000
                    </p>
                  </div>
                  <Button
                    onClick={submit}
                    disabled={sending}
                    className="bg-primary hover:bg-primary-deep w-full sm:w-auto"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Sende…
                      </>
                    ) : (
                      <>
                        <Send className="mr-1.5 h-4 w-4" />
                        Support-Anfrage senden
                      </>
                    )}
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};
