import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, FileText, Users, Handshake, AlertTriangle, TrendingUp, Radio } from 'lucide-react';
import { useRefreshCooData } from '@/hooks/useCooCockpit';
import { toast } from '@/hooks/use-toast';
import CooKpiCards from '@/components/coo/CooKpiCards';
import InvoicesTab from '@/components/coo/InvoicesTab';
import ContactsTab from '@/components/coo/ContactsTab';
import OffersTab from '@/components/coo/OffersTab';
import OpenItemsTab from '@/components/coo/OpenItemsTab';
import RevenueTab from '@/components/coo/RevenueTab';
import SyncMonitoringTab from '@/components/coo/SyncMonitoringTab';

export default function CooCockpit() {
  const refresh = useRefreshCooData();

  const handleSyncCheck = () => {
    toast({ title: 'Sync-Prüfung', description: 'Sync-Status wird geprüft...' });
    refresh();
  };

  const handleRefresh = () => {
    refresh();
    toast({ title: 'Aktualisiert', description: 'Alle Daten wurden neu geladen.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">COO Cockpit</h1>
          <p className="text-muted-foreground">Finanz-, Sync- und Performance-Übersicht</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSyncCheck}>
            <Activity className="h-4 w-4 mr-1" /> Sync prüfen
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" /> Aktualisieren
          </Button>
        </div>
      </div>

      <CooKpiCards />

      <Tabs defaultValue="invoices">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="invoices" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Rechnungen</TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Kontakte</TabsTrigger>
          <TabsTrigger value="offers" className="gap-1.5"><Handshake className="h-3.5 w-3.5" /> Angebote</TabsTrigger>
          <TabsTrigger value="open_items" className="gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Offene Posten</TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Umsatz</TabsTrigger>
          <TabsTrigger value="sync" className="gap-1.5"><Radio className="h-3.5 w-3.5" /> Sync-Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices"><InvoicesTab /></TabsContent>
        <TabsContent value="contacts"><ContactsTab /></TabsContent>
        <TabsContent value="offers"><OffersTab /></TabsContent>
        <TabsContent value="open_items"><OpenItemsTab /></TabsContent>
        <TabsContent value="revenue"><RevenueTab /></TabsContent>
        <TabsContent value="sync"><SyncMonitoringTab /></TabsContent>
      </Tabs>
    </div>
  );
}
