import { useLearningPaths } from '@/hooks/useLearningPaths';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { LearningPathCard } from './LearningPathCard';
import { ProgressRing } from './ProgressRing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Trophy, Flame, Target, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LockedContent, TierProgressHint } from '@/components/app/LockedContent';

export function LearningDashboard() {
  const {
    paths,
    standaloneCourses,
    isLoading,
    totalLessons,
    completedLessons,
    overallProgress,
  } = useLearningPaths();
  const { tierName, hasMinTier } = useMembershipAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate streak (mock for now)
  const streak = completedLessons > 0 ? Math.min(completedLessons, 7) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground/5 via-primary/5 to-primary/10 border border-border/50 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <ProgressRing progress={overallProgress} size={100} strokeWidth={8} />
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              KI-Academy
            </h1>
            <p className="text-muted-foreground mt-1 text-base">
              Meistere KI-Tools und automatisiere dein Business – Schritt für Schritt.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <StatPill icon={BookOpen} label="Lektionen" value={`${completedLessons}/${totalLessons}`} />
              <StatPill icon={Trophy} label="Abgeschlossen" value={`${paths.filter(p => (p.progress_percent || 0) >= 100).length}/${paths.length} Pfade`} />
              {streak > 0 && <StatPill icon={Flame} label="Streak" value={`${streak} Tage`} />}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
      </div>

      {/* Learning Paths Grid */}
      {paths.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Lernpfade
              </h2>
              <p className="text-sm text-muted-foreground">
                Wähle einen Lernpfad und arbeite dich durch die Levels
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {paths.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        </section>
      )}

      {/* Standalone Courses */}
      {standaloneCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Weitere Kurse
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {standaloneCourses.map((course) => (
              <Link key={course.id} to={`/app/academy/course/${course.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.total_lessons || 0} Lektionen</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {paths.length === 0 && standaloneCourses.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Deine KI-Academy wird vorbereitet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Neue Lernpfade und Kurse werden in Kürze freigeschaltet. 
              Hier lernst du alles über optimale KI-Nutzung für dein Business.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full px-3 py-1.5">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
