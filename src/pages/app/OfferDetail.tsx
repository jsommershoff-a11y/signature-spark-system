import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOffers } from '@/hooks/useOffers';
import { useAuth } from '@/contexts/AuthContext';
import { OfferPreview } from '@/components/offers/OfferPreview';
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge';
import { PaymentUnlockButton } from '@/components/offers/PaymentUnlockButton';
import { PainPointRadar } from '@/components/offers/PainPointRadar';
import { ProgressTracker } from '@/components/offers/ProgressTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Check, Send, Copy, ExternalLink, User,
  FileText, Eye, CreditCard, CheckCircle2, Clock, PenLine,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { OfferStatus } from '@/types/offers';
import { cn } from '@/lib/utils';

// =============================================
// Workflow Steps
// =============================================

const WORKFLOW_STEPS: { status: OfferStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'draft', label: 'Entwurf', icon: <FileText className="h-4 w-4" /> },
  { status: 'pending_review', label: 'Prüfung', icon: <Clock className="h-4 w-4" /> },
  { status: 'approved', label: 'Genehmigt', icon: <Check className="h-4 w-4" /> },
  { status: 'sent', label: 'Gesendet', icon: <Send className="h-4 w-4" /> },
  { status: 'viewed', label: 'Angesehen', icon: <Eye className="h-4 w-4" /> },
  { status: 'accepted', label: 'Angenommen', icon: <CheckCircle2 className="h-4 w-4" /> },
  { status: 'paid', label: 'Bezahlt', icon: <CreditCard className="h-4 w-4" /> },
];

function getStepIndex(status: OfferStatus): number {
  const idx = WORKFLOW_STEPS.findIndex(s => s.status === status);
  return idx >= 0 ? idx : 0;
}

export default function OfferDetail() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasMinRole } = useAuth();
  const { offers, isLoading, approveOffer, sendOffer, unlockPayment, submitForReview, updateOffer } = useOffers();

  const offer = offers.find((o) => o.id === offerId);

  const canSubmitForReview = hasMinRole('mitarbeiter');
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

  const handleProgressUpdate = async (updatedJson: any) => {
    if (!offer) return;
    await updateOffer({ id: offer.id, offer_json: updatedJson });
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

  const currentStepIndex = getStepIndex(offer.status);
  const offerJson = offer.offer_json;

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
              {offerJson?.title || 'Angebot'}
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

      {/* Workflow Status Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-1">
            {WORKFLOW_STEPS.map((ws, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isExpired = offer.status === 'expired';

              return (
                <div key={ws.status} className="flex items-center gap-1 flex-1">
                  <div className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full shrink-0 transition-colors',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent && !isExpired
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : 'bg-muted text-muted-foreground'
                  )}>
                    {isCompleted ? <Check className="h-4 w-4" /> : ws.icon}
                  </div>
                  <span className={cn(
                    'text-xs truncate hidden lg:block',
                    isCurrent ? 'font-semibold' : 'text-muted-foreground'
                  )}>
                    {ws.label}
                  </span>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={cn(
                      'h-px flex-1 ml-1',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3">
        {/* Submit for review */}
        {canSubmitForReview && offer.status === 'draft' && (
          <Button onClick={() => submitForReview(offer.id)}>
            <Clock className="h-4 w-4 mr-2" />
            Zur Prüfung einreichen
          </Button>
        )}

        {/* Approve */}
        {canApprove && offer.status === 'pending_review' && (
          <Button onClick={() => approveOffer(offer.id)}>
            <Check className="h-4 w-4 mr-2" />
            Genehmigen
          </Button>
        )}

        {/* Send */}
        {canSend && offer.status === 'approved' && (
          <Button onClick={() => sendOffer(offer.id)}>
            <Send className="h-4 w-4 mr-2" />
            Senden
          </Button>
        )}

        {/* Unlock payment — only after accepted */}
        {canUnlockPayment && offer.status === 'accepted' && (
          <PaymentUnlockButton
            isUnlocked={offer.payment_unlocked}
            onUnlock={async () => { await unlockPayment(offer.id); }}
          />
        )}

        {/* Public link actions */}
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

      {/* Pain-Point Radar (if discovery data exists) */}
      {offerJson?.discovery_data && (
        <PainPointRadar
          discoveryData={offerJson.discovery_data}
          selectedModules={offerJson.selected_modules}
          offerMode={offerJson.offer_mode}
        />
      )}

      {/* Offer Preview */}
      {offerJson && <OfferPreview content={offerJson} />}

      {/* Progress Tracker for variable offers (staff + admin) */}
      {offerJson?.offer_mode === 'variable' && hasMinRole('mitarbeiter') && (
        <ProgressTracker offer={offer} onUpdate={handleProgressUpdate} />
      )}

      {/* Contract Details (if accepted/signed) */}
      {offerJson?.contract_accepted && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              Vertragsdetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Unterzeichnet von</p>
                <p className="font-medium">{offerJson.signer_name || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Unterzeichnet am</p>
                <p className="font-medium">
                  {offerJson.contract_accepted_at
                    ? new Date(offerJson.contract_accepted_at).toLocaleString('de-DE')
                    : '—'}
                </p>
              </div>
            </div>
            {offerJson.signature_data && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">Unterschrift</p>
                <div className="bg-muted/50 rounded-lg p-4 inline-block">
                  <img
                    src={offerJson.signature_data}
                    alt="Unterschrift"
                    className="max-h-20"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
