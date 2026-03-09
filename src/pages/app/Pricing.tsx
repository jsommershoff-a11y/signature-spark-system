import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { cn } from '@/lib/utils';
import {
  Gift,
  Zap,
  Rocket,
  Crown,
  Check,
  Star,
  Phone,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  ctaVariant: 'default' | 'outline' | 'secondary';
  badge?: string;
}

const TIERS: PricingTier[] = [
  {
    id: 'freebie',
    name: 'Freebie',
    price: '0 €',
    priceNote: 'Kostenlos nach Registrierung',
    description: '5 fertige KI-Prompts + Analyse-Gespräch, um dein Business zu verstehen.',
    icon: Gift,
    features: [
      '5 sofort einsetzbare KI-Prompts',
      'Persönliche KI-Bedarfsanalyse',
      'Erste 2 Lektionen jedes Kurses',
      'Zugang zum Mitgliederbereich',
      'Kostenfreies Analyse-Gespräch',
    ],
    ctaLabel: 'Kostenlos starten',
    ctaVariant: 'outline',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '998 €',
    priceNote: 'einmalig · zzgl. MwSt.',
    description: 'KI-Prozess-Kickstart: Dein erster Schritt in die KI-gestützte Automatisierung.',
    icon: Zap,
    features: [
      'Alles aus Freebie',
      'Kompletter Prompting-Kurs',
      'KI-Workflow-Grundlagen',
      'Sales-Optimierung mit Structogram®',
      'Community-Zugang',
      '4 Wochen E-Mail-Support',
    ],
    ctaLabel: 'Analyse-Gespräch buchen',
    ctaVariant: 'outline',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '2.998 €',
    priceNote: 'einmalig · zzgl. MwSt.',
    description: 'Das Komplettpaket für messbare KI-Integration in deinem Unternehmen.',
    icon: Rocket,
    highlighted: true,
    badge: 'Beliebteste Wahl',
    features: [
      'Alles aus Starter',
      'Alle Mid-Range-Kurse',
      'Automatisierungs-Masterclass',
      'KI-Content-Produktion',
      'Persönlicher Implementierungs-Plan',
      '1:1 Strategie-Call (60 Min.)',
      '8 Wochen persönlicher Support',
    ],
    ctaLabel: 'Jetzt Gespräch vereinbaren',
    ctaVariant: 'default',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '9.998 €',
    priceNote: 'einmalig · zzgl. MwSt.',
    description: 'VIP Done-for-You: Wir implementieren die KI-Systeme direkt für dich.',
    icon: Crown,
    features: [
      'Alles aus Growth',
      'Alle Premium-Kurse',
      'Done-for-You Implementierung',
      'Custom GPT für dein Business',
      'Make.com / Zapier Setup',
      '1:1 Betreuung (12 Wochen)',
      'Priorisierter Slack-Support',
      'Quartals-Review & Optimierung',
    ],
    ctaLabel: 'Persönliches Gespräch',
    ctaVariant: 'outline',
  },
];

export default function Pricing() {
  const { products, highestTier } = useMembershipAccess();

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          KI-Transformation für dein Business
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Finde das passende Paket für dich
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Jedes Paket ist darauf ausgerichtet, dein Unternehmen mit KI effizienter zu machen –
          vom ersten Prompt bis zur vollständigen Automatisierung.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const isActive = products.includes(tier.id);
          return (
            <Card
              key={tier.id}
              className={cn(
                'relative flex flex-col transition-shadow hover:shadow-lg',
                tier.highlighted && 'border-primary shadow-md ring-2 ring-primary/20',
                isActive && 'border-primary/50 bg-primary/5'
              )}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-primary text-primary-foreground shadow-sm">
                    <Star className="h-3 w-3" />
                    {tier.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <tier.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <p className="text-xs text-muted-foreground mt-1">{tier.priceNote}</p>
                </div>
                <CardDescription className="text-xs mt-2">
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <Separator />

              <CardContent className="flex-1 pt-4">
                <ul className="space-y-2.5">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className="p-4 pt-0 mt-auto">
                {isActive ? (
                  <Button variant="secondary" className="w-full" disabled>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Aktiv
                  </Button>
                ) : tier.id === 'freebie' ? (
                  <Button
                    variant={tier.ctaVariant}
                    className="w-full"
                    asChild
                  >
                    <Link to="/app/academy">
                      {tier.ctaLabel}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant={tier.ctaVariant}
                    className={cn('w-full', tier.highlighted && 'shadow-sm')}
                    asChild
                  >
                    <Link to="/app/settings">
                      <Phone className="h-4 w-4 mr-2" />
                      {tier.ctaLabel}
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Guarantee */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 shrink-0">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base">100% Zufriedenheitsgarantie</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Du gehst kein Risiko ein. Im persönlichen Analyse-Gespräch klären wir gemeinsam,
              welches Paket für dich optimal ist – bevor du investierst.
              Wenn die Zusammenarbeit nicht passt, sagen wir dir das ehrlich.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
