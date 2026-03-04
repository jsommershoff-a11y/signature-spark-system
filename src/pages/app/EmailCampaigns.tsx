import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SequenceList } from '@/components/email/SequenceList';
import { BroadcastList } from '@/components/email/BroadcastList';
import { TemplateList } from '@/components/email/TemplateList';
import { AnalyticsTab } from '@/components/email/AnalyticsTab';
import { Workflow, Send, FileText, BarChart3, Mail } from 'lucide-react';

export default function EmailCampaigns() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-module-green to-module-green-light p-6 text-module-green-foreground">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-white/20">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Email Kampagnen</h1>
            <p className="text-white/80 text-sm">Sequenzen, Broadcasts und Templates verwalten</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="sequenzen">
        <TabsList className="bg-module-green-muted">
          <TabsTrigger value="sequenzen" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <Workflow className="h-4 w-4" /> Sequenzen
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <Send className="h-4 w-4" /> Broadcasts
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <FileText className="h-4 w-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-module-green data-[state=active]:text-module-green-foreground">
            <BarChart3 className="h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sequenzen"><SequenceList /></TabsContent>
        <TabsContent value="broadcasts"><BroadcastList /></TabsContent>
        <TabsContent value="templates"><TemplateList /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
