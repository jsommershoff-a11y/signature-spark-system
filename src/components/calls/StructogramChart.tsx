import { cn } from '@/lib/utils';
import { STRUCTOGRAM_COLORS, STRUCTOGRAM_DESCRIPTIONS } from '@/types/calls';

interface StructogramChartProps {
  primaryColor: 'red' | 'green' | 'blue';
  secondaryColor?: 'red' | 'green' | 'blue';
  confidence: number;
  indicators?: {
    red_traits: string[];
    green_traits: string[];
    blue_traits: string[];
  };
  tips?: string[];
}

export function StructogramChart({
  primaryColor,
  secondaryColor,
  confidence,
  indicators,
  tips,
}: StructogramChartProps) {
  const colors = ['red', 'green', 'blue'] as const;
  
  // Calculate percentages based on traits
  const getPercentage = (color: 'red' | 'green' | 'blue') => {
    if (!indicators) {
      if (color === primaryColor) return 60;
      if (color === secondaryColor) return 30;
      return 10;
    }
    
    const totalTraits = 
      indicators.red_traits.length + 
      indicators.green_traits.length + 
      indicators.blue_traits.length;
    
    if (totalTraits === 0) {
      if (color === primaryColor) return 60;
      if (color === secondaryColor) return 30;
      return 10;
    }
    
    const traitCount = color === 'red' 
      ? indicators.red_traits.length 
      : color === 'green' 
        ? indicators.green_traits.length 
        : indicators.blue_traits.length;
    
    return Math.round((traitCount / totalTraits) * 100);
  };

  const colorLabels = {
    red: 'Rot',
    green: 'Grün',
    blue: 'Blau',
  };

  return (
    <div className="space-y-4">
      {/* Color bars */}
      <div className="space-y-3">
        {colors.map((color) => {
          const percentage = getPercentage(color);
          const isPrimary = color === primaryColor;
          const isSecondary = color === secondaryColor;
          
          return (
            <div key={color} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={cn(
                  'font-medium',
                  isPrimary && 'font-bold'
                )}>
                  {colorLabels[color]}
                  {isPrimary && ' (Primär)'}
                  {isSecondary && ' (Sekundär)'}
                </span>
                <span className="text-muted-foreground">{percentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: STRUCTOGRAM_COLORS[color],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Description */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm font-medium mb-1">Charakteristik:</p>
        <p className="text-sm text-muted-foreground">
          {STRUCTOGRAM_DESCRIPTIONS[primaryColor]}
        </p>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Konfidenz:</span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="font-medium">{confidence}%</span>
      </div>

      {/* Traits */}
      {indicators && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Erkannte Merkmale:</p>
          <div className="flex flex-wrap gap-1">
            {indicators.red_traits.map((trait, i) => (
              <span
                key={`red-${i}`}
                className="px-2 py-0.5 text-xs rounded-full"
                style={{ backgroundColor: `${STRUCTOGRAM_COLORS.red}20`, color: STRUCTOGRAM_COLORS.red }}
              >
                {trait}
              </span>
            ))}
            {indicators.green_traits.map((trait, i) => (
              <span
                key={`green-${i}`}
                className="px-2 py-0.5 text-xs rounded-full"
                style={{ backgroundColor: `${STRUCTOGRAM_COLORS.green}20`, color: STRUCTOGRAM_COLORS.green }}
              >
                {trait}
              </span>
            ))}
            {indicators.blue_traits.map((trait, i) => (
              <span
                key={`blue-${i}`}
                className="px-2 py-0.5 text-xs rounded-full"
                style={{ backgroundColor: `${STRUCTOGRAM_COLORS.blue}20`, color: STRUCTOGRAM_COLORS.blue }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Communication tips */}
      {tips && tips.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Kommunikationstipps:</p>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
