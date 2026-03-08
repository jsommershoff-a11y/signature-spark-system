import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Zod Schema with validation
const qualifizierungSchema = z.object({
  name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen haben").max(100, "Name darf maximal 100 Zeichen haben"),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein").max(255, "E-Mail darf maximal 255 Zeichen haben"),
  phone: z.string().trim().max(30, "Telefonnummer darf maximal 30 Zeichen haben").optional().or(z.literal("")),
  branche: z.string().min(1, "Bitte wähle deine Branche"),
  jahresumsatz: z.enum(["unter_100k", "100k_250k", "250k_500k", "ueber_500k"], {
    required_error: "Bitte wähle deinen Jahresumsatz",
  }),
  entscheider_status: z.enum(["inhaber", "mitentscheider", "recherche_nur"], {
    required_error: "Bitte wähle deinen Entscheider-Status",
  }),
  motivation: z.string().trim().min(50, "Bitte mindestens 2-3 Sätze schreiben (min. 50 Zeichen)").max(2000, "Maximal 2000 Zeichen"),
  entscheidungsstil: z.enum(["red", "green", "blue"]).optional(),
  privacyAccepted: z.literal(true, { errorMap: () => ({ message: "Bitte akzeptiere die Datenschutzerklärung." }) }),
});

type QualifizierungFormData = z.infer<typeof qualifizierungSchema>;

// Scoring logic
function calculateQualificationScore(data: QualifizierungFormData): {
  score: number;
  isQualified: boolean;
} {
  // Hard Disqualifiers
  if (data.jahresumsatz === "unter_100k") return { score: 0, isQualified: false };
  if (data.entscheider_status === "recherche_nur") return { score: 0, isQualified: false };

  // Umsatz Score
  const umsatzScores: Record<string, number> = {
    "100k_250k": 25,
    "250k_500k": 50,
    "ueber_500k": 100,
  };
  
  // Entscheider Score
  const entscheiderScores: Record<string, number> = {
    "inhaber": 100,
    "mitentscheider": 50,
  };

  const umsatzScore = umsatzScores[data.jahresumsatz] ?? 0;
  const entscheiderScore = entscheiderScores[data.entscheider_status] ?? 0;
  const score = Math.round((umsatzScore * 0.5) + (entscheiderScore * 0.5));
  
  return { score, isQualified: score >= 50 };
}

const Qualifizierung = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<QualifizierungFormData>({
    resolver: zodResolver(qualifizierungSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      branche: "",
      motivation: "",
    },
  });

  const motivationLength = form.watch("motivation")?.length ?? 0;

  const onSubmit = async (data: QualifizierungFormData) => {
    setIsSubmitting(true);
    
    try {
      const { score, isQualified } = calculateQualificationScore(data);

      const { error } = await supabase.from("leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: null,
        source: "qualifizierung",
        branche: data.branche,
        jahresumsatz: data.jahresumsatz,
        entscheider_status: data.entscheider_status,
        motivation: data.motivation,
        entscheidungsstil: data.entscheidungsstil || null,
        qualification_score: score,
        is_qualified: isQualified,
      });

      if (error) {
        throw error;
      }

      // Navigate based on qualification status
      if (isQualified) {
        navigate("/danke");
      } else {
        navigate("/danke?status=info");
      }
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="py-12 md:py-20 bg-gradient-to-br from-background via-muted to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <Badge variant="secondary" className="mb-4">
                  Nur für Unternehmer ab 100.000 € Jahresumsatz
                </Badge>
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                  Kostenloses Analysegespräch sichern
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  In 15 Minuten schauen wir gemeinsam, wo du stehst und wie das Signature System dir helfen kann.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* Section: Kontaktdaten */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                        Kontaktdaten
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          name="branche"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Branche *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Wähle deine Branche" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="handwerk">Handwerk</SelectItem>
                                  <SelectItem value="praxen">Praxen (Arzt/Zahnarzt/Therapeut)</SelectItem>
                                  <SelectItem value="dienstleister">Dienstleister (Agentur/Beratung)</SelectItem>
                                  <SelectItem value="immobilien">Immobilien</SelectItem>
                                  <SelectItem value="kurzzeitvermietung">Kurzzeitvermietung</SelectItem>
                                  <SelectItem value="andere">Andere Branche</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Section: Qualifizierung */}
                    <div className="space-y-6">
                      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                        Qualifizierung
                      </h2>
                      
                      <FormField
                        control={form.control}
                        name="jahresumsatz"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Jahresumsatz *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="unter_100k" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Unter 100.000 €
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="100k_250k" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    100.000 – 250.000 €
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="250k_500k" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    250.000 – 500.000 €
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="ueber_500k" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    500.000 €+
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="entscheider_status"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Bist du der finale Entscheider? *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="inhaber" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Ja, ich bin Inhaber/Geschäftsführer
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="mitentscheider" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Ich bin Mitentscheider
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="recherche_nur" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Nein, ich recherchiere nur
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Section: Motivation */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                        Motivation
                      </h2>
                      
                      <FormField
                        control={form.control}
                        name="motivation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warum suchst du gerade Unterstützung? *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Beschreibe kurz deine aktuelle Situation und was du erreichen möchtest. Was sind deine größten Herausforderungen? (Min. 2-3 Sätze)"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className={motivationLength < 50 ? "text-muted-foreground" : "text-primary"}>
                              {motivationLength}/50 Zeichen (Minimum)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Section: Entscheidungsstil (optional) */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                        Entscheidungsstil <span className="text-muted-foreground font-normal text-sm">(optional)</span>
                      </h2>
                      
                      <FormField
                        control={form.control}
                        name="entscheidungsstil"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Wie triffst du Entscheidungen am ehesten?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="red" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Schnell und direkt, wenn das Ziel klar ist
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="green" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Im Austausch, wenn ich Sicherheit habe
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="blue" />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    Nach Analyse aller Fakten
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-deep hover:to-primary"
                      disabled={isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? "Wird gesendet..." : "Gespräch anfordern"}
                    </Button>
                    
                    <p className="text-sm text-muted-foreground text-center">
                      100% kostenlos. Kein Verkaufsdruck. Wir melden uns innerhalb von 24 Stunden.
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
