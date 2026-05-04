import { useMemo, useState } from 'react';
import { useDeals } from '@/hooks/useDeals';
import { DEAL_STAGES, Deal, DealStage } from '@/types/deals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, MoveRight } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function formatCurrency(value: number | null, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(value || 0);
}

export default function Deals() {
  const { data: deals = [], isLoading, create, updateStage, remove } = useDeals();
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState<{ title: string; value: string; stage: DealStage; notes: string; expected_close_date: string }>({
    title: '', value: '', stage: 'new', notes: '', expected_close_date: '',
  });

  const grouped = useMemo(() => {
    const map: Record<DealStage, Deal[]> = {
      new: [], qualified: [], proposal: [], negotiation: [], won: [], lost: [],
    };
    for (const d of deals) map[d.stage]?.push(d);
    return map;
  }, [deals]);

  const totals = useMemo(() => {
    const t: Record<DealStage, number> = {
      new: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0, lost: 0,
    };
    for (const d of deals) t[d.stage] += Number(d.value || 0);
    return t;
  }, [deals]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    await create.mutateAsync({
      title: form.title.trim(),
      value: form.value ? Number(form.value) : 0,
      stage: form.stage,
      notes: form.notes || null,
      expected_close_date: form.expected_close_date || null,
    });
    setOpenCreate(false);
    setForm({ title: '', value: '', stage: 'new', notes: '', expected_close_date: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">
            Deal-Pipeline mit klassischen Phasen: Neu → Qualifiziert → Angebot → Verhandeln → Gewonnen/Verloren
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Neuer Deal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Neuen Deal anlegen</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z. B. Automatisierungsprojekt Müller GmbH" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="value">Wert (EUR)</Label>
                  <Input id="value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </div>
                <div>
                  <Label>Phase</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v as DealStage })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DEAL_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="ecd">Voraussichtlicher Abschluss</Label>
                <Input id="ecd" type="date" value={form.expected_close_date} onChange={(e) => setForm({ ...form, expected_close_date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="notes">Notizen</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Abbrechen</Button>
              <Button onClick={handleCreate} disabled={!form.title.trim() || create.isPending}>Anlegen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Lade Deals…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DEAL_STAGES.map((stage) => (
            <Card key={stage.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${stage.color}`} />
                    {stage.label}
                  </CardTitle>
                  <Badge variant="secondary">{grouped[stage.id].length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{formatCurrency(totals[stage.id])}</p>
              </CardHeader>
              <CardContent className="space-y-2 flex-1">
                {grouped[stage.id].length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Keine Deals</p>
                )}
                {grouped[stage.id].map((d) => (
                  <div key={d.id} className="rounded border bg-card p-2 text-sm space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium leading-tight">{d.title}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-6 w-6"><MoveRight className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {DEAL_STAGES.filter((s) => s.id !== d.stage).map((s) => (
                            <DropdownMenuItem key={s.id} onClick={() => updateStage.mutate({ id: d.id, stage: s.id })}>
                              → {s.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(d.id)}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" />Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{formatCurrency(d.value, d.currency)}</span>
                      <span>{d.probability}%</span>
                    </div>
                    {d.expected_close_date && (
                      <div className="text-xs text-muted-foreground">
                        bis {new Date(d.expected_close_date).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
