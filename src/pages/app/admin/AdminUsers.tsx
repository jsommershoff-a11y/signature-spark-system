import { PageHeader } from "@/components/app/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import AdminUserManagement from "@/components/admin/AdminUserManagement";

export default function AdminUsers() {
  return (
    <div>
      <PageHeader
        eyebrow="Verwaltung"
        title="Nutzer"
        description="Rollen vergeben, Mitarbeiter einladen, Accounts verwalten."
      />
      <Card>
        <CardContent className="p-4 md:p-6">
          <AdminUserManagement />
        </CardContent>
      </Card>
    </div>
  );
}
