import { Link, useLocation } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { SEOHead } from '@/components/landing/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  Calendar,
  GraduationCap,
  Users,
  Mail,
  Phone,
  BarChart3,
} from 'lucide-react';

const LOCKED_FEATURES = [
  { icon: GraduationCap, label: 'Mein System (komplett)', desc: 'Volle Academy mit allen Modulen' },
  { icon: Sparkles, label: 'Prompt-Bibliothek', desc: 'Über 200 erprobte KI-Prompts' },
  { icon: Users, label: 'CRM & Kunden-Management', desc: 'Pipeline, Deals, Aktivitäten' },
  { icon: Mail, label: 'Email-Automation', desc: 'Funnels, Broadcasts, Kampagnen' },
  { icon: Phone, label: 'Call-Center & Sipgate', desc: 'Integrierte Telefonie + Auswertung' },
  { icon: BarChart3, label: 'Reports & Analytics', desc: 'Tiefenauswertung deiner Zahlen' },
];

export default function Upgrade() {
  const location = useLocation();
  const trial = useTrialStatus();
  const reason = (location.state as { reason?: string } | null)?.reason;
  const fromPath = (location.state as { from?: string } | null)?.from;

  const isExpired = trial.isExpired;
  const isTrialing = trial.isTrialing;
  const days = trial.daysRemaining;

  return (
    <div className="space-y-8">
      <SEOHead
        title="Upgrade — KI Automationen"
        description="Schalte alle Mitgliederbereiche frei: Academy, CRM, Automatisierungen, Reports."
        noIndex
      />

      {/* Status-Banner */}
      <div
        className={`rounded-2xl border p-5 md:p-6 ${
          isExpired
            ? 'bg-destructive/5 border-destructive/30'
            : 'bg-primary/5 border-primary/20'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isExpired ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
            }`}
          >
            {isExpired ? <Lock className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                {isExpired
                  ? 'Dein Trial ist abgelaufen'
                  : isTrialing
                  ? 'Dieser Bereich ist im Trial gesperrt'
                  : 'Upgrade auf Vollzugriff'}
              </h1>
              {isTrialing && days !== null && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" /> Noch {days} Tag{days === 1 ? '' : 'e'}
                </Badge>
              )}
            </div>
            <p className="mt-1.5 text-sm md:text-base text-muted-foreground">
              {isExpired
                ? 'Schalte deinen Zugang wieder frei und arbeite ohne Limits weiter.'
                : 'Im Trial siehst du nur Pricing, eine Erfahrungs-Preview und kannst einmalig einen Live-Call buchen. Upgrade jetzt für vollen Zugriff.'}
            </p>
            {fromPath && (
              <p className="mt-2 text-xs text-muted-foreground/70">
                Du wolltest auf <code className="font-mono">{fromPath}</code> zugreifen.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTA-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <Badge className="w-fit mb-2">Empfohlen</Badge>
            <CardTitle className="text-2xl">Mitgliedschaft buchen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Voller Zugriff auf Academy, CRM, Automatisierungen, Live-Calls, Tools.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link to="/app/pricing">
                Pakete & Preise ansehen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Live-Call kennenlernen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isExpired
                ? 'Live-Calls sind nach Upgrade wieder verfügbar.'
                : 'Nutze dein einmaliges Trial-Ticket und sei bei einem Live-Call dabei.'}
            </p>
            <Button asChild variant="outline" size="lg" className="w-full" disabled={isExpired}>
              <Link to="/app/calendar">
                Zum Live-Kalender
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Was du nach Upgrade freischaltest */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Das schaltest du mit dem Upgrade frei
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LOCKED_FEATURES.map(f => (
            <div
              key={f.label}
              className="rounded-xl border border-border/60 p-4 bg-card hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm flex items-center gap-1.5">
                    {f.label}
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 md:p-8 text-center">
        <h3 className="text-xl md:text-2xl font-semibold">Bereit für Vollzugriff?</h3>
        <p className="mt-2 text-sm md:text-base opacity-90">
          Wähle dein Paket und starte sofort.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-4">
          <Link to="/app/pricing">Pakete ansehen</Link>
        </Button>
      </div>
      {reason && <span className="sr-only">reason:{reason}</span>}
    </div>
  );
}
