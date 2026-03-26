import { useState } from 'react';
import { useOffers } from '@/hooks/useOffers';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { OfferApprovalCard, CreateOfferDialog } from '@/components/offers';
import { Plus, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { OfferStatus } from '@/types/offers';

export default function Offers() {
  const { offers, isLoading, approveOffer, sendOffer } = useOffers();
  const { hasMinRole } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OfferStatus | 'all'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const canApprove = hasMinRole('gruppenbetreuer');
  const canSend = hasMinRole('vertriebspartner');

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      !searchTerm ||
      offer.lead?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.lead?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.lead?.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusTabs: Array<{ value: OfferStatus | 'all'; label: string; count: number }> = [
    { value: 'all', label: 'Alle', count: offers.length },
    { value: 'draft', label: 'Entwürfe', count: offers.filter((o) => o.status === 'draft').length },
    {
      value: 'pending_review',
      label: 'In Prüfung',
      count: offers.filter((o) => o.status === 'pending_review').length,
    },
    { value: 'approved', label: 'Genehmigt', count: offers.filter((o) => o.status === 'approved').length },
    { value: 'sent', label: 'Gesendet', count: offers.filter((o) => o.status === 'sent').length },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Angebote</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Angebote und verfolgen Sie den Status.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Angebot
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Name oder Firma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-background/20 px-1.5 py-0.5 rounded text-xs">
                {tab.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Offers Grid */}
      {filteredOffers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Angebote gefunden</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {searchTerm || statusFilter !== 'all'
                ? 'Versuchen Sie andere Suchkriterien.'
                : 'Erstellen Sie Ihr erstes Angebot aus einem Lead heraus.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <OfferApprovalCard
              key={offer.id}
              offer={offer}
              canApprove={canApprove}
              canSend={canSend}
              onApprove={() => approveOffer(offer.id)}
              onSend={() => sendOffer(offer.id)}
              onView={() => navigate(`/app/offers/${offer.id}`)}
            />
          ))}
        </div>
      )}

      <CreateOfferDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
