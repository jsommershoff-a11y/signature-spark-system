import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity, Mail, Plug, Download, GraduationCap } from 'lucide-react';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminLeadsTable from '@/components/admin/AdminLeadsTable';
import AdminSystemLogs from '@/components/admin/AdminSystemLogs';
import AdminEmailTemplates from '@/components/admin/AdminEmailTemplates';
import AdminIntegrations from '@/components/admin/AdminIntegrations';
import AdminBackupExport from '@/components/admin/AdminBackupExport';
import AdminMembersOverview from '@/components/admin/AdminMembersOverview';

export default function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
        <p className="text-muted-foreground">System-Administration und Benutzerverwaltung</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="users" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Benutzer</TabsTrigger>
          <TabsTrigger value="leads" className="gap-1.5">Leads</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> System-Logs</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> E-Mail-Templates</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5"><Plug className="h-3.5 w-3.5" /> Integrationen</TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Backup & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <AdminUserManagement />
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

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> System-Logs & Audit-Trail</CardTitle>
              <CardDescription>Alle Aktivitäten und Events im System</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSystemLogs />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> E-Mail-Templates</CardTitle>
              <CardDescription>Vorlagen für automatisierte E-Mails verwalten</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminEmailTemplates />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plug className="h-5 w-5" /> Integrationen</CardTitle>
              <CardDescription>Verbundene Dienste und API-Konfiguration</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminIntegrations />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> Backup & Export</CardTitle>
              <CardDescription>Daten als CSV exportieren</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminBackupExport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
