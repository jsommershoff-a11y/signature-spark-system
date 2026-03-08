import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLearningPaths } from '@/hooks/useLearningPaths';
import { LevelBadge } from './LevelBadge';
import { ProgressRing } from './ProgressRing';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BookOpen,
  Play,
  CheckSquare,
  FileText,
  HelpCircle,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { LearningModule, LearningLesson, PathLevel, CoursePriceTier } from '@/types/lms';
import { PriceTierBadge } from './PriceTierBadge';

const LESSON_ICONS = {
  video: Play,
  task: CheckSquare,
  worksheet: FileText,
  quiz: HelpCircle,
};

const LESSON_LABELS = {
  video: 'Video',
  task: 'Aufgabe',
  worksheet: 'Arbeitsblatt',
  quiz: 'Quiz',
};

export function CourseDetailView() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { paths, memberId, isLoading: pathsLoading } = useLearningPaths();

  // Find the course in paths data
  const allCourses = paths.flatMap((p) => p.courses || []);
  const course = allCourses.find((c) => c.id === courseId);

  // Fallback: fetch directly if not in paths
  const directQuery = useQuery({
    queryKey: ['course-detail', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, modules(*, lessons(*))`)
        .eq('id', courseId!)
        .single();
      if (error) throw error;

      // Get progress
      let progressMap = new Map<string, { status: string; progress_percent: number }>();
      if (memberId) {
        const { data: prog } = await supabase
          .from('lesson_progress')
          .select('lesson_id, status, progress_percent')
          .eq('member_id', memberId);
        (prog || []).forEach((p: { lesson_id: string; status: string; progress_percent: number }) => {
          progressMap.set(p.lesson_id, { status: p.status, progress_percent: p.progress_percent });
        });
      }

      const modules = ((data.modules as Record<string, unknown>[]) || [])
        .sort((a, b) => ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0))
        .map((m) => ({
          ...m,
          lessons: ((m.lessons as Record<string, unknown>[]) || [])
            .sort((a, b) => ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0))
            .map((l) => ({
              ...l,
              progress_status: progressMap.get(l.id as string)?.status || 'not_started',
              progress_percent: progressMap.get(l.id as string)?.progress_percent || 0,
            })),
        }));

      const totalLessons = modules.reduce((s, m) => s + (m.lessons?.length || 0), 0);
      const completedLessons = modules.reduce(
        (s, m) => s + (m.lessons?.filter((l: Record<string, unknown>) => l.progress_status === 'completed')?.length || 0), 0
      );

      return {
        ...data,
        modules,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    },
    enabled: !!courseId && !course,
  });

  const courseData = course || directQuery.data;
  const isLoading = pathsLoading || directQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-semibold">Kurs nicht gefunden</h2>
        <Button variant="outline" onClick={() => navigate('/app/academy')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Zurück
        </Button>
      </div>
    );
  }

  const modules = (courseData.modules || []) as LearningModule[];
  const progress = courseData.progress_percent || 0;

  // Find parent path for breadcrumb
  const parentPath = paths.find((p) => (p.courses || []).some((c) => c.id === courseId));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={() => navigate(parentPath ? `/app/academy/${parentPath.id}` : '/app/academy')} className="gap-1.5 h-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          {parentPath ? parentPath.name : 'Academy'}
        </Button>
      </div>

      {/* Course Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl bg-card border">
        <ProgressRing progress={progress} size={80} strokeWidth={6} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {courseData.price_tier && (
              <PriceTierBadge tier={courseData.price_tier as CoursePriceTier} size="sm" showPrice />
            )}
            {courseData.path_level && (
              <LevelBadge level={courseData.path_level as PathLevel} size="sm" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{courseData.name}</h1>
          {courseData.description && (
            <p className="text-muted-foreground mt-2">{courseData.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>{modules.length} Module</span>
            <span>{courseData.total_lessons || 0} Lektionen</span>
            <span>{courseData.completed_lessons || 0} abgeschlossen</span>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {modules.map((module, idx) => (
          <ModuleSection
            key={module.id}
            module={module}
            courseId={courseId!}
            defaultOpen={idx === 0 || (module.lessons || []).some(
              (l) => l.progress_status === 'in_progress'
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleSection({
  module,
  courseId,
  defaultOpen = false,
}: {
  module: LearningModule;
  courseId: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const lessons = module.lessons || [];
  const completedCount = lessons.filter((l) => l.progress_status === 'completed').length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <Card>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors rounded-t-lg"
      >
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{module.name}</h3>
          {module.description && (
            <p className="text-xs text-muted-foreground truncate">{module.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {completedCount}/{lessons.length}
          </span>
          <div className="w-16">
            <Progress value={progressPct} className="h-1.5" />
          </div>
        </div>
      </button>

      {isOpen && (
        <CardContent className="pt-0 pb-3 px-3 space-y-1">
          {lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} courseId={courseId} />
          ))}
          {lessons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Lektionen in diesem Modul.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function LessonRow({ lesson, courseId }: { lesson: LearningLesson; courseId: string }) {
  const Icon = LESSON_ICONS[lesson.lesson_type] || Play;
  const isComplete = lesson.progress_status === 'completed';
  const isInProgress = lesson.progress_status === 'in_progress';

  return (
    <Link to={`/app/academy/course/${courseId}/lesson/${lesson.id}`}>
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent/50',
          isComplete && 'bg-emerald-50/50 dark:bg-emerald-950/10',
          isInProgress && 'bg-amber-50/50 dark:bg-amber-950/10'
        )}
      >
        {/* Status */}
        <div className="flex-shrink-0">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : isInProgress ? (
            <Clock className="h-5 w-5 text-amber-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground/40" />
          )}
        </div>

        {/* Type Icon */}
        <div className="p-1.5 bg-muted rounded-md flex-shrink-0">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className={cn('text-sm font-medium', isComplete && 'text-emerald-700 dark:text-emerald-400')}>
            {lesson.name}
          </span>
        </div>

        {/* Meta */}
        <Badge variant="secondary" className="text-xs flex-shrink-0">
          {LESSON_LABELS[lesson.lesson_type]}
        </Badge>
        {lesson.duration_seconds && (
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {Math.floor(lesson.duration_seconds / 60)} Min.
          </span>
        )}
      </div>
    </Link>
  );
}
