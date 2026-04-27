import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import AdminLeadsTable from "@/components/admin/AdminLeadsTable";

export default function AdminLeads() {
  return (
    <div>
      <PageHeader
        eyebrow="Verwaltung"
        title="Leads"
        description="Alle Inbound-Leads mit Qualifikations-Score, Quelle und Zuweisung."
      />
      <Card>
        <CardContent className="p-4 md:p-6">
          <AdminLeadsTable />
        </CardContent>
      </Card>
    </div>
  );
}
