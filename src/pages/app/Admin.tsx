import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Activity, Mail, Plug, Download, GraduationCap, Tags, FileSpreadsheet } from 'lucide-react';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminLeadsTable from '@/components/admin/AdminLeadsTable';
import AdminSystemLogs from '@/components/admin/AdminSystemLogs';
import AdminEmailTemplates from '@/components/admin/AdminEmailTemplates';
import AdminIntegrations from '@/components/admin/AdminIntegrations';
import AdminBackupExport from '@/components/admin/AdminBackupExport';
import AdminMembersOverview from '@/components/admin/AdminMembersOverview';
import AdminSlotClassificationRules from '@/components/admin/AdminSlotClassificationRules';
import AdminDriveSync from '@/components/admin/AdminDriveSync';

export default function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
        <p className="text-muted-foreground">System-Administration und Benutzerverwaltung</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid grid-cols-2 sm:inline-flex sm:flex-wrap h-auto gap-1 w-full sm:w-auto">
          <TabsTrigger value="users" className="gap-1.5"><Shield className="h-3.5 w-3.5" /> Benutzer</TabsTrigger>
          <TabsTrigger value="leads" className="gap-1.5">Leads</TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Mitglieder</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Logs</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> E-Mail</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5"><Plug className="h-3.5 w-3.5" /> Integrationen</TabsTrigger>
          <TabsTrigger value="slot-rules" className="gap-1.5"><Tags className="h-3.5 w-3.5" /> Slot-Regeln</TabsTrigger>
          <TabsTrigger value="drive-sync" className="gap-1.5"><FileSpreadsheet className="h-3.5 w-3.5" /> Drive-Sync</TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5 col-span-2 sm:col-span-1"><Download className="h-3.5 w-3.5" /> Backup</TabsTrigger>
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

        <TabsContent value="slot-rules">
          <AdminSlotClassificationRules />
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
