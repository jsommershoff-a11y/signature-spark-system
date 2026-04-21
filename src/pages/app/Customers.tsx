import { useState } from 'react';
import { Search, Users, Loader2, UserCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCustomers } from '@/hooks/useCustomers';
import { useAdminMembers } from '@/hooks/useAdminMembers';
import { ActivityFeed } from '@/components/activities/ActivityFeed';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_COLORS, PRODUCT_LABELS } from '@/types/members';

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
          Stammdaten und Performance aller aktiven Kunden
        </p>
      </div>

      <Tabs defaultValue="stammdaten">
        <TabsList>
          <TabsTrigger value="stammdaten">Stammdaten</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="stammdaten" className="space-y-4 mt-6">
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
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceTab />
        </TabsContent>
      </Tabs>

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

function PerformanceTab() {
  const { members, topPerformers, atRiskMembers, isLoading } = useAdminMembers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktive Mitglieder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter((m) => m.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topPerformers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{atRiskMembers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lernfortschritt & Status</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Noch keine Mitglieder vorhanden.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profile?.full_name?.slice(0, 2).toUpperCase() || 'M'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.profile?.full_name || 'Unbekannt'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.profile?.email}
                    </p>
                  </div>

                  <Badge className={MEMBER_STATUS_COLORS[member.status]}>
                    {MEMBER_STATUS_LABELS[member.status]}
                  </Badge>

                  {member.memberships?.[0] && (
                    <Badge variant="outline">
                      {PRODUCT_LABELS[member.memberships[0].product]}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
