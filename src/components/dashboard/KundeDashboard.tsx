import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, GraduationCap, ArrowRight, Gift, Sparkles, Phone, PlayCircle, Zap } from 'lucide-react';
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
      <TrialStatusWidget />

      {/* Welcome / Progress Widget — Tannengrün Hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #0F3E2E 0%, #1a5c42 60%, #0d3326 100%)',
          boxShadow: '0 8px 32px rgba(15,62,46,0.30)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <ProgressRing
            progress={overallProgress}
            size={96}
            strokeWidth={8}
            className="[&_circle]:stroke-white/20 [&_circle:last-child]:stroke-[#F5712F] shrink-0"
          />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <Zap className="h-4 w-4" style={{ color: '#F5712F' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Dein Lernfortschritt
              </span>
            </div>
            <h2 className="font-bold text-xl text-white">Dein Signature System – Schritt für Schritt aufbauen</h2>
            {totalLessons > 0 ? (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {completedLessons} von {totalLessons} Lektionen abgeschlossen
              </p>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Starte jetzt mit deiner ersten Lektion.</p>
            )}
            {nextLesson && (
              <div className="flex items-center gap-2 mt-2">
                <PlayCircle className="h-4 w-4 shrink-0" style={{ color: '#F5712F' }} />
                <span className="text-sm font-medium truncate text-white">Nächste Lektion: {nextLesson.title}</span>
              </div>
            )}
          </div>
          <Button
            asChild
            className="shrink-0 text-white font-semibold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #F5712F, #e85d1a)', boxShadow: '0 4px 16px rgba(245,113,47,0.4)' }}
          >
            <Link to={nextLesson ? `/app/academy/course/${nextLesson.courseId}/lesson/${nextLesson.lessonId}` : '/app/academy'}>
              {nextLesson ? 'Weiter lernen →' : 'Starte hier →'}
            </Link>
          </Button>
        </div>

        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: '#F5712F', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full opacity-8" style={{ backgroundColor: '#F5712F', filter: 'blur(32px)' }} />
      </div>

      {/* Freebie Banner */}
      {hasNoProduct && (
        <Card
          className="border-0"
          style={{
            background: 'linear-gradient(135deg, rgba(245,113,47,0.08) 0%, rgba(245,113,47,0.04) 100%)',
            border: '1px solid rgba(245,113,47,0.2)',
            boxShadow: '0 2px 12px rgba(245,113,47,0.08)',
          }}
        >
          <CardContent className="flex flex-col sm:flex-row items-center gap-5 py-6 px-5">
            <div className="p-3 rounded-2xl shrink-0" style={{ backgroundColor: 'rgba(245,113,47,0.12)' }}>
              <Gift className="h-8 w-8" style={{ color: '#F5712F' }} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h3 className="font-bold text-base">Dein kostenloses KI-Starter-Paket</h3>
                <Badge className="gap-1 text-xs text-white" style={{ backgroundColor: '#F5712F' }}>
                  <Sparkles className="h-3 w-3" />
                  Gratis
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                5 sofort einsetzbare KI-Prompts + persönliche KI-Bedarfsanalyse.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild className="border-primary/30 hover:border-primary/60">
                <Link to="/app/academy">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Prompts ansehen
                </Link>
              </Button>
              <Button size="sm" asChild className="text-white" style={{ backgroundColor: '#F5712F' }}>
                <Link to="/app/pricing">
                  <Phone className="h-4 w-4 mr-1" />
                  Analyse-Gespräch
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links — farbige Icon-Boxen */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/app/academy">
          <Card
            className="group cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '3px solid #0F3E2E' }}
          >
            <CardContent className="flex items-center gap-4 py-5 px-5">
              <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(15,62,46,0.1)' }}>
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6" style={{ color: '#0F3E2E' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">Mein System</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Lernpfade & Fortschritt</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/contracts">
          <Card
            className="group cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '3px solid #F5712F' }}
          >
            <CardContent className="flex items-center gap-4 py-5 px-5">
              <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgba(245,113,47,0.1)' }}>
                <FileText className="h-5 w-5 md:h-6 md:w-6" style={{ color: '#F5712F' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">Dokumente</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Angebote und Verträge</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* FAQ – Häufige Fragen & nächste Schritte */}
      <MemberFAQ />
    </div>
  );
}
