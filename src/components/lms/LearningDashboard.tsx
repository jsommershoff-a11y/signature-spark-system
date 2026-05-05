import { useLearningPaths } from '@/hooks/useLearningPaths';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { LearningPathCard } from './LearningPathCard';
import { ProgressRing } from './ProgressRing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Trophy, Flame, Target, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LockedContent, TierProgressHint } from '@/components/app/LockedContent';
import { TrialInlineNotice } from '@/components/app/TrialInlineNotice';

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
      <TrialInlineNotice />

      {/* Hero Header — Tannengrün Gradient */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #0F3E2E 0%, #1a5c42 60%, #0d3326 100%)',
          boxShadow: '0 8px 32px rgba(15,62,46,0.35)',
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          {/* Progress Ring — white strokes on dark bg */}
          <div className="shrink-0">
            <ProgressRing
              progress={overallProgress}
              size={110}
              strokeWidth={9}
              className="[&_circle]:stroke-white/20 [&_circle:last-child]:stroke-[#F5712F]"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5" style={{ color: '#F5712F' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>
                KI-Automatisierungsberater
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              KI-Academy
            </h1>
            <p className="mt-1 text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Meistere KI-Tools und automatisiere dein Business – Schritt für Schritt.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <StatPill icon={BookOpen} label="Lektionen" value={`${completedLessons}/${totalLessons}`} />
              <StatPill icon={Trophy} label="Abgeschlossen" value={`${paths.filter(p => (p.progress_percent || 0) >= 100).length}/${paths.length} Pfade`} />
              {streak > 0 && <StatPill icon={Flame} label="Streak" value={`${streak} Tage`} />}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: '#F5712F', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-10" style={{ backgroundColor: '#F5712F', filter: 'blur(32px)' }} />
        <div className="absolute top-0 right-0 w-full h-full opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #ffffff 0%, transparent 50%)' }} />
      </div>

      {/* Tier Progress */}
      <TierProgressHint currentTier={tierName === 'basic' ? 'basic' : tierName === 'starter' ? 'starter' : 'none'} />

      {/* Learning Paths Grid */}
      {paths.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Lernpfade
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
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
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Weitere Kurse
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {standaloneCourses.map((course) => (
              <Link key={course.id} to={`/app/academy/course/${course.id}`}>
                <Card
                  className="cursor-pointer h-full group transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    borderTop: '3px solid #F5712F',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: 'rgba(245,113,47,0.1)' }}>
                        <BookOpen className="h-4 w-4" style={{ color: '#F5712F' }} />
                      </div>
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                        {course.name}
                      </h3>
                    </div>
                    {course.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-1">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{course.total_lessons || 0} Lektionen</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
    <div
      className="flex items-center gap-2 rounded-full px-3 py-1.5"
      style={{
        backgroundColor: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Icon className="h-3.5 w-3.5" style={{ color: '#F5712F' }} />
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
