import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/PageHeader";
import { Plug, Mail, Tags, Activity, Download, Webhook, ShoppingBag, ShieldAlert } from "lucide-react";
import AdminIntegrations from "@/components/admin/AdminIntegrations";
import AdminEmailTemplates from "@/components/admin/AdminEmailTemplates";
import AdminSlotClassificationRules from "@/components/admin/AdminSlotClassificationRules";
import AdminSystemLogs from "@/components/admin/AdminSystemLogs";
import AdminBackupExport from "@/components/admin/AdminBackupExport";
import AdminCatalog from "@/components/admin/AdminCatalog";
import AdminCrmDialogPolicyCard from "@/components/admin/AdminCrmDialogPolicyCard";
import AdminWebhooks from "../AdminWebhooks";

export default function AdminSettings() {
  return (
    <div>
      <PageHeader
        eyebrow="Verwaltung"
        title="Einstellungen"
        description="Integrationen, E-Mail-Vorlagen, System-Regeln, Katalog und Backup-Exporte."
      />

      <Tabs defaultValue="integrations">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1 rounded-2xl">
          <TabsTrigger value="integrations" className="gap-1.5 rounded-xl">
            <Plug className="h-3.5 w-3.5" /> Integrationen
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5 rounded-xl">
            <Mail className="h-3.5 w-3.5" /> E-Mail-Templates
          </TabsTrigger>
          <TabsTrigger value="slot-rules" className="gap-1.5 rounded-xl">
            <Tags className="h-3.5 w-3.5" /> Slot-Regeln
          </TabsTrigger>
          <TabsTrigger value="catalog" className="gap-1.5 rounded-xl">
            <ShoppingBag className="h-3.5 w-3.5" /> Katalog
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5 rounded-xl">
            <Activity className="h-3.5 w-3.5" /> Logs
          </TabsTrigger>
          <TabsTrigger value="crm-policy" className="gap-1.5 rounded-xl">
            <ShieldAlert className="h-3.5 w-3.5" /> CRM-Policy
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-1.5 rounded-xl">
            <Webhook className="h-3.5 w-3.5" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-1.5 rounded-xl">
            <Download className="h-3.5 w-3.5" /> Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="mt-6">
          <Card><CardContent className="p-4 md:p-6"><AdminIntegrations /></CardContent></Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card><CardContent className="p-4 md:p-6"><AdminEmailTemplates /></CardContent></Card>
        </TabsContent>

        <TabsContent value="slot-rules" className="mt-6">
          <AdminSlotClassificationRules />
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <AdminCatalog />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card><CardContent className="p-4 md:p-6"><AdminSystemLogs /></CardContent></Card>
        </TabsContent>

        <TabsContent value="crm-policy" className="mt-6">
          <AdminCrmDialogPolicyCard />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <AdminWebhooks />
        </TabsContent>

        <TabsContent value="backup" className="mt-6">
          <Card><CardContent className="p-4 md:p-6"><AdminBackupExport /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
