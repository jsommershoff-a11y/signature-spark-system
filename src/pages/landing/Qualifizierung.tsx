import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { identifyApollo, trackEvent } from "@/lib/analytics";
import { getStoredRefCode } from "@/components/affiliate/ReferralTracker";
import { Header } from "@/components/landing/Header";
import { SEOHead } from "@/components/landing/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Bot, Check, ChevronRight, Clock, Sparkles } from "lucide-react";
import { AUTOMATIONS } from "@/data/automations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CUSTOM_BOT_SLUG = "eigener-bot";

const qualifizierungSchema = z.object({
  name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "Bitte akzeptiere die Datenschutzerklärung." }),
  }),
});

type QualifizierungFormData = z.infer<typeof qualifizierungSchema>;

const Qualifizierung = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial-Auswahl aus URL extrahieren
  const initialSelection = useMemo(() => {
    const fromMulti = (searchParams.get("automations") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const single = searchParams.get("automation");
    const wantsCustom = searchParams.get("eigener-bot") === "1";
    const set = new Set<string>(fromMulti);
    if (single) set.add(single);
    if (wantsCustom) set.add(CUSTOM_BOT_SLUG);
    // Nur valide Slugs behalten
    const validSlugs = new Set(AUTOMATIONS.map((a) => a.slug));
    return Array.from(set).filter((s) => validSlugs.has(s) || s === CUSTOM_BOT_SLUG);
  }, []); // initial only

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSelection);

  const selectedItems = useMemo(() => {
    return selectedSlugs.map((slug) => {
      if (slug === CUSTOM_BOT_SLUG) {
        return {
          slug: CUSTOM_BOT_SLUG,
          code: "CUSTOM",
          name: "Eigener Bot (individuell)",
          subtitle: "Custom-Konfiguration nach Briefing",
          isCustom: true as const,
        };
      }
      const a = AUTOMATIONS.find((x) => x.slug === slug);
      return a
        ? {
            slug: a.slug,
            code: a.code,
            name: a.name,
            subtitle: a.subtitle,
            isCustom: false as const,
          }
        : null;
    }).filter(Boolean) as Array<{
      slug: string;
      code: string;
      name: string;
      subtitle: string;
      isCustom: boolean;
    }>;
  }, [selectedSlugs]);

  const toggleSlug = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const clearAll = () => setSelectedSlugs([]);

  // URL synchron halten
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("automation");
    next.delete("automations");
    next.delete("eigener-bot");
    const real = selectedSlugs.filter((s) => s !== CUSTOM_BOT_SLUG);
    if (real.length > 0) next.set("automations", real.join(","));
    if (selectedSlugs.includes(CUSTOM_BOT_SLUG)) next.set("eigener-bot", "1");
    setSearchParams(next, { replace: true });
  }, [selectedSlugs]); // eslint-disable-line react-hooks/exhaustive-deps

  const prefilledMessage = useMemo(() => {
    if (selectedItems.length === 0) return "";
    const lines = selectedItems.map((s) => `• ${s.code} – ${s.name}`);
    return `Interesse an folgenden Lösungen:\n${lines.join("\n")}\n\nBitte sendet mir ein individuelles Angebot dazu.`;
  }, [selectedItems]);

  const form = useForm<QualifizierungFormData>({
    resolver: zodResolver(qualifizierungSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: prefilledMessage,
      privacyAccepted: undefined as unknown as true,
    },
  });

  // Sync prefilled message when selection changes
  useEffect(() => {
    const current = form.getValues("message") ?? "";
    const isAutoFilled = !current || current.startsWith("Interesse an");
    if (isAutoFilled) {
      form.setValue("message", prefilledMessage, { shouldDirty: false });
    }
  }, [prefilledMessage, form]);

  const onSubmit = async (data: QualifizierungFormData) => {
    setIsSubmitting(true);

    const refCode = getStoredRefCode();
    const automationTag =
      selectedItems.length > 0
        ? `[Auswahl: ${selectedItems.map((s) => `${s.code} – ${s.name}`).join(" | ")}]`
        : null;
    const messageWithTag = [automationTag, data.message?.trim() || null]
      .filter(Boolean)
      .join("\n\n") || null;

    const sourceTag =
      selectedItems.length > 0
        ? `qualifizierung:automations:${selectedItems.map((s) => s.slug).join("+")}`
        : "qualifizierung";

    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: messageWithTag,
        source: sourceTag,
        ref_code: refCode,
      });

      if (error) throw error;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      fetch(`${supabaseUrl}/functions/v1/notify-new-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: messageWithTag,
          source: sourceTag,
          automations: selectedItems.map((s) => ({
            slug: s.slug,
            code: s.code,
            name: s.name,
            isCustom: s.isCustom,
          })),
        }),
      }).catch((err) => console.error("Notify email failed:", err));

      // Apollo: Identify (validiert via Zod, respektiert Consent) + Conversion-Event.
      // Bei erfolgreicher Identify wird der Lead in Apollo direkt einem Kontakt zugeordnet.
      const identified = identifyApollo({
        email: data.email,
        name: data.name,
        phone: data.phone || null,
      });
      // Korrelation-ID für Funnel-Attribution (lead_form_submitted ↔ thank_you_view).
      // Persistiert in sessionStorage, sodass /danke das Folge-Event verknüpfen kann.
      const leadCorrelationId =
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `lead_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
      const emailDomain = data.email.split("@")[1]?.toLowerCase() ?? null;
      try {
        window.sessionStorage.setItem(
          "krs_lead_attribution",
          JSON.stringify({
            lead_id: leadCorrelationId,
            form: "qualifizierung",
            source: sourceTag,
            email_domain: emailDomain,
            apollo_identified: identified,
            submitted_at: Date.now(),
          }),
        );
      } catch {
        /* sessionStorage may be unavailable */
      }

      void trackEvent("lead_form_submitted", {
        form: "qualifizierung",
        source: sourceTag,
        automations_count: selectedItems.length,
        automation_slugs: selectedItems.map((s) => s.slug),
        has_phone: Boolean(data.phone),
        has_message: Boolean(data.message?.trim()),
        apollo_identified: identified,
        // E-Mail-Domain (nicht die volle Adresse) als Account-Hint für Apollo-B2B-Matching.
        email_domain: emailDomain,
        lead_id: leadCorrelationId,
      });

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

  const automationItems = AUTOMATIONS.filter((a) => a.category === "automation");
  const educationItems = AUTOMATIONS.filter((a) => a.category === "education");

  const heroTitle =
    selectedItems.length === 1
      ? "Angebot anfragen"
      : selectedItems.length > 1
        ? `Angebot für ${selectedItems.length} Lösungen anfragen`
        : "Kostenloses Analysegespräch sichern";

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={
          selectedItems.length > 0
            ? `Angebot anfragen: ${selectedItems.map((s) => s.name).join(", ").slice(0, 60)} | KI-Automationen`
            : "Kostenlose Potenzial-Analyse | KI-Automationen"
        }
        description={
          selectedItems.length > 0
            ? `Individuelles Angebot zu ${selectedItems.map((s) => s.name).join(", ").slice(0, 140)}.`
            : "In 30 Minuten analysieren wir Engpässe und Automatisierungspotenzial. Klare Prioritäten statt Tool-Demo."
        }
        canonical="/qualifizierung"
      />
      <Header />

      <main className="flex-1 pt-16">
        <section className="py-12 md:py-20 bg-gradient-to-br from-background via-muted to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                  {heroTitle}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  {selectedItems.length > 0
                    ? "Wir melden uns innerhalb von 24 Stunden mit einem individuellen Angebot."
                    : "In 15 Minuten schauen wir gemeinsam, wo du stehst und welche Lösungen passen."}
                </p>
              </div>

              {/* Auswahl-Block: Chips + Aufklappbare Liste */}
              <div className="mb-6 rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Welche Lösungen interessieren dich?
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mehrfachauswahl möglich. Optional — auch ohne Auswahl absendbar.
                    </p>
                  </div>
                  {selectedSlugs.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Alle entfernen
                    </button>
                  )}
                </div>

                {/* Aktive Chips */}
                {selectedItems.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-border">
                    {selectedItems.map((s) => (
                      <button
                        key={s.slug}
                        type="button"
                        onClick={() => toggleSlug(s.slug)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:bg-primary-deep transition-colors"
                      >
                        <Check className="h-3 w-3" />
                        <span className="font-mono opacity-80">{s.code}</span>
                        <span>{s.name}</span>
                        <span className="opacity-70 ml-0.5">×</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Schnellauswahl Chips */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Automatisierungen
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {automationItems.map((a) => {
                        const active = selectedSlugs.includes(a.slug);
                        return (
                          <button
                            key={a.slug}
                            type="button"
                            onClick={() => toggleSlug(a.slug)}
                            className={
                              active
                                ? "inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary text-xs font-medium px-3 py-1.5"
                                : "inline-flex items-center gap-1.5 rounded-full bg-background text-foreground border border-border hover:border-primary/50 text-xs font-medium px-3 py-1.5 transition-colors"
                            }
                          >
                            <span className="font-mono opacity-70">{a.code}</span>
                            {a.name}
                          </button>
                        );
                      })}
                      {/* Eigener Bot Chip */}
                      <button
                        type="button"
                        onClick={() => toggleSlug(CUSTOM_BOT_SLUG)}
                        className={
                          selectedSlugs.includes(CUSTOM_BOT_SLUG)
                            ? "inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary text-xs font-medium px-3 py-1.5"
                            : "inline-flex items-center gap-1.5 rounded-full bg-background text-foreground border border-dashed border-primary/40 hover:border-primary text-xs font-medium px-3 py-1.5 transition-colors"
                        }
                      >
                        <Bot className="h-3 w-3" />
                        Eigener Bot (individuell)
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      KI-Profi Programm
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {educationItems.map((a) => {
                        const active = selectedSlugs.includes(a.slug);
                        return (
                          <button
                            key={a.slug}
                            type="button"
                            onClick={() => toggleSlug(a.slug)}
                            className={
                              active
                                ? "inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary text-xs font-medium px-3 py-1.5"
                                : "inline-flex items-center gap-1.5 rounded-full bg-background text-foreground border border-border hover:border-primary/50 text-xs font-medium px-3 py-1.5 transition-colors"
                            }
                          >
                            <span className="font-mono opacity-70">{a.code}</span>
                            {a.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Aufklappbare Detail-Liste */}
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-2">
                      <span className="flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        Details zu allen Produkten anzeigen
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {AUTOMATIONS.map((a) => {
                          const active = selectedSlugs.includes(a.slug);
                          return (
                            <button
                              key={a.slug}
                              type="button"
                              onClick={() => toggleSlug(a.slug)}
                              className={
                                active
                                  ? "text-left rounded-lg border-2 border-primary bg-primary/5 p-3 transition-colors"
                                  : "text-left rounded-lg border border-border bg-background hover:border-primary/40 p-3 transition-colors"
                              }
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <Badge variant="outline" className="font-mono text-[10px]">
                                  {a.code}
                                </Badge>
                                {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                              </div>
                              <div className="font-semibold text-xs leading-snug text-foreground">
                                {a.name}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                                {a.subtitle}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8">
                <div className="flex items-start gap-3 mb-6 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden />
                  <p className="text-sm text-foreground leading-snug">
                    <span className="font-semibold">Antwort innerhalb von 24 Stunden</span> an Werktagen –
                    häufig noch am selben Tag. Termin für die Potenzial-Analyse meist innerhalb von 3–5 Werktagen.
                  </p>
                </div>
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
                          <FormLabel>
                            {selectedItems.length > 0
                              ? "Deine Anforderungen (optional)"
                              : "Nachricht (optional)"}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={
                                selectedItems.length > 0
                                  ? "z.B. genutzte Systeme, Volumen, Wunsch-Setup..."
                                  : "Erzähl uns kurz von deiner Situation..."
                              }
                              className="min-h-[120px]"
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
                                onCheckedChange={(checked) =>
                                  field.onChange(checked === true ? true : undefined)
                                }
                              />
                            </FormControl>
                            <label
                              className="text-sm text-muted-foreground leading-tight cursor-pointer"
                              onClick={() =>
                                field.onChange(field.value === true ? undefined : true)
                              }
                            >
                              Ich akzeptiere die{" "}
                              <a
                                href="/datenschutz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-primary hover:text-primary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Datenschutzerklärung
                              </a>{" "}
                              und die{" "}
                              <a
                                href="/agb"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-primary hover:text-primary/80"
                                onClick={(e) => e.stopPropagation()}
                              >
                                AGB
                              </a>{" "}
                              *
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
                      {isSubmitting
                        ? "Wird gesendet..."
                        : selectedItems.length > 0
                          ? "Angebot anfragen"
                          : "Gespräch anfordern"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      100% kostenlos · Unverbindlich · Antwort innerhalb 24 h
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
