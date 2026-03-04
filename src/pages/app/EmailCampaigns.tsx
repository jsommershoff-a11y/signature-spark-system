import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SequenceList } from '@/components/email/SequenceList';
import { BroadcastList } from '@/components/email/BroadcastList';
import { TemplateList } from '@/components/email/TemplateList';
import { AnalyticsTab } from '@/components/email/AnalyticsTab';
import { Workflow, Send, FileText, BarChart3 } from 'lucide-react';

export default function EmailCampaigns() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Kampagnen</h1>
        <p className="text-muted-foreground">Sequenzen, Broadcasts und Templates verwalten</p>
      </div>
      <Tabs defaultValue="sequenzen">
        <TabsList>
          <TabsTrigger value="sequenzen" className="gap-1"><Workflow className="h-4 w-4" /> Sequenzen</TabsTrigger>
          <TabsTrigger value="broadcasts" className="gap-1"><Send className="h-4 w-4" /> Broadcasts</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1"><FileText className="h-4 w-4" /> Templates</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="sequenzen"><SequenceList /></TabsContent>
        <TabsContent value="broadcasts"><BroadcastList /></TabsContent>
        <TabsContent value="templates"><TemplateList /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
