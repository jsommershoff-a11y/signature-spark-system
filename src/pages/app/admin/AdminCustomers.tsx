import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import AdminMembersOverview from "@/components/admin/AdminMembersOverview";

export default function AdminCustomers() {
  return (
    <div>
      <PageHeader
        eyebrow="Verwaltung"
        title="Kunden"
        description="Aktive Kunden, Mitgliedschaften, Verträge und Lernfortschritt."
      />
      <Card>
        <CardContent className="p-4 md:p-6">
          <AdminMembersOverview />
        </CardContent>
      </Card>
    </div>
  );
}
