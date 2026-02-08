import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Send, Eye, FileText } from 'lucide-react';
import type { Offer } from '@/types/offers';
import { OfferStatusBadge } from './OfferStatusBadge';
import { formatCents } from '@/types/offers';

interface OfferApprovalCardProps {
  offer: Offer;
  onApprove?: () => void;
  onSend?: () => void;
  onView?: () => void;
  canApprove?: boolean;
  canSend?: boolean;
}

export function OfferApprovalCard({
  offer,
  onApprove,
  onSend,
  onView,
  canApprove,
  canSend,
}: OfferApprovalCardProps) {
  const leadName = offer.lead 
    ? `${offer.lead.first_name} ${offer.lead.last_name || ''}`.trim()
    : 'Unbekannt';

  const total = offer.offer_json?.total_cents || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{leadName}</CardTitle>
            {offer.lead?.company && (
              <p className="text-sm text-muted-foreground">{offer.lead.company}</p>
            )}
          </div>
          <OfferStatusBadge status={offer.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Betrag:</span>
          <span className="font-bold">{formatCents(total)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Erstellt:</span>
          <span>
            {formatDistanceToNow(new Date(offer.created_at), {
              addSuffix: true,
              locale: de,
            })}
          </span>
        </div>

        {offer.creator && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Von:</span>
            <span>
              {offer.creator.first_name} {offer.creator.last_name}
            </span>
          </div>
        )}

        {offer.payment_unlocked && (
          <Badge variant="secondary" className="w-full justify-center">
            Zahlung freigeschaltet
          </Badge>
        )}

        <div className="flex gap-2 pt-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={onView} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              Ansehen
            </Button>
          )}

          {canApprove && offer.status === 'pending_review' && onApprove && (
            <Button size="sm" onClick={onApprove} className="flex-1">
              <Check className="h-4 w-4 mr-1" />
              Genehmigen
            </Button>
          )}

          {canSend && offer.status === 'approved' && onSend && (
            <Button size="sm" onClick={onSend} className="flex-1">
              <Send className="h-4 w-4 mr-1" />
              Senden
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
