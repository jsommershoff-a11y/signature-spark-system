import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock } from 'lucide-react';
import { Course, PRODUCT_LABELS, PRODUCT_COLORS } from '@/types/members';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const progressPercent = course.progress_percent || 0;
  const totalLessons = course.total_lessons || 0;
  const completedLessons = course.completed_lessons || 0;

  return (
    <Link to={`/app/courses/${course.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        {course.thumbnail_url && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img 
              src={course.thumbnail_url} 
              alt={course.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">{course.name}</h3>
            {course.required_product && (
              <Badge className={PRODUCT_COLORS[course.required_product]} variant="secondary">
                {PRODUCT_LABELS[course.required_product]}
              </Badge>
            )}
          </div>
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{totalLessons} Lektionen</span>
            </div>
            {course.modules && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.modules.length} Module</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fortschritt</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completedLessons} von {totalLessons} Lektionen abgeschlossen
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
