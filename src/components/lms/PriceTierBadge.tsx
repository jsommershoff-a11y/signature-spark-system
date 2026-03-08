import { Badge } from '@/components/ui/badge';
import { Gift, Zap, Rocket, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CoursePriceTier } from '@/types/lms';
import { PRICE_TIER_CONFIG } from '@/types/lms';

const TIER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Gift, Zap, Rocket, Crown,
};

interface PriceTierBadgeProps {
  tier: CoursePriceTier;
  size?: 'sm' | 'md';
  showPrice?: boolean;
}

export function PriceTierBadge({ tier, size = 'sm', showPrice = false }: PriceTierBadgeProps) {
  const config = PRICE_TIER_CONFIG[tier];
  const Icon = TIER_ICONS[config.icon] || Gift;

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium',
        config.bgColor,
        config.borderColor,
        config.color,
        size === 'md' && 'text-sm px-3 py-1',
      )}
    >
      <Icon className={cn('h-3 w-3', size === 'md' && 'h-4 w-4')} />
      {config.label}
      {showPrice && <span className="ml-1 opacity-75">· {config.price}</span>}
    </Badge>
  );
}
