import { useState } from 'react';
import { Search, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomers } from '@/hooks/useCustomers';
import { ActivityFeed } from '@/components/activities/ActivityFeed';

interface Customer {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  assigned_staff_name: string | null;
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const { customers, isLoading } = useCustomers(search);
  const [selected, setSelected] = useState<Customer | null>(null);

  const displayName = (c: Customer) =>
    c.full_name ?? (`${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || '—');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kunden</h1>
        <p className="text-muted-foreground">
          Übersicht und Verwaltung aller aktiven Kunden
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Nach Name oder Firma suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mb-2" />
          <p className="text-sm">
            {search ? 'Keine Kunden gefunden.' : 'Noch keine Kunden vorhanden.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Firma</TableHead>
                <TableHead>Zugewiesener Mitarbeiter</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(c as Customer)}
                >
                  <TableCell className="font-medium">{displayName(c as Customer)}</TableCell>
                  <TableCell>{c.email ?? '—'}</TableCell>
                  <TableCell>{c.phone ?? '—'}</TableCell>
                  <TableCell>{c.company ?? '—'}</TableCell>
                  <TableCell>{c.assigned_staff_name ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? displayName(selected) : ''}</DialogTitle>
          </DialogHeader>
          {selected && (
            <Tabs defaultValue="overview" className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Übersicht</TabsTrigger>
                <TabsTrigger value="activities">Aktivitäten</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-3">
                <InfoRow label="E-Mail" value={selected.email} />
                <InfoRow label="Telefon" value={selected.phone} />
                <InfoRow label="Firma" value={selected.company} />
                <InfoRow label="Zugewiesener MA" value={selected.assigned_staff_name} />
              </TabsContent>

              <TabsContent value="activities" className="mt-4">
                <ActivityFeed customerId={selected.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? '—'}</span>
    </div>
  );
}
