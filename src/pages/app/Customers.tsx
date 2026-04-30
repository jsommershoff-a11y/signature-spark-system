import { useState, useMemo } from 'react';
import { Search, Users, Loader2, UserCheck, TrendingUp, AlertTriangle, Trash2, ArrowRightCircle, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCustomers, type Customer, type CustomerRecordStatus } from '@/hooks/useCustomers';
import { useAdminMembers } from '@/hooks/useAdminMembers';
import { ActivityFeed } from '@/components/activities/ActivityFeed';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_COLORS, PRODUCT_LABELS } from '@/types/members';

const STATUS_OPTIONS: { value: CustomerRecordStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle aktiven' },
  { value: 'customer', label: 'Kunden' },
  { value: 'contact', label: 'Potenzielle Kunden' },
  { value: 'lead', label: 'Leads' },
  { value: 'deleted', label: 'Gelöscht' },
];

const STATUS_BADGE: Record<CustomerRecordStatus, { label: string; className: string }> = {
  customer: { label: 'Kunde', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  contact:  { label: 'Kontakt', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  lead:     { label: 'Lead', className: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  deleted:  { label: 'Gelöscht', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerRecordStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const includeDeleted = statusFilter === 'deleted';
  const apiFilter = statusFilter === 'all' ? null : statusFilter;

  const { customers, isLoading, softDelete, restore, convertToLead, isMutating } =
    useCustomers(search, apiFilter, includeDeleted);

  const rowKey = (c: Customer) => `${c.source}:${c.id}`;
  const allSelected = customers.length > 0 && customers.every((c) => selectedIds.has(rowKey(c)));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const selectedItems = useMemo(
    () =>
      customers
        .filter((c) => selectedIds.has(rowKey(c)))
        .map((c) => ({ id: c.id, source: c.source })),
    [customers, selectedIds],
  );

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(customers.map(rowKey)));
    else setSelectedIds(new Set());
  };
  const toggleOne = (c: Customer, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(rowKey(c));
    else next.delete(rowKey(c));
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    await softDelete(selectedItems);
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  };

  const displayName = (c: Customer) =>
    c.full_name ?? (`${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || c.email || '—');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kunden & Kontakte</h1>
        <p className="text-muted-foreground">
          Stammdaten von Kunden, potenziellen Kunden und Leads – mit Soft-Delete.
        </p>
      </div>

      <Tabs defaultValue="stammdaten">
        <TabsList>
          <TabsTrigger value="stammdaten">Stammdaten</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="stammdaten" className="space-y-4 mt-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Name, Firma oder E-Mail…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as CustomerRecordStatus | 'all'); setSelectedIds(new Set()); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedIds.size > 0 && statusFilter !== 'deleted' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isMutating}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {selectedIds.size} löschen
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mb-2" />
              <p className="text-sm">
                {search ? 'Keine Einträge gefunden.' : 'Noch keine Einträge vorhanden.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={(v) => toggleAll(Boolean(v))}
                        aria-label="Alle auswählen"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>Zugewiesen</TableHead>
                    <TableHead className="w-[140px] text-right">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => {
                    const key = rowKey(c);
                    const checked = selectedIds.has(key);
                    const badge = STATUS_BADGE[c.record_status];
                    return (
                      <TableRow key={key} className={checked ? 'bg-muted/30' : ''}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => toggleOne(c, Boolean(v))}
                            aria-label="Auswählen"
                          />
                        </TableCell>
                        <TableCell
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() => setSelected(c)}
                        >
                          {displayName(c)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={badge.className}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell>{c.email ?? '—'}</TableCell>
                        <TableCell>{c.phone ?? '—'}</TableCell>
                        <TableCell>{c.company ?? '—'}</TableCell>
                        <TableCell>{c.assigned_staff_name ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          {c.record_status === 'contact' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isMutating}
                              onClick={(e) => { e.stopPropagation(); convertToLead(c.id); }}
                              title="In Lead umwandeln"
                            >
                              <ArrowRightCircle className="h-4 w-4 mr-1" />
                              Zu Lead
                            </Button>
                          )}
                          {c.record_status === 'deleted' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isMutating}
                              onClick={(e) => { e.stopPropagation(); restore({ id: c.id, source: c.source }); }}
                              title="Wiederherstellen"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceTab />
        </TabsContent>
      </Tabs>

      {/* Delete-Confirm */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedIds.size} Einträge löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die Datensätze werden ausgeblendet (Soft-Delete). Verträge, Calls und Activities bleiben erhalten.
              Admins können sie über den Filter „Gelöscht" wiederherstellen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail-Dialog */}
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
                <InfoRow label="Status" value={STATUS_BADGE[selected.record_status].label} />
                <InfoRow label="Quelle" value={selected.source === 'profile' ? 'Mitglied' : 'CRM'} />
                <InfoRow label="E-Mail" value={selected.email} />
                <InfoRow label="Telefon" value={selected.phone} />
                <InfoRow label="Firma" value={selected.company} />
                <InfoRow label="Zugewiesener MA" value={selected.assigned_staff_name} />
                {selected.deleted_at && (
                  <InfoRow label="Gelöscht am" value={new Date(selected.deleted_at).toLocaleString('de-DE')} />
                )}
              </TabsContent>

              <TabsContent value="activities" className="mt-4">
                {selected.source === 'profile'
                  ? <ActivityFeed customerId={selected.id} />
                  : <ActivityFeed leadId={selected.id} />}
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Aktive Mitglieder</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{members.filter((m) => m.status === 'active').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Top Performer</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{topPerformers.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />At Risk</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-destructive">{atRiskMembers.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Lernfortschritt & Status</CardTitle></CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Noch keine Mitglieder vorhanden.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <Avatar>
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback>{member.profile?.full_name?.slice(0, 2).toUpperCase() || 'M'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.profile?.full_name || 'Unbekannt'}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.profile?.email}</p>
                  </div>
                  <Badge className={MEMBER_STATUS_COLORS[member.status]}>{MEMBER_STATUS_LABELS[member.status]}</Badge>
                  {member.memberships?.[0] && <Badge variant="outline">{PRODUCT_LABELS[member.memberships[0].product]}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
