import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import {
  PartyPopper,
  GraduationCap,
  User,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const PRODUCT_NAMES: Record<string, string> = {
  starter: 'KI-Prozess-Kickstart (Starter)',
  growth: 'KI-Komplettpaket (Growth)',
  premium: 'KI-VIP Done-for-You (Premium)',
};

const PRODUCT_FEATURES: Record<string, string[]> = {
  starter: [
    'Kompletter Prompting-Kurs',
    'KI-Workflow-Grundlagen',
    'Sales-Optimierung mit Structogram®',
    'Community-Zugang',
    '4 Wochen E-Mail-Support',
  ],
  growth: [
    'Alle Starter-Inhalte',
    'Automatisierungs-Masterclass',
    'KI-Content-Produktion',
    'Persönlicher Implementierungs-Plan',
    '1:1 Strategie-Call',
    '8 Wochen persönlicher Support',
  ],
  premium: [
    'Alle Growth-Inhalte',
    'Done-for-You Implementierung',
    'Custom GPT für dein Business',
    'Make.com / Zapier Setup',
    '1:1 Betreuung (12 Wochen)',
    'Priorisierter Slack-Support',
  ],
};

export default function Welcome() {
  const { profile } = useAuth();
  const { products } = useMembershipAccess();

  const activeProduct = products.length > 0 ? products[products.length - 1] : 'starter';
  const productName = PRODUCT_NAMES[activeProduct] || 'Dein Paket';
  const features = PRODUCT_FEATURES[activeProduct] || PRODUCT_FEATURES.starter;

  return (
    <div className="container mx-auto py-8 max-w-3xl space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <PartyPopper className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Willkommen{profile?.first_name ? `, ${profile.first_name}` : ''}! 🎉
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Deine Zahlung war erfolgreich. Du hast jetzt vollen Zugang zu deinem Paket.
        </p>
      </div>

      {/* What you got */}
      <Card className="border-primary/30 shadow-md">
        <CardContent className="py-6 space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="gap-1 bg-primary text-primary-foreground">
              <Sparkles className="h-3 w-3" />
              Freigeschaltet
            </Badge>
            <h2 className="font-semibold text-lg">{productName}</h2>
          </div>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* What now */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Was dich jetzt erwartet
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center text-center gap-2 py-5">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h3 className="font-medium text-sm">Academy starten</h3>
              <p className="text-xs text-muted-foreground">Dein erstes Modul wartet</p>
              <Button variant="outline" size="sm" asChild className="mt-1">
                <Link to="/app/academy">
                  Öffnen <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center text-center gap-2 py-5">
              <User className="h-8 w-8 text-primary" />
              <h3 className="font-medium text-sm">Profil vervollständigen</h3>
              <p className="text-xs text-muted-foreground">Für bessere Empfehlungen</p>
              <Button variant="outline" size="sm" asChild className="mt-1">
                <Link to="/app/settings">
                  Einstellungen <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center text-center gap-2 py-5">
              <Sparkles className="h-8 w-8 text-primary" />
              <h3 className="font-medium text-sm">Verträge ansehen</h3>
              <p className="text-xs text-muted-foreground">Alle deine Dokumente</p>
              <Button variant="outline" size="sm" asChild className="mt-1">
                <Link to="/app/contracts">
                  Verträge <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
