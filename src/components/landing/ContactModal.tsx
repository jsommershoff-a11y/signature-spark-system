import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getStoredRefCode } from "@/components/affiliate/ReferralTracker";
import { trackLeadConversion } from "@/lib/analytics";
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

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen haben").max(100, "Name darf maximal 100 Zeichen haben"),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein").max(255, "E-Mail darf maximal 255 Zeichen haben"),
  phone: z.string().trim().max(30, "Telefonnummer darf maximal 30 Zeichen haben").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Nachricht darf maximal 1000 Zeichen haben").optional().or(z.literal("")),
  privacyAccepted: z.literal(true, { errorMap: () => ({ message: "Bitte akzeptiere die Datenschutzerklärung." }) }),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: "start" | "growth" | "handwerk" | "praxen" | "dienstleister" | "immobilien" | "kurzzeitvermietung" | "qualifizierung";
}

export const ContactModal = ({ isOpen, onClose, source }: ContactModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      privacyAccepted: undefined as unknown as true,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    const refCode = getStoredRefCode();
    // Eindeutige Transaktions-ID pro Submit (für Google Ads Dedup + CRM-Korrelation)
    const transactionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `lead_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        source,
        ref_code: refCode,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      form.reset();

      // Google Ads conversion event (Lead-Formular senden) — sauber im Erfolg-State,
      // mit transaction_id für serverseitige Deduplizierung in Google Ads
      trackLeadConversion({ transactionId });

      // Fire-and-forget: send notification emails
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      fetch(`${supabaseUrl}/functions/v1/notify-new-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: data.message || null,
          source,
          transaction_id: transactionId,
        }),
      }).catch((err) => console.error("Notify email failed:", err));
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Senden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            {source === "start" ? "Klarheitsgespräch sichern" : "Strategiegespräch sichern"}
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Anfrage erhalten!
              </h3>
              <p className="text-muted-foreground mb-6">
                Wir melden uns innerhalb von 24 Stunden bei dir.
              </p>
              <Button onClick={handleClose} variant="outline">
                Schließen
              </Button>
            </div>
          ) : (
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
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};
