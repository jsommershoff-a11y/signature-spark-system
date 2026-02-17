import { useState } from 'react';
import { Search, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useCustomers } from '@/hooks/useCustomers';

export default function Customers() {
  const [search, setSearch] = useState('');
  const { customers, isLoading } = useCustomers(search);

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
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.full_name ?? (`${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || '—')}
                  </TableCell>
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
    </div>
  );
}
