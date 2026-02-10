import { cn } from '@/lib/utils';
import { Zap, Rocket, Check } from 'lucide-react';
import type { OfferMode } from '@/types/offers';
import { PROGRAM_MIN_PRICES } from '@/lib/offer-modules';

interface ProgramThumbnailProps {
  mode: OfferMode;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const CONFIG: Record<OfferMode, {
  label: string;
  icon: React.ReactNode;
  subtitle: string;
  features: string[];
  gradient: string;
  border: string;
  iconBg: string;
}> = {
  performance: {
    label: 'Performance',
    icon: <Zap className="h-8 w-8" />,
    subtitle: 'Strukturierter Systemaufbau',
    features: [
      'Vertriebsstruktur + Skripte',
      'CRM-Setup + Automationen',
      'Follow-up-Prozesslogik',
      'KPI-Dashboard',
    ],
    gradient: 'from-blue-600/10 to-indigo-600/10',
    border: 'border-blue-500',
    iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  },
  rocket_performance: {
    label: 'Rocket Performance',
    icon: <Rocket className="h-8 w-8" />,
    subtitle: 'Premium-Betreuung & vollständiger Aufbau',
    features: [
      'Tiefenanalyse + Strukturplan',
      'Vollständiges CRM + KI-Integration',
      'Individuelle Trainings',
      'Dedizierter Ansprechpartner',
    ],
    gradient: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500',
    iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  },
};

export function ProgramThumbnail({ mode, selected, onSelect, disabled }: ProgramThumbnailProps) {
  const config = CONFIG[mode];
  const minPriceEuro = PROGRAM_MIN_PRICES[mode] / 100;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative flex flex-col p-5 rounded-xl border-2 text-left transition-all duration-200 w-full',
        'hover:shadow-md',
        selected
          ? `${config.border} bg-gradient-to-br ${config.gradient} shadow-sm`
          : 'border-border bg-card hover:border-muted-foreground/30',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-3 right-3">
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Icon */}
      <div className={cn('h-14 w-14 rounded-xl flex items-center justify-center mb-3', config.iconBg)}>
        {config.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold mb-1">{config.label}</h3>
      <p className="text-sm text-muted-foreground mb-3">{config.subtitle}</p>

      {/* Price */}
      <p className="text-sm font-semibold mb-3">
        Ab {minPriceEuro.toLocaleString('de-DE')} € netto
      </p>

      {/* Features */}
      <ul className="space-y-1.5">
        {config.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Check className="h-3 w-3 mt-0.5 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}
