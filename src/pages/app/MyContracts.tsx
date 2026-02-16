import { useMyContracts } from '@/hooks/useMyContracts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge';
import { formatCents, OFFER_MODE_LABELS } from '@/types/offers';
import { FileText, Lock, CheckCircle2, CreditCard, Clock, Eye } from 'lucide-react';

export default function MyContracts() {
  const { data: contracts, isLoading, error } = useMyContracts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Verträge</h1>
          <p className="text-muted-foreground">Ihre Angebote und Verträge</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meine Verträge</h1>
        <p className="text-muted-foreground">
          Ihre Angebote, Verträge und Freischaltungen
        </p>
      </div>

      {(!contracts || contracts.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Verträge vorhanden</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Sobald Ihnen ein Angebot zugesendet wird, erscheint es hier.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contracts.map(contract => {
            const mode = contract.offer_json?.offer_mode;
            const isPaid = contract.status === 'paid';
            const isAccepted = contract.status === 'accepted';

            return (
              <Card key={contract.id} className="relative overflow-hidden">
                {isPaid && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {contract.offer_json?.title || 'Angebot'}
                      </CardTitle>
                      {mode && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {OFFER_MODE_LABELS[mode]}
                        </Badge>
                      )}
                    </div>
                    <OfferStatusBadge status={contract.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Gesamtbetrag</span>
                    <span className="font-semibold">
                      {formatCents(contract.offer_json?.total_cents || 0)}
                    </span>
                  </div>

                  {/* Status info */}
                  <div className="flex items-center gap-2 text-sm">
                    {isPaid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Freigeschaltet</span>
                      </>
                    ) : isAccepted ? (
                      <>
                        <CreditCard className="h-4 w-4 text-amber-600" />
                        <span className="text-amber-600">Vertrag angenommen – Zahlung ausstehend</span>
                      </>
                    ) : contract.payment_unlocked ? (
                      <>
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span>Zahlung freigeschaltet</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Noch nicht freigeschaltet</span>
                      </>
                    )}
                  </div>

                  {/* Variable Offer Progress */}
                  {mode === 'variable' && contract.offer_json?.variable_offer_data && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Fortschritt</span>
                        <span className="font-medium">{contract.offer_json.variable_offer_data.progress_percent}%</span>
                      </div>
                      <Progress value={contract.offer_json.variable_offer_data.progress_percent} className="h-2" />
                      {/* Published updates */}
                      {contract.offer_json.variable_offer_data.progress_updates
                        ?.filter(u => u.published)
                        .map((u, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs border-l-2 border-primary/30 pl-3 py-1">
                            <Clock className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                            <div>
                              <p>{u.text}</p>
                              <p className="text-muted-foreground">{new Date(u.date).toLocaleDateString('de-DE')}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    Erstellt am {new Date(contract.created_at).toLocaleDateString('de-DE')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
