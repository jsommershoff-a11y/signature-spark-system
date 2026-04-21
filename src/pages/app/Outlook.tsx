import AdminOutlookMailbox from '@/components/admin/AdminOutlookMailbox';

export default function Outlook() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outlook Postfach</h1>
        <p className="text-muted-foreground">
          E-Mails empfangen, senden und in Aufgaben, Tickets oder Pipeline-Deals umwandeln
        </p>
      </div>
      <AdminOutlookMailbox />
    </div>
  );
}
