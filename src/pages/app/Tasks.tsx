import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export default function Tasks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aufgaben</h1>
        <p className="text-muted-foreground">
          Deine anstehenden und erledigten Aufgaben
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Aufgabenverwaltung
          </CardTitle>
          <CardDescription>
            Die Aufgabenverwaltung wird in Kürze verfügbar sein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bald verfügbare Funktionen:
          </p>
          <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Aufgabenliste mit Priorisierung</li>
            <li>Fälligkeitsdaten und Erinnerungen</li>
            <li>Verknüpfung mit Leads/Kunden</li>
            <li>Team-Zuweisung</li>
            <li>Wiederkehrende Aufgaben</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
