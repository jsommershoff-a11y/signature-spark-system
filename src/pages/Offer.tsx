import { useParams, Link } from 'react-router-dom';
import { usePublicOffer } from '@/hooks/useOffers';
import { OfferPreview } from '@/components/offers/OfferPreview';
import { PainPointRadar } from '@/components/offers/PainPointRadar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Lock, CreditCard } from 'lucide-react';

export default function PublicOffer() {
  const { token } = useParams<{ token: string }>();
  const { data: offer, isLoading, error } = usePublicOffer(token || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h1 className="text-xl font-bold mb-2">Angebot nicht gefunden</h1>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Dieses Angebot existiert nicht oder ist nicht mehr verfügbar.
            </p>
            <Button variant="outline" asChild>
              <Link to="/">Zur Startseite</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = offer.expires_at && new Date(offer.expires_at) < new Date();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Ihr persönliches Angebot</h1>
          {offer.viewed_at && (
            <p className="text-sm text-muted-foreground">
              Erstellt für {offer.lead?.first_name} {offer.lead?.last_name}
            </p>
          )}
        </div>

        {/* Expired Notice */}
        {isExpired && (
          <Card className="mb-6 border-destructive">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium">Dieses Angebot ist abgelaufen</p>
                <p className="text-sm text-muted-foreground">
                  Bitte kontaktieren Sie uns für ein aktualisiertes Angebot.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offer Content */}
        <OfferPreview content={offer.offer_json} />

        {/* Standalone Pain-Point Radar for public page (if not already in OfferPreview) */}

        {/* Payment Section */}
        <div className="mt-8">
          {!offer.payment_unlocked ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Lock className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">Zahlung noch nicht freigeschaltet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Unser Team wird die Zahlung freischalten, sobald alle Details 
                  besprochen wurden. Bei Fragen kontaktieren Sie uns gerne.
                </p>
              </CardContent>
            </Card>
          ) : isExpired ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-destructive mb-3" />
                <h3 className="font-medium mb-1">Angebot abgelaufen</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Kontaktieren Sie uns für ein neues Angebot.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CreditCard className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-medium mb-3">Bereit zum Starten?</h3>
                <Button size="lg" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Jetzt bezahlen
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Sichere Zahlung über Stripe
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Bei Fragen erreichen Sie uns unter:</p>
          <p className="font-medium">support@example.com</p>
        </div>
      </div>
    </div>
  );
}
