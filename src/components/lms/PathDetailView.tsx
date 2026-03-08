import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { LevelBadge } from './LevelBadge';
import { ProgressRing } from './ProgressRing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  BookOpen,
  Lock,
  CheckCircle2,
  Play,
  ChevronRight,
  Loader2,
  MessageSquare,
  Megaphone,
  TrendingUp,
  Workflow,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearningCourse, PathLevel } from '@/types/lms';
import { PATH_LEVEL_CONFIG, TOPIC_COLORS } from '@/types/lms';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Megaphone,
  TrendingUp,
  Workflow,
  BookOpen,
};

export function PathDetailView() {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const { paths, isLoading } = useLearningPaths();

  const path = paths.find((p) => p.id === pathId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-semibold">Lernpfad nicht gefunden</h2>
        <Button variant="outline" onClick={() => navigate('/app/academy')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Zurück zur Academy
        </Button>
      </div>
    );
  }

  const Icon = ICON_MAP[path.icon] || BookOpen;
  const gradient = TOPIC_COLORS[path.color] || TOPIC_COLORS.orange;
  const courses = path.courses || [];

  // Group courses by level
  const byLevel = (['starter', 'fortgeschritten', 'experte'] as PathLevel[]).map((level) => ({
    level,
    config: PATH_LEVEL_CONFIG[level],
    courses: courses.filter((c) => (c.path_level || 'starter') === level),
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/app/academy')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Academy
      </Button>

      {/* Path Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 p-6 md:p-8">
        <div className={cn('absolute inset-0 opacity-5 bg-gradient-to-br', gradient)} />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className={cn(
            'p-4 rounded-2xl bg-gradient-to-br shadow-lg text-white',
            gradient,
          )}>
            <Icon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{path.name}</h1>
            {path.description && (
              <p className="text-muted-foreground mt-2 text-base max-w-xl">
                {path.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary">
                {courses.length} Kurse
              </Badge>
              <Badge variant="secondary">
                {courses.reduce((s, c) => s + (c.total_lessons || 0), 0)} Lektionen
              </Badge>
            </div>
          </div>
          <ProgressRing progress={path.progress_percent || 0} size={90} strokeWidth={7} />
        </div>
      </div>

      {/* Level Sections */}
      <div className="space-y-6">
        {byLevel.map(({ level, config, courses: levelCourses }, levelIdx) => {
          const prevLevelComplete = levelIdx === 0 ||
            byLevel[levelIdx - 1].courses.every((c) => (c.progress_percent || 0) >= 80);

          return (
            <section key={level} className="space-y-3">
              {/* Level Header */}
              <div className="flex items-center gap-3">
                <LevelBadge level={level} size="md" />
                <span className="text-sm text-muted-foreground">{config.sublabel}</span>
                {!prevLevelComplete && levelIdx > 0 && (
                  <Badge variant="outline" className="ml-auto gap-1 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Schließe vorheriges Level ab
                  </Badge>
                )}
              </div>

              {/* Course Cards */}
              {levelCourses.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Kurse für dieses Level werden bald hinzugefügt.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {levelCourses.map((course) => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      isLocked={course.is_locked || false}
                      gradient={gradient}
                    />
                  ))}
                </div>
              )}

              {/* Connector line between levels */}
              {levelIdx < byLevel.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="w-px h-8 bg-border" />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CourseRow({
  course,
  isLocked,
  gradient,
}: {
  course: LearningCourse;
  isLocked: boolean;
  gradient: string;
}) {
  const progress = course.progress_percent || 0;
  const isComplete = progress >= 100;

  const content = (
    <Card
      className={cn(
        'transition-all duration-200 overflow-hidden',
        isLocked
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md cursor-pointer hover:border-primary/30'
      )}
    >
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {isLocked ? (
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
            ) : isComplete ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            ) : (
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white', gradient)}>
                <Play className="h-5 w-5" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{course.name}</h3>
            {course.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {course.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground">
                {course.completed_lessons || 0}/{course.total_lessons || 0} Lektionen
              </span>
              <div className="flex-1 max-w-32">
                <Progress value={progress} className="h-1.5" />
              </div>
              <span className="text-xs font-medium">{progress}%</span>
            </div>
          </div>

          {/* Arrow */}
          {!isLocked && (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLocked) return content;

  return (
    <Link to={`/app/academy/course/${course.id}`}>
      {content}
    </Link>
  );
}
