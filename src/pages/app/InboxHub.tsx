import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/app/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Posteingang from "./Posteingang";
import Outlook from "./Outlook";
import Tickets from "./Tickets";

const TABS = ["posteingang", "outlook", "tickets"] as const;
type TabId = typeof TABS[number];

export default function InboxHub() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initial = (params.get("tab") as TabId) || "posteingang";
  const value = TABS.includes(initial) ? initial : "posteingang";

  const handleChange = (next: string) => {
    navigate(`/app/inbox?tab=${next}`, { replace: true });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Verwaltung"
        title="Inbox"
        description="Posteingang, Outlook-Mails und Support-Tickets gebündelt."
      />
      <Tabs value={value} onValueChange={handleChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="posteingang">Posteingang</TabsTrigger>
          <TabsTrigger value="outlook">Outlook</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>
        <TabsContent value="posteingang" className="mt-0">
          <Posteingang />
        </TabsContent>
        <TabsContent value="outlook" className="mt-0">
          <Outlook />
        </TabsContent>
        <TabsContent value="tickets" className="mt-0">
          <Tickets />
        </TabsContent>
      </Tabs>
    </div>
  );
}
