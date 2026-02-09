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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const qualifizierungSchema = z.object({
  name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen haben").max(100, "Name darf maximal 100 Zeichen haben"),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse ein").max(255, "E-Mail darf maximal 255 Zeichen haben"),
  phone: z.string().trim().max(30, "Telefonnummer darf maximal 30 Zeichen haben").optional().or(z.literal("")),
  branche: z.string().min(1, "Bitte wähle deine Branche"),
  message: z.string().trim().max(1000, "Nachricht darf maximal 1000 Zeichen haben").optional().or(z.literal("")),
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
      branche: "",
      message: "",
    },
  });

  const onSubmit = async (data: QualifizierungFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: `Branche: ${data.branche}${data.message ? `\n\n${data.message}` : ""}`,
        source: "qualifizierung",
      });

      if (error) {
        throw error;
      }

      navigate("/danke");
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
        <section className="py-20 bg-gradient-to-br from-background via-muted to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Kostenloses Analysegespräch sichern
                </h1>
                <p className="text-lg text-muted-foreground">
                  In 15 Minuten schauen wir gemeinsam, wo du stehst und wie das Signature System dir helfen kann.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Was ist deine größte Herausforderung? (optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Erzähl uns kurz, wo du gerade stehst..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
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
