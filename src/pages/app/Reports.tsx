import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Analysen und Berichte
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reporting-Dashboard
          </CardTitle>
          <CardDescription>
            Das Reporting wird in Kürze verfügbar sein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bald verfügbare Funktionen:
          </p>
          <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Umsatz- und Pipeline-Berichte</li>
            <li>Team-Performance KPIs</li>
            <li>Lead-Konvertierungsraten</li>
            <li>Kundenaktivitäts-Analyse</li>
            <li>Export-Funktionen</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
