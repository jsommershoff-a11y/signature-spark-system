import { useMember } from '@/hooks/useMember';
import { CourseCard, KPISummary } from '@/components/learning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function Courses() {
  const { courses, kpis, currentKPI, isLoading, member } = useMember();
  const previousKPI = kpis[1]; // Second most recent

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user has member record (is a paying customer)
  if (!member) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kurse</h1>
          <p className="text-muted-foreground">
            Deine Kurse und Lernfortschritt
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Kursbereich
            </CardTitle>
            <CardDescription>
              Der Kursbereich ist für Mitglieder verfügbar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nach Abschluss deiner Buchung erhältst du Zugang zu:
            </p>
            <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Exklusive Video-Kurse</li>
              <li>Interaktive Übungen und Worksheets</li>
              <li>Fortschritts-Tracking</li>
              <li>Persönliche KPI-Übersicht</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
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
