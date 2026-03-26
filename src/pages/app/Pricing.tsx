import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { STRIPE_PRODUCTS_LIST } from '@/lib/stripe-config';
import { toast } from 'sonner';
import {
  Gift,
  Zap,
  Rocket,
  Crown,
  Gem,
  Check,
  Star,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Loader2,
  MessageSquare,
} from 'lucide-react';

const TIER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  schnupper: Gift,
  website: Zap,
  wachstum: Rocket,
  ernsthaft: Crown,
  rakete: Gem,
};

export default function Pricing() {
  const { products, highestTier } = useMembershipAccess();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, productId: string) => {
    setLoadingId(productId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error('Checkout konnte nicht gestartet werden', {
        description: err.message || 'Bitte versuche es erneut.',
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          KRS Signature System
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Finde das passende Paket für dich
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Jedes Paket ist darauf ausgerichtet, dein Unternehmen mit KI effizienter zu machen –
          vom ersten Prompt bis zur vollständigen System-Transformation.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STRIPE_PRODUCTS_LIST.map((product) => {
          const Icon = TIER_ICONS[product.id] || Zap;
          const isActive = products.includes(product.membershipProduct || '');
          const isLoading = loadingId === product.id;

          return (
            <Card
              key={product.id}
              className={cn(
                'relative flex flex-col transition-shadow hover:shadow-lg',
                product.highlighted && 'border-primary shadow-md ring-2 ring-primary/20',
                isActive && 'border-success/50 bg-success/5'
              )}
            >
              {product.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-primary text-primary-foreground shadow-sm whitespace-nowrap">
                    <Star className="h-3 w-3" />
                    {product.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="mt-2">
                  {product.directPurchase ? (
                    <>
                      <span className="text-3xl font-bold">{product.price}</span>
                      <p className="text-xs text-muted-foreground mt-1">einmalig · zzgl. MwSt.</p>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">ab {product.price}</span>
                      <p className="text-xs text-muted-foreground mt-1">individuelles Angebot</p>
                    </>
                  )}
                </div>
                <CardDescription className="text-xs mt-2">
                  {product.description}
                </CardDescription>
              </CardHeader>

              <Separator />

              <CardContent className="flex-1 pt-4">
                <ul className="space-y-2.5">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
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
                ) : (
                  <Button
                    variant={product.highlighted ? 'default' : 'outline'}
                    className={cn('w-full', product.highlighted && 'shadow-sm')}
                    onClick={() => handleCheckout(product.priceId, product.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Wird geladen...' : 'Jetzt kaufen'}
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted shrink-0">
            <ShieldCheck className="h-7 w-7 text-foreground" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-base">100% Zufriedenheitsgarantie</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Du gehst kein Risiko ein. Wenn die Zusammenarbeit nicht passt, sagen wir dir das ehrlich.
              Alle Pakete beinhalten eine persönliche Beratung vor dem Kauf.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Links */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <Link to="/agb" className="underline hover:text-foreground transition-colors">AGB</Link>
        <Link to="/widerruf" className="underline hover:text-foreground transition-colors">Widerrufsbelehrung</Link>
        <a href="https://krsimmobilien.de/datenschutz" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Datenschutz</a>
      </div>
    </div>
  );
}
