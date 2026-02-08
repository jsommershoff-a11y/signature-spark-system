import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export default function Leads() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Verwalte deine Interessenten und neue Anfragen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Lead-Management
          </CardTitle>
          <CardDescription>
            Das Lead-Management wird in Kürze verfügbar sein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bald verfügbare Funktionen:
          </p>
          <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Lead-Liste mit Filteroptionen</li>
            <li>Zuweisung an Mitarbeiter</li>
            <li>Status-Tracking (Neu, Kontaktiert, Qualifiziert, etc.)</li>
            <li>Notizen und Aktivitäten</li>
            <li>Konvertierung zu Kunden</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
