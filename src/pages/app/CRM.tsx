import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function CRM() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
        <p className="text-muted-foreground">
          Übersicht über alle Kundenbeziehungen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            CRM-Übersicht
          </CardTitle>
          <CardDescription>
            Das CRM-Modul wird in Kürze verfügbar sein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hier werden Sie bald alle wichtigen Kundenbeziehungen verwalten können:
          </p>
          <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Lead-Pipeline Übersicht</li>
            <li>Kundenübersicht mit Status</li>
            <li>Aktivitäten-Timeline</li>
            <li>Performance-Metriken</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
