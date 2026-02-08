import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function Customers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kunden</h1>
        <p className="text-muted-foreground">
          Übersicht und Verwaltung aller aktiven Kunden
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kundenverwaltung
          </CardTitle>
          <CardDescription>
            Die Kundenverwaltung wird in Kürze verfügbar sein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bald verfügbare Funktionen:
          </p>
          <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Kundenliste mit Suchfunktion</li>
            <li>Kundenprofile mit Aktivitäts-Historie</li>
            <li>Vertragsübersicht</li>
            <li>Zugewiesene Mitarbeiter</li>
            <li>Dokumente und Dateien</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
