import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { useMembershipAccess, DEMO_LESSON_LIMIT } from '@/hooks/useMembershipAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Play,
  CheckSquare,
  FileText,
  HelpCircle,
  Loader2,
  ExternalLink,
  Lock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const LESSON_ICONS = {
  video: Play,
  task: CheckSquare,
  worksheet: FileText,
  quiz: HelpCircle,
};

export function LessonPlayerView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { memberId } = useLearningPaths();
  const { canAccessCourse, canAccessLesson, isLoading: accessLoading } = useMembershipAccess();

  // Fetch lesson
  const lessonQuery = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  // Fetch course structure for navigation + access check
  const courseQuery = useQuery({
    queryKey: ['course-nav', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, modules(*, lessons(*))`)
        .eq('id', courseId!)
        .single();
      if (error) throw error;

      const allLessons = ((data.modules as Record<string, unknown>[]) || [])
        .sort((a, b) => ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0))
        .flatMap((m) =>
          ((m.lessons as Record<string, unknown>[]) || [])
            .sort((a, b) => ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0))
        );

      return { course: data, allLessons };
    },
    enabled: !!courseId,
  });

  // Fetch progress
  const progressQuery = useQuery({
    queryKey: ['lesson-progress', memberId, lessonId],
    queryFn: async () => {
      if (!memberId) return null;
      const { data } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('member_id', memberId)
        .eq('lesson_id', lessonId!)
        .single();
      return data;
    },
    enabled: !!memberId && !!lessonId,
  });

  // Mark complete mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!memberId || !lessonId) throw new Error('Missing data');
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          member_id: memberId,
          lesson_id: lessonId,
          status: 'completed' as const,
          progress_percent: 100,
          completed_at: now,
          last_seen_at: now,
        }, { onConflict: 'member_id,lesson_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Lektion abgeschlossen! 🎉');
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      queryClient.invalidateQueries({ queryKey: ['course-detail'] });
    },
  });

  const lesson = lessonQuery.data;
  const courseData = courseQuery.data?.course;
  const allLessons = courseQuery.data?.allLessons || [];
  const currentIdx = allLessons.findIndex((l: Record<string, unknown>) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const isCompleted = progressQuery.data?.status === 'completed';

  // Access check
  const courseAccess = courseData ? canAccessCourse(courseData) : { hasAccess: true, reason: '' };
  const lessonAccessible = canAccessLesson(currentIdx >= 0 ? currentIdx : 0, courseAccess);

  if (lessonQuery.isLoading || accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-semibold">Lektion nicht gefunden</h2>
        <Button variant="outline" onClick={() => navigate(`/app/academy/course/${courseId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Zurück zum Kurs
        </Button>
      </div>
    );
  }

  // Paywall gate
  if (!lessonAccessible) {
    return <PaywallGate courseId={courseId!} reason={courseAccess.reason} />;
  }

  const Icon = LESSON_ICONS[lesson.lesson_type as keyof typeof LESSON_ICONS] || Play;
  const meta = (lesson.meta || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/app/academy/course/${courseId}`)}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Kursübersicht
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {currentIdx >= 0 && (
            <span>{currentIdx + 1} / {allLessons.length}</span>
          )}
        </div>
      </div>

      {/* Demo Banner */}
      {!courseAccess.hasAccess && lessonAccessible && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-3 flex items-center gap-3 text-sm">
            <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span className="text-amber-700 dark:text-amber-400">
              Demo-Lektion – <button onClick={() => navigate('/app/contracts')} className="underline font-medium hover:text-amber-900">Jetzt freischalten</button> für vollen Zugang.
            </span>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card className="overflow-hidden">
        {/* Video */}
        {lesson.lesson_type === 'video' && lesson.content_ref && (
          <div className="aspect-video bg-foreground/5 flex items-center justify-center">
            {lesson.content_ref.includes('youtube') || lesson.content_ref.includes('vimeo') ? (
              <iframe
                src={lesson.content_ref}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="text-center space-y-3">
                <Play className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground">Video wird geladen...</p>
              </div>
            )}
          </div>
        )}

        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{lesson.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {lesson.lesson_type === 'video' ? 'Video' :
                   lesson.lesson_type === 'task' ? 'Aufgabe' :
                   lesson.lesson_type === 'worksheet' ? 'Arbeitsblatt' : 'Quiz'}
                </Badge>
                {lesson.duration_seconds && (
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(lesson.duration_seconds / 60)} Min.
                  </span>
                )}
                {isCompleted && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Abgeschlossen
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {lesson.description && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>
          )}

          {meta.content_html && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:text-foreground prose-h2:text-lg prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-base prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2
                prose-pre:bg-muted prose-pre:text-foreground prose-pre:p-4 prose-pre:rounded-lg prose-pre:text-xs prose-pre:whitespace-pre-wrap prose-pre:border prose-pre:border-border
                prose-ul:space-y-1 prose-ol:space-y-1 prose-li:text-muted-foreground
                prose-p:text-muted-foreground prose-strong:text-foreground
                prose-table:border-collapse prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-border prose-th:text-xs
                prose-td:p-2 prose-td:border prose-td:border-border prose-td:text-xs
                prose-dt:font-semibold prose-dt:text-foreground prose-dd:text-muted-foreground prose-dd:mb-3 prose-dd:ml-4"
              dangerouslySetInnerHTML={{ __html: meta.content_html as string }}
            />
          )}

          {(lesson.lesson_type === 'task' || lesson.lesson_type === 'worksheet') && !meta.content_html && (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-6 text-center space-y-3">
                <Icon className="h-10 w-10 text-primary/50 mx-auto" />
                <p className="text-muted-foreground">
                  {lesson.lesson_type === 'task'
                    ? 'Bearbeite die Aufgabe und markiere sie als abgeschlossen.'
                    : 'Lade das Arbeitsblatt herunter und fülle es aus.'}
                </p>
              </CardContent>
            </Card>
          )}

          {lesson.content_ref && (lesson.lesson_type === 'task' || lesson.lesson_type === 'worksheet') && (
            <Button variant="outline" asChild className="w-full">
              <a href={lesson.content_ref} target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                {lesson.lesson_type === 'task' ? 'Aufgabe öffnen' : 'Arbeitsblatt herunterladen'}
              </a>
            </Button>
          )}

          {memberId && !isCompleted && (
            <Button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="w-full gap-2"
              size="lg"
            >
              {completeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Als abgeschlossen markieren
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Button
            variant="outline"
            onClick={() => navigate(`/app/academy/course/${courseId}/lesson/${(prevLesson as Record<string, unknown>).id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Vorherige Lektion
          </Button>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Button
            onClick={() => {
              const nextIdx = currentIdx + 1;
              const nextAccess = canAccessLesson(nextIdx, courseAccess);
              if (!nextAccess) {
                toast.error('Die nächste Lektion ist gesperrt. Schalte den Kurs frei!');
                return;
              }
              navigate(`/app/academy/course/${courseId}/lesson/${(nextLesson as Record<string, unknown>).id}`);
            }}
            className="gap-2"
          >
            Nächste Lektion
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate(`/app/academy/course/${courseId}`)}
            className="gap-2"
          >
            Zurück zum Kurs
          </Button>
        )}
      </div>
    </div>
  );
}

function PaywallGate({ courseId, reason }: { courseId: string; reason: string }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto py-16 space-y-8 text-center">
      <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 flex items-center justify-center">
        <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-400" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Premium-Inhalt</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {reason || 'Dieser Inhalt ist Teil deines Premium-Zugangs. Schalte ihn jetzt frei, um weiterzulernen.'}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          size="lg"
          onClick={() => navigate('/app/pricing')}
          className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Sparkles className="h-5 w-5" />
          Pakete & Preise ansehen
        </Button>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/contracts')}
            className="gap-1.5 text-muted-foreground"
          >
            Meine Verträge
          </Button>
        </div>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/app/academy/course/${courseId}`)}
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Kurs
          </Button>
        </div>
      </div>
    </div>
  );
}
