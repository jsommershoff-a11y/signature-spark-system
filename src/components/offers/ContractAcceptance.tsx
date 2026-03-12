import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SignaturePad } from './SignaturePad';
import { ChevronDown, FileText, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import type { Offer } from '@/types/offers';

interface ContractAcceptanceProps {
  offer: Offer;
  onAccept: (data: {
    signer_name: string;
    signature_data: string;
  }) => Promise<void>;
}

export function ContractAcceptance({ offer, onAccept }: ContractAcceptanceProps) {
  const [signerName, setSignerName] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [withdrawalAccepted, setWithdrawalAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const offerJson = offer.offer_json;
  const canAccept = signerName.trim() && signatureData && agbAccepted && withdrawalAccepted;

  const handleAccept = async () => {
    if (!canAccept || !signatureData) return;
    setIsSubmitting(true);
    try {
      await onAccept({
        signer_name: signerName.trim(),
        signature_data: signatureData,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Angebot annehmen
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Bitte lesen Sie die folgenden Dokumente und bestätigen Sie mit Ihrer Unterschrift.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Description */}
        {offerJson?.service_description && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Leistungsbeschreibung
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-4 bg-muted/30 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-sans">{offerJson.service_description}</pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* AGB */}
        {offerJson?.terms_and_conditions && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Allgemeine Geschäftsbedingungen (AGB)
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-4 bg-muted/30 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-sans">{offerJson.terms_and_conditions}</pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Withdrawal Policy */}
        {offerJson?.withdrawal_policy && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Widerrufsbelehrung
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-4 bg-muted/30 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-sans">{offerJson.withdrawal_policy}</pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agb"
              checked={agbAccepted}
              onCheckedChange={(v) => setAgbAccepted(v === true)}
            />
            <Label htmlFor="agb" className="text-sm leading-tight cursor-pointer">
              Ich habe die{' '}
              <a href="/agb" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
                Allgemeinen Geschäftsbedingungen
              </a>{' '}
              gelesen und akzeptiere diese. *
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="withdrawal"
              checked={withdrawalAccepted}
              onCheckedChange={(v) => setWithdrawalAccepted(v === true)}
            />
            <Label htmlFor="withdrawal" className="text-sm leading-tight cursor-pointer">
              Ich habe die{' '}
              <a href="/widerruf" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
                Widerrufsbelehrung
              </a>{' '}
              zur Kenntnis genommen. *
            </Label>
          </div>
        </div>

        {/* Signer Name */}
        <div className="space-y-2">
          <Label htmlFor="signer_name">Vor- und Nachname *</Label>
          <Input
            id="signer_name"
            placeholder="Max Mustermann"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
          />
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <Label>Ihre Unterschrift *</Label>
          <SignaturePad onSignatureChange={setSignatureData} />
        </div>

        {/* Accept Button */}
        <Button
          onClick={handleAccept}
          disabled={!canAccept || isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Angebot verbindlich annehmen
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Mit dem Klick auf „Angebot verbindlich annehmen" schließen Sie einen Vertrag ab.
        </p>
      </CardContent>
    </Card>
  );
}
