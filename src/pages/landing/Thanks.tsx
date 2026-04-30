import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Info, ArrowLeft, BookOpen, Users } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { SEOHead } from "@/components/landing/SEOHead";
import { Button } from "@/components/ui/button";
import { trackLeadConversion, trackEvent } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const REDIRECT_SECONDS = 5;

const Thanks = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const isInfo = status === "info";
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth() as any;
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  // Fire Google Ads conversion only for qualified leads (not the "info"/disqualified path)
  useEffect(() => {
    if (!isInfo) {
      trackLeadConversion();
    }

    // Apollo + GA4 funnel attribution: thank_you_view verknüpft mit lead_form_submitted
    // über die in sessionStorage hinterlegte Korrelation-ID.
    let attribution: {
      lead_id?: string;
      form?: string;
      source?: string;
      email_domain?: string | null;
      apollo_identified?: boolean;
      submitted_at?: number;
    } = {};
    try {
      const raw = window.sessionStorage.getItem("krs_lead_attribution");
      if (raw) attribution = JSON.parse(raw);
    } catch {
      /* ignore */
    }

    const timeOnFormMs =
      attribution.submitted_at ? Date.now() - attribution.submitted_at : null;

    void trackEvent("thank_you_view", {
      variant: isInfo ? "info" : "qualified",
      lead_id: attribution.lead_id ?? null,
      lead_form: attribution.form ?? null,
      lead_source: attribution.source ?? null,
      email_domain: attribution.email_domain ?? null,
      apollo_identified: attribution.apollo_identified ?? false,
      time_to_thanks_ms: timeOnFormMs,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    });

    // Attribution-Payload nach Verbrauch entfernen, damit Reloads/Backnavigation
    // kein doppeltes Funnel-Match auslösen.
    try {
      window.sessionStorage.removeItem("krs_lead_attribution");
    } catch {
      /* ignore */
    }
  }, [isInfo]);

  // Auto-start 14-day trial + redirect logged-in users into the member area
  useEffect(() => {
    if (isInfo || !user) return;
    let cancelled = false;
    (async () => {
      try {
        await supabase.rpc("start_member_trial" as any);
        if (typeof refreshProfile === "function") await refreshProfile();
      } catch (e) {
        console.error("[thanks] start_member_trial failed", e);
      }
      if (cancelled) return;
      const tick = window.setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            window.clearInterval(tick);
            navigate("/app/dashboard", { replace: true });
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    })();
    return () => {
      cancelled = true;
    };
  }, [isInfo, user, navigate, refreshProfile]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={isInfo ? "Danke für dein Interesse | KI-Automationen" : "Vielen Dank für deine Anfrage | KI-Automationen"}
        description="Bestätigung deiner Anfrage an KI-Automationen. Wir melden uns innerhalb von 24 Stunden bei dir."
        canonical="/danke"
        noIndex
      />
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-background via-muted to-background">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              {isInfo ? (
                <>
                  {/* Disqualified / Info Variant */}
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
                    <Info className="w-10 h-10 text-muted-foreground" />
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Danke für dein Interesse!
                  </h1>
                  
                  <p className="text-lg text-muted-foreground mb-4">
                    Das Signature System richtet sich speziell an Unternehmer mit mindestens 100.000 € Jahresumsatz, die als Entscheider direkt handeln können.
                  </p>
                  
                  <p className="text-muted-foreground mb-10">
                    Aktuell passt unser Angebot möglicherweise noch nicht zu deiner Situation – aber das kann sich ändern! Schau dich gerne um und informiere dich über unseren Ansatz.
                  </p>
                  
                  <div className="bg-card rounded-xl border border-primary/20 p-6 mb-10">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-6 h-6 text-primary" />
                      <h3 className="font-semibold text-foreground">Starte trotzdem kostenlos</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tritt unserer KI-Community bei – vernetze dich mit Unternehmern und hole dir erste Impulse für dein Business.
                    </p>
                    <Link to="/community">
                      <Button variant="default" size="sm" className="gap-2">
                        Zur kostenlosen Community
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                      <Button variant="outline" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Zurück zur Startseite
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Qualified / Success Variant */}
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-primary" />
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                    Vielen Dank für deine Anfrage!
                  </h1>
                  
                  <p className="text-lg text-muted-foreground mb-4">
                    Wir haben deine Nachricht erhalten und melden uns innerhalb von 24 Stunden bei dir.
                  </p>
                  
                  <p className="text-muted-foreground mb-10">
                    In der Zwischenzeit: Schau dich gerne um und erfahre mehr über das Signature System.
                  </p>
                  
                  {user ? (
                    <div className="bg-primary/5 rounded-xl border border-primary/30 p-6 mb-10 text-left">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          Dein 14-Tage-Test ist aktiviert
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Du wirst in <span className="font-semibold text-foreground">{countdown}s</span> automatisch in deinen Mitgliederbereich weitergeleitet. Du kannst dich einmalig für einen Live-Call anmelden – danach ist die Buchung bis zum Upgrade gesperrt.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={() => navigate("/app/dashboard")} className="gap-2">
                          Jetzt zum Dashboard
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/app/calendar")} className="gap-2">
                          Live-Call buchen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card rounded-xl border border-primary/20 p-6 mb-10">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="w-6 h-6 text-primary" />
                        <h3 className="font-semibold text-foreground">In der Zwischenzeit: Tritt unserer Community bei</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Vernetze dich mit anderen Unternehmern, sieh dir Pakete an und sichere dir deinen Platz im Mitgliederbereich.
                      </p>
                      <Link to="/community">
                        <Button variant="outline" size="sm" className="gap-2">
                          Zur KI-Community
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                      </Link>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                      <Button variant="outline" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Zurück zur Startseite
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Thanks;
