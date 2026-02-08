import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Play, 
  CheckSquare, 
  FileText, 
  HelpCircle,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';
import { Lesson, LessonProgress, LESSON_TYPE_LABELS, ProgressStatus } from '@/types/members';
import { Link } from 'react-router-dom';

interface LessonCardProps {
  lesson: Lesson;
  courseId: string;
  progress?: LessonProgress;
}

const LESSON_TYPE_ICONS = {
  video: Play,
  task: CheckSquare,
  worksheet: FileText,
  quiz: HelpCircle,
};

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  return `${mins} Min.`;
}

function getStatusIcon(status?: ProgressStatus) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'in_progress':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
}

export function LessonCard({ lesson, courseId, progress }: LessonCardProps) {
  const Icon = LESSON_TYPE_ICONS[lesson.lesson_type];
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';

  return (
    <Link 
      to={`/app/courses/${courseId}/lessons/${lesson.id}`}
      className="block"
    >
      <div 
        className={cn(
          "flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-accent/50",
          isCompleted && "bg-green-50 border-green-200",
          isInProgress && "bg-yellow-50 border-yellow-200"
        )}
      >
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {getStatusIcon(progress?.status)}
        </div>

        {/* Lesson Type Icon */}
        <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium truncate",
            isCompleted && "text-green-700"
          )}>
            {lesson.name}
          </h4>
          {lesson.description && (
            <p className="text-sm text-muted-foreground truncate">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="secondary" className="text-xs">
            {LESSON_TYPE_LABELS[lesson.lesson_type]}
          </Badge>
          {lesson.duration_seconds && (
            <span className="text-sm text-muted-foreground">
              {formatDuration(lesson.duration_seconds)}
            </span>
          )}
        </div>

        {/* Progress Percent */}
        {isInProgress && progress?.progress_percent !== undefined && (
          <div className="flex-shrink-0 text-sm font-medium text-yellow-700">
            {progress.progress_percent}%
          </div>
        )}
      </div>
    </Link>
  );
}
