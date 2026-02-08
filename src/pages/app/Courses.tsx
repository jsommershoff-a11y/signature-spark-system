import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function Courses() {
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
            Der Kursbereich wird in Kürze verfügbar sein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bald verfügbare Funktionen:
          </p>
          <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Kursübersicht mit allen verfügbaren Kursen</li>
            <li>Video-Lektionen</li>
            <li>Fortschritts-Tracking</li>
            <li>Quizze und Übungen</li>
            <li>Zertifikate</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
