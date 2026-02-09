import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminLeadsTable from '@/components/admin/AdminLeadsTable';

export default function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
        <p className="text-muted-foreground">System-Administration und Benutzerverwaltung</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <AdminUserManagement />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System-Einstellungen
              </CardTitle>
              <CardDescription>Globale Konfiguration und Einstellungen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Weitere Admin-Funktionen werden in Kürze verfügbar sein:
              </p>
              <ul className="mt-4 list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>System-Logs und Audit-Trail</li>
                <li>E-Mail-Templates verwalten</li>
                <li>Integrationen konfigurieren</li>
                <li>Backup und Export</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Leads-Übersicht</CardTitle>
              <CardDescription>Alle Inbound-Leads mit Qualification-Score</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLeadsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
