import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOffers } from '@/hooks/useOffers';
import { useAuth } from '@/contexts/AuthContext';
import { OfferPreview } from '@/components/offers/OfferPreview';
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge';
import { PaymentUnlockButton } from '@/components/offers/PaymentUnlockButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Check, Send, Copy, ExternalLink, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OfferDetail() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasMinRole } = useAuth();
  const { offers, isLoading, approveOffer, sendOffer, unlockPayment } = useOffers();

  const offer = offers.find((o) => o.id === offerId);

  const canApprove = hasMinRole('teamleiter');
  const canSend = hasMinRole('mitarbeiter');
  const canUnlockPayment = hasMinRole('teamleiter');

  const publicUrl = offer?.public_token
    ? `${window.location.origin}/offer/${offer.public_token}`
    : null;

  const copyPublicLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      toast({ title: 'Link kopiert', description: 'Der öffentliche Link wurde kopiert.' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/app/offers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">Angebot nicht gefunden</h3>
            <p className="text-sm text-muted-foreground">
              Dieses Angebot existiert nicht oder Sie haben keinen Zugriff.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/offers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {offer.offer_json?.title || 'Angebot'}
            </h1>
            <OfferStatusBadge status={offer.status} />
          </div>
          {offer.lead && (
            <p className="text-sm text-muted-foreground">
              {offer.lead.first_name} {offer.lead.last_name}
              {offer.lead.company ? ` · ${offer.lead.company}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3">
        {canApprove && offer.status === 'pending_review' && (
          <Button onClick={() => approveOffer(offer.id)}>
            <Check className="h-4 w-4 mr-2" />
            Genehmigen
          </Button>
        )}

        {canSend && offer.status === 'approved' && (
          <Button onClick={() => sendOffer(offer.id)}>
            <Send className="h-4 w-4 mr-2" />
            Senden
          </Button>
        )}

        {canUnlockPayment && (offer.status === 'sent' || offer.status === 'viewed') && (
          <PaymentUnlockButton
            isUnlocked={offer.payment_unlocked}
            onUnlock={async () => { await unlockPayment(offer.id); }}
          />
        )}

        {publicUrl && (
          <>
            <Button variant="outline" onClick={copyPublicLink}>
              <Copy className="h-4 w-4 mr-2" />
              Link kopieren
            </Button>
            <Button variant="outline" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Öffnen
              </a>
            </Button>
          </>
        )}

        {offer.lead && (
          <Button variant="outline" asChild>
            <Link to="/app/leads">
              <User className="h-4 w-4 mr-2" />
              Lead ansehen
            </Link>
          </Button>
        )}
      </div>

      {/* Offer Preview */}
      {offer.offer_json && <OfferPreview content={offer.offer_json} />}

      {/* Notes */}
      {offer.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{offer.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
