import { Badge } from '@/components/ui/badge';
import type { OfferStatus } from '@/types/offers';
import { OFFER_STATUS_LABELS } from '@/types/offers';

interface OfferStatusBadgeProps {
  status: OfferStatus;
}

export function OfferStatusBadge({ status }: OfferStatusBadgeProps) {
  const colorMap: Record<OfferStatus, string> = {
    draft: 'bg-muted text-muted-foreground',
    pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    sent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    viewed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <Badge className={colorMap[status]}>
      {OFFER_STATUS_LABELS[status]}
    </Badge>
  );
}
