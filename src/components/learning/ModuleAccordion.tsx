import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { Module, LessonProgress } from '@/types/members';
import { LessonCard } from './LessonCard';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ModuleAccordionProps {
  module: Module;
  courseId: string;
  progressMap: Map<string, LessonProgress>;
  defaultOpen?: boolean;
}

export function ModuleAccordion({ 
  module, 
  courseId, 
  progressMap,
  defaultOpen = false 
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const lessons = module.lessons || [];
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(
    (l) => progressMap.get(l.id)?.status === 'completed'
  ).length;
  const progressPercent = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-shrink-0 p-2 bg-background rounded-lg">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{module.name}</h3>
          {module.description && (
            <p className="text-sm text-muted-foreground truncate">
              {module.description}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {completedLessons}/{totalLessons} Lektionen
          </div>
          <div className="w-24">
            <Progress value={progressPercent} className="h-2" />
          </div>
          <div className="text-sm font-medium w-12 text-right">
            {progressPercent}%
          </div>
        </div>
      </button>

      {/* Content */}
      <div
        className={cn(
          "transition-all duration-200",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="p-4 space-y-2 bg-background">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              progress={progressMap.get(lesson.id)}
            />
          ))}
          {lessons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Lektionen in diesem Modul.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
