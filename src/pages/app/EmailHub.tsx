import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/app/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EmailCampaigns from "./EmailCampaigns";
import EmailLog from "./EmailLog";
import EmailConsents from "./EmailConsents";

const TABS = ["kampagnen", "log", "consents"] as const;
type TabId = typeof TABS[number];

export default function EmailHub() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initial = (params.get("tab") as TabId) || "kampagnen";
  const value = TABS.includes(initial) ? initial : "kampagnen";

  const handleChange = (next: string) => {
    navigate(`/app/email?tab=${next}`, { replace: true });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Marketing"
        title="Email"
        description="Kampagnen, Versand-Logs und Einwilligungen an einem Ort."
      />
      <Tabs value={value} onValueChange={handleChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="kampagnen">Kampagnen</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="consents">Consents</TabsTrigger>
        </TabsList>
        <TabsContent value="kampagnen" className="mt-0">
          <EmailCampaigns />
        </TabsContent>
        <TabsContent value="log" className="mt-0">
          <EmailLog />
        </TabsContent>
        <TabsContent value="consents" className="mt-0">
          <EmailConsents />
        </TabsContent>
      </Tabs>
    </div>
  );
}
