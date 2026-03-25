import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Activity, Mail, Plug, Download, GraduationCap, Gauge, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
          <TabsTrigger value="coo" className="gap-1.5"><Gauge className="h-3.5 w-3.5" /> COO Cockpit</TabsTrigger>
          <TabsTrigger value="leads" className="gap-1.5">Leads</TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Mitgliederbereich</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> System-Logs</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> E-Mail-Templates</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5"><Plug className="h-3.5 w-3.5" /> Integrationen</TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Backup & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="coo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> COO Cockpit</CardTitle>
              <CardDescription>Finanz-, Sync- und Performance-Übersicht — sevDesk-Daten aus Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/app/coo-cockpit')} className="gap-2">
                <ExternalLink className="h-4 w-4" /> COO Cockpit öffnen
              </Button>
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

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Mitgliederbereich</CardTitle>
              <CardDescription>Mitglieder, Lernpfade, Kurse und Inhalte verwalten</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminMembersOverview />
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
