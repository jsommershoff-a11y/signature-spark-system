import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, GraduationCap, ArrowRight, Gift, Sparkles, Phone, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { ProgressRing } from '@/components/lms/ProgressRing';
import { MemberFAQ } from '@/components/dashboard/MemberFAQ';
import { TrialStatusWidget } from '@/components/dashboard/TrialStatusWidget';

export function KundeDashboard() {
  const { products, isLoading: accessLoading } = useMembershipAccess();
  const { standaloneCourses, overallProgress, totalLessons, completedLessons, isLoading: lmsLoading } = useLearningPaths();
  const hasNoProduct = !accessLoading && products.length === 0;
  const isLoading = accessLoading || lmsLoading;

  // Find the next incomplete lesson across standalone courses
  const nextLesson = (() => {
    for (const course of standaloneCourses) {
      const modules = (course as any).modules || [];
      for (const mod of modules) {
        const lessons = mod.lessons || [];
        for (const lesson of lessons) {
          const status = (lesson as any).progress_status || 'not_started';
          if (status !== 'completed') {
            return {
              title: lesson.name as string,
              courseId: course.id as string,
              lessonId: lesson.id as string,
            };
          }
        }
      }
    }
    return null;
  })();

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Welcome / Progress Widget */}
      <Card className="border-border/40 bg-gradient-to-br from-muted/20 via-background to-muted/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-8 px-7">
          <ProgressRing progress={overallProgress} size={90} strokeWidth={7} />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="font-bold text-xl">Dein Signature System – Schritt für Schritt aufbauen</h2>
            {totalLessons > 0 ? (
              <p className="text-sm text-muted-foreground">
                {completedLessons} von {totalLessons} Lektionen abgeschlossen
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Starte jetzt mit deiner ersten Lektion.</p>
            )}
            {nextLesson && (
              <div className="flex items-center gap-2 mt-2">
                <PlayCircle className="h-4 w-4 text-success shrink-0" />
                <span className="text-sm font-medium truncate">Nächste Lektion: {nextLesson.title}</span>
              </div>
            )}
          </div>
          <Button asChild className="shrink-0 shadow-[0_0_16px_rgba(246,113,31,0.15)]">
            <Link to={nextLesson ? `/app/academy/course/${nextLesson.courseId}/lesson/${nextLesson.lessonId}` : '/app/academy'}>
              {nextLesson ? 'Weiter lernen →' : 'Starte hier →'}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Freebie Banner */}
      {hasNoProduct && (
        <Card className="border-border/40 bg-gradient-to-r from-muted/20 to-muted/30">
          <CardContent className="flex flex-col sm:flex-row items-center gap-5 py-6 px-5">
            <div className="p-3 rounded-2xl bg-muted shrink-0">
              <Gift className="h-8 w-8 text-foreground" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h3 className="font-bold text-base">Dein kostenloses KI-Starter-Paket</h3>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Gratis
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                5 sofort einsetzbare KI-Prompts + persönliche KI-Bedarfsanalyse.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link to="/app/academy">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Prompts ansehen
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/app/pricing">
                  <Phone className="h-4 w-4 mr-1" />
                  Analyse-Gespräch
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-px transition-all duration-300">
          <CardContent className="flex items-center gap-4 py-5 px-5">
            <div className="p-3 rounded-xl bg-muted flex-shrink-0">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base">Mein System</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Lernpfade & Fortschritt</p>
            </div>
            <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
              <Link to="/app/academy"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-px transition-all duration-300">
          <CardContent className="flex items-center gap-4 py-5 px-5">
            <div className="p-3 rounded-xl bg-muted flex-shrink-0">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm md:text-base">Dokumente</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Angebote und Verträge</p>
            </div>
            <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
              <Link to="/app/contracts"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ – Häufige Fragen & nächste Schritte */}
      <MemberFAQ />
    </div>
  );
}
