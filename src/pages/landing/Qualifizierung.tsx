import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getStoredRefCode } from "@/components/affiliate/ReferralTracker";
import { Header } from "@/components/landing/Header";
import { SEOHead } from "@/components/landing/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const qualifizierungSchema = z.object({
  name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  privacyAccepted: z.literal(true, { errorMap: () => ({ message: "Bitte akzeptiere die Datenschutzerklärung." }) }),
});

type QualifizierungFormData = z.infer<typeof qualifizierungSchema>;

const Qualifizierung = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<QualifizierungFormData>({
    resolver: zodResolver(qualifizierungSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      privacyAccepted: undefined as unknown as true,
    },
  });

  const onSubmit = async (data: QualifizierungFormData) => {
    setIsSubmitting(true);

    const refCode = getStoredRefCode();
    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        source: "qualifizierung",
        ref_code: refCode,
      });

      if (error) throw error;

      // Fire-and-forget notification
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      fetch(`${supabaseUrl}/functions/v1/notify-new-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: data.message || null,
          source: "qualifizierung",
        }),
      }).catch((err) => console.error("Notify email failed:", err));

      navigate("/danke");
    } catch {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Senden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Kostenlose Potenzial-Analyse | KI-Automationen"
        description="In 30 Minuten analysieren wir Engpässe, Abhängigkeiten und Automatisierungspotenzial in deinem Unternehmen. Klare Prioritäten statt Tool-Demo."
        canonical="/qualifizierung"
      />
      <Header />

      <main className="flex-1 pt-16">
        <section className="py-12 md:py-20 bg-gradient-to-br from-background via-muted to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                  Kostenloses Analysegespräch sichern
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  In 15 Minuten schauen wir gemeinsam, wo du stehst und wie wir dir helfen können.
                </p>
              </div>

              <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dein Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="deine@email.de" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon (optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+49 ..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nachricht (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Erzähl uns kurz von deiner Situation..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="privacyAccepted"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
                              />
                            </FormControl>
                            <label
                              className="text-sm text-muted-foreground leading-tight cursor-pointer"
                              onClick={() => field.onChange(field.value === true ? undefined : true)}
                            >
                              Ich akzeptiere die{" "}
                              <a
                                href="https://krsimmobilien.de/datenschutz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-primary hover:text-primary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Datenschutzerklärung
                              </a>{" "}und die{" "}
                              <a
                                href="/agb"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-primary hover:text-primary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                AGB
                              </a>{" "}*
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-deep hover:to-primary"
                      disabled={isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? "Wird gesendet..." : "Gespräch anfordern"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      100% kostenlos · Unverbindlich · Kein Risiko
                    </p>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Qualifizierung;
