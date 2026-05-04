import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOffers } from '@/hooks/useOffers';
import { useAuth } from '@/contexts/AuthContext';
import { OfferPreview } from '@/components/offers/OfferPreview';
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge';
import { PaymentUnlockButton } from '@/components/offers/PaymentUnlockButton';
import { PainPointRadar } from '@/components/offers/PainPointRadar';
import { ProgressTracker } from '@/components/offers/ProgressTracker';
import { SalesGuideWizard } from '@/components/offers/SalesGuideWizard';
import { RoiSummaryCard } from '@/components/offers/RoiSummaryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Check, Send, Copy, ExternalLink, User,
  FileText, Eye, CreditCard, CheckCircle2, Clock, PenLine,
  Download, Share2, MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { OfferStatus, DiscoveryData, OfferContent } from '@/types/offers';
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

  const [showGuide, setShowGuide] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const offer = offers.find((o) => o.id === offerId);

  const canSubmitForReview = hasMinRole('vertriebspartner');
  const canApprove = hasMinRole('gruppenbetreuer');
  const canSend = hasMinRole('vertriebspartner');
  const canUnlockPayment = hasMinRole('gruppenbetreuer');

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

  const handleSaveDiscovery = async (data: DiscoveryData) => {
    if (!offer) return;
    const updatedJson: OfferContent = {
      ...offer.offer_json,
      discovery_data: data,
      offer_mode: data.recommended_mode || offer.offer_json.offer_mode,
    };
    await updateOffer({ id: offer.id, offer_json: updatedJson });
    toast({ title: 'Analyse gespeichert', description: 'Die Pain-Point-Analyse wurde dem Angebot hinzugefügt.' });
  };

  const handleSaveGuideNotes = async (phaseNotes: Record<string, any>) => {
    if (!offer) return;
    const existingNotes = offer.notes || '';
    const guideNotesText = Object.entries(phaseNotes)
      .filter(([, data]) => data.notes)
      .map(([phaseId, data]) => `[${phaseId}] ${data.notes}`)
      .join('\n');
    
    const combinedNotes = existingNotes
      ? `${existingNotes}\n\n--- Gesprächsnotizen ---\n${guideNotesText}`
      : `--- Gesprächsnotizen ---\n${guideNotesText}`;

    await updateOffer({ id: offer.id, notes: combinedNotes });
    toast({ title: 'Notizen gespeichert', description: 'Die Gesprächsnotizen wurden gespeichert.' });
  };

  const handleDownloadPDF = async () => {
    if (!offer) return;
    setPdfLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-offer-pdf', {
        body: { offer_id: offer.id },
      });

      if (error) throw error;

      // The edge function returns HTML - open in new tab for printing
      const blob = new Blob([data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast({ title: 'PDF generiert', description: 'Das Angebot wurde in einem neuen Tab geöffnet. Nutzen Sie "Drucken" → "Als PDF speichern".' });
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message || 'PDF konnte nicht generiert werden.', variant: 'destructive' });
    } finally {
      setPdfLoading(false);
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

  const currentStepIndex = getStepIndex(offer.status);
  const offerJson = offer.offer_json;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" onClick={() => navigate('/app/offers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
              {offerJson?.title || 'Angebot'}
            </h1>
            <OfferStatusBadge status={offer.status} />
          </div>
          {offer.lead && (
            <p className="text-sm text-muted-foreground truncate">
              {offer.lead.first_name} {offer.lead.last_name}
              {offer.lead.company ? ` · ${offer.lead.company}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Workflow Status Bar */}
      <Card>
        <CardContent className="py-3 md:py-4 overflow-x-auto">
          <div className="flex items-center gap-0.5 md:gap-1 min-w-[280px]">
            {WORKFLOW_STEPS.map((ws, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isExpired = offer.status === 'expired';

              return (
                <div key={ws.status} className="flex items-center gap-0.5 md:gap-1 flex-1">
                  <div className={cn(
                    'flex items-center justify-center h-6 w-6 md:h-8 md:w-8 rounded-full shrink-0 transition-colors',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent && !isExpired
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : 'bg-muted text-muted-foreground'
                  )}>
                    {isCompleted ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : React.cloneElement(ws.icon as React.ReactElement, { className: 'h-3 w-3 md:h-4 md:w-4' })}
                  </div>
                  <span className={cn(
                    'text-[10px] md:text-xs truncate hidden sm:block',
                    isCurrent ? 'font-semibold' : 'text-muted-foreground'
                  )}>
                    {ws.label}
                  </span>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={cn(
                      'h-px flex-1 ml-0.5 md:ml-1',
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
      <div className="space-y-3">
        {/* Primary Actions */}
        <div className="flex flex-wrap gap-2">
          {/* Sales Guide Toggle */}
          <Button
            variant={showGuide ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="md:size-default"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            <span className="hidden xs:inline">{showGuide ? 'Leitfaden ausblenden' : 'Gesprächsleitfaden'}</span>
            <span className="xs:hidden">{showGuide ? 'Ausblenden' : 'Leitfaden'}</span>
          </Button>

          {/* Submit for review */}
          {canSubmitForReview && offer.status === 'draft' && (
            <Button size="sm" onClick={() => submitForReview(offer.id)}>
              <Clock className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Zur Prüfung einreichen</span>
              <span className="sm:hidden">Einreichen</span>
            </Button>
          )}

          {/* Approve */}
          {canApprove && offer.status === 'pending_review' && (
            <Button size="sm" onClick={() => approveOffer(offer.id)}>
              <Check className="h-4 w-4 mr-1.5" />
              Genehmigen
            </Button>
          )}

          {/* Send */}
          {canSend && offer.status === 'approved' && (
            <Button size="sm" onClick={() => sendOffer(offer.id)}>
              <Send className="h-4 w-4 mr-1.5" />
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
        </div>

        {/* Sharing Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={pdfLoading}>
            <Download className="h-4 w-4 mr-1.5" />
            {pdfLoading ? 'Erstellen...' : 'PDF'}
          </Button>

          {publicUrl && (
            <>
              <Button variant="outline" size="sm" onClick={copyPublicLink}>
                <Copy className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Link kopieren</span>
                <span className="sm:hidden">Link</span>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Landing Page</span>
                  <span className="sm:hidden">Seite</span>
                </a>
              </Button>
            </>
          )}

          {offer.lead && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/leads">
                <User className="h-4 w-4 mr-1.5" />
                Lead
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Sales Guide Wizard */}
      {showGuide && offerJson && (
        <SalesGuideWizard
          offerJson={offerJson}
          onSaveDiscovery={handleSaveDiscovery}
          onSaveNotes={handleSaveGuideNotes}
        />
      )}

      {/* Pain-Point Radar (if discovery data exists) */}
      {offerJson?.discovery_data && !showGuide && (
        <PainPointRadar
          discoveryData={offerJson.discovery_data}
          selectedModules={offerJson.selected_modules}
          offerMode={offerJson.offer_mode}
        />
      )}

      {/* Offer Preview */}
      {offerJson && <OfferPreview content={offerJson} />}

      {/* Progress Tracker for variable offers (staff + admin) */}
      {offerJson?.offer_mode === 'variable' && hasMinRole('vertriebspartner') && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
