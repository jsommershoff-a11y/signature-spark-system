import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export function ScoreGauge({ 
  value, 
  label, 
  size = 'md',
  showPercentage = true 
}: ScoreGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Color based on value
  const getColor = (val: number) => {
    if (val >= 70) return 'hsl(var(--chart-2))'; // Green
    if (val >= 40) return 'hsl(var(--chart-4))'; // Yellow/Orange
    return 'hsl(var(--destructive))'; // Red
  };

  const sizeClasses = {
    sm: { container: 'h-16 w-16', text: 'text-lg', label: 'text-[10px]' },
    md: { container: 'h-24 w-24', text: 'text-2xl', label: 'text-xs' },
    lg: { container: 'h-32 w-32', text: 'text-3xl', label: 'text-sm' },
  };

  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : 56;
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn('relative', sizeClasses[size].container)}>
        <svg className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={getColor(clampedValue)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold', sizeClasses[size].text)}>
            {clampedValue}
            {showPercentage && <span className="text-muted-foreground">%</span>}
          </span>
        </div>
      </div>
      <span className={cn('text-muted-foreground font-medium', sizeClasses[size].label)}>
        {label}
      </span>
    </div>
  );
}
