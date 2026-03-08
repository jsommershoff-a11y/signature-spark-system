import { Sprout, Rocket, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PathLevel } from '@/types/lms';
import { PATH_LEVEL_CONFIG } from '@/types/lms';

interface LevelBadgeProps {
  level: PathLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ICONS = {
  starter: Sprout,
  fortgeschritten: Rocket,
  experte: Crown,
};

export function LevelBadge({ level, size = 'md', showLabel = true }: LevelBadgeProps) {
  const config = PATH_LEVEL_CONFIG[level];
  const Icon = ICONS[level];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        config.bgColor,
        config.color,
        config.borderColor,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSize[size]} />
      {showLabel && config.label}
    </span>
  );
}
