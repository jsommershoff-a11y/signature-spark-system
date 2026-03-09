import AdminMembersOverview from '@/components/admin/AdminMembersOverview';

export default function MemberManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mitgliederbereich-Verwaltung</h1>
        <p className="text-muted-foreground">Mitglieder, Lernpfade, Kurse und Inhalte verwalten</p>
      </div>
      <AdminMembersOverview />
    </div>
  );
}
