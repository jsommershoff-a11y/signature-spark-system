import { useMember } from '@/hooks/useMember';
import { CourseCard, KPISummary } from '@/components/learning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Loader2, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Course } from '@/types/members';

const MAX_DEMO_LESSONS = 2;

function DemoCoursesView({ courses }: { courses: Course[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kurse</h1>
        <p className="text-muted-foreground">
          Entdecken Sie unsere Kurse – schalten Sie den vollen Zugang frei.
        </p>
      </div>

      {/* CTA Banner */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Demo-Zugang aktiv</p>
              <p className="text-sm text-muted-foreground">
                Schalten Sie den vollen Kursbereich frei, um alle Lektionen zu nutzen.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/app/contracts">Jetzt freischalten</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Demo Courses */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Keine Kurse verfügbar</h3>
            <p className="text-muted-foreground">
              Neue Kurse werden in Kürze hinzugefügt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <DemoCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function DemoCourseCard({ course }: { course: Course }) {
  const lessons = course.modules?.flatMap(m => m.lessons || []) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{course.name}</CardTitle>
            {course.description && (
              <CardDescription className="mt-1">{course.description}</CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            {lessons.length} Lektionen
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lessons.map((lesson, index) => {
            const isDemo = index < MAX_DEMO_LESSONS;
            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isDemo ? 'bg-background' : 'bg-muted/30 opacity-60'
                }`}
              >
                {isDemo ? (
                  <Badge variant="outline" className="text-xs border-primary/50 text-primary shrink-0">
                    Demo
                  </Badge>
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={`text-sm ${isDemo ? 'font-medium' : 'text-muted-foreground'}`}>
                  {lesson.name}
                </span>
                {!isDemo && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Nach Freischaltung verfügbar
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Courses() {
  const { courses, kpis, currentKPI, isLoading, member, isDemoUser } = useMember();
  const previousKPI = kpis[1];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Demo mode for logged-in users without membership
  if (!member || isDemoUser) {
    return <DemoCoursesView courses={courses} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deine Kurse</h1>
        <p className="text-muted-foreground">
          Lerne in deinem eigenen Tempo und verfolge deinen Fortschritt
        </p>
      </div>

      {/* KPI Summary */}
      <KPISummary currentKPI={currentKPI} previousKPI={previousKPI} />

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Keine Kurse verfügbar</h3>
            <p className="text-muted-foreground">
              Neue Kurse werden in Kürze hinzugefügt.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
