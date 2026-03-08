import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from './ProgressRing';
import { LevelBadge } from './LevelBadge';
import { MessageSquare, Megaphone, TrendingUp, Workflow, BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningPath } from '@/types/lms';
import { TOPIC_COLORS } from '@/types/lms';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Megaphone,
  TrendingUp,
  Workflow,
  BookOpen,
};

interface LearningPathCardProps {
  path: LearningPath;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  const Icon = ICON_MAP[path.icon] || BookOpen;
  const gradient = TOPIC_COLORS[path.color] || TOPIC_COLORS.orange;
  const courses = path.courses || [];
  const levels = courses.map(c => c.path_level || 'starter');

  return (
    <Link to={`/app/academy/${path.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border/50 hover:border-primary/30 h-full">
        {/* Gradient Header */}
        <div className={cn('h-2 bg-gradient-to-r', gradient)} />

        <CardContent className="p-5 space-y-4">
          {/* Icon + Title */}
          <div className="flex items-start gap-4">
            <div className={cn(
              'p-3 rounded-xl bg-gradient-to-br shadow-sm',
              gradient,
              'text-white'
            )}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {path.name}
              </h3>
              {path.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {path.description}
                </p>
              )}
            </div>
          </div>

          {/* Level Badges */}
          <div className="flex flex-wrap gap-1.5">
            {(['starter', 'fortgeschritten', 'experte'] as const).map(level => {
              const hasLevel = levels.includes(level);
              return (
                <LevelBadge
                  key={level}
                  level={level}
                  size="sm"
                  showLabel
                />
              );
            })}
          </div>

          {/* Stats + Progress */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{courses.length} Kurse</span>
              <span>
                {courses.reduce((s, c) => s + (c.total_lessons || 0), 0)} Lektionen
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ProgressRing progress={path.progress_percent || 0} size={40} strokeWidth={4} showLabel={false} />
              <span className="text-sm font-semibold">{path.progress_percent || 0}%</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Lernpfad öffnen</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
