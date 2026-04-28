import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useCatalogProducts,
  useUpsertCatalogProduct,
  useDeleteCatalogProduct,
  useToggleCatalogActive,
  type CatalogProduct,
  type CatalogCategory,
  type CatalogMode,
} from '@/hooks/useCatalogProducts';
import { Pencil, Plus, Trash2, ExternalLink, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface FormState {
  id?: string;
  code: string;
  name: string;
  subtitle: string;
  category: CatalogCategory;
  mode: CatalogMode;
  price_net_eur: number;
  price_gross_eur: number;
  price_period_label: string;
  term_label: string;
  delivery_days: number;
  stripe_product_id: string;
  stripe_price_id: string;
  payment_link: string;
  active: boolean;
  sort_order: number;
}

const EMPTY: FormState = {
  code: '',
  name: '',
  subtitle: '',
  category: 'automation',
  mode: 'one_time',
  price_net_eur: 0,
  price_gross_eur: 0,
  price_period_label: '',
  term_label: '',
  delivery_days: 0,
  stripe_product_id: '',
  stripe_price_id: '',
  payment_link: '',
  active: true,
  sort_order: 100,
};

const fmtEUR = (cents: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);

function toForm(p: CatalogProduct): FormState {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    subtitle: p.subtitle,
    category: p.category,
    mode: p.mode,
    price_net_eur: p.price_net_cents / 100,
    price_gross_eur: p.price_gross_cents / 100,
    price_period_label: p.price_period_label ?? '',
    term_label: p.term_label ?? '',
    delivery_days: p.delivery_days,
    stripe_product_id: p.stripe_product_id,
    stripe_price_id: p.stripe_price_id,
    payment_link: p.payment_link,
    active: p.active,
    sort_order: p.sort_order,
  };
}

export default function AdminCatalog() {
  const { data: products = [], isLoading } = useCatalogProducts({ includeInactive: true });
  const upsert = useUpsertCatalogProduct();
  const del = useDeleteCatalogProduct();
  const toggle = useToggleCatalogActive();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const startCreate = () => {
    setForm(EMPTY);
    setOpen(true);
  };
  const startEdit = (p: CatalogProduct) => {
    setForm(toForm(p));
    setOpen(true);
  };

  const submit = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Code und Name sind Pflicht.');
      return;
    }
    if (!form.stripe_price_id.trim() || !form.payment_link.trim()) {
      toast.error('Stripe Price ID und Payment Link sind Pflicht.');
      return;
    }
    try {
      await upsert.mutateAsync({
        code: form.code.trim(),
        name: form.name.trim(),
        subtitle: form.subtitle,
        category: form.category,
        mode: form.mode,
        price_net_cents: Math.round(form.price_net_eur * 100),
        price_gross_cents: Math.round(form.price_gross_eur * 100),
        price_period_label: form.price_period_label || null,
        term_label: form.term_label || null,
        delivery_days: form.delivery_days,
        stripe_product_id: form.stripe_product_id.trim(),
        stripe_price_id: form.stripe_price_id.trim(),
        payment_link: form.payment_link.trim(),
        active: form.active,
        sort_order: form.sort_order,
      });
      toast.success('Produkt gespeichert.');
      setOpen(false);
    } catch (e: any) {
      toast.error('Speichern fehlgeschlagen', { description: e.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Produkt-Katalog</CardTitle>
          <CardDescription>
            Stripe-Produkte, Preise und Payment Links für /app/pricing pflegen.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4 mr-2" /> Produkt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? 'Produkt bearbeiten' : 'Neues Produkt'}</DialogTitle>
              <DialogDescription>
                Brutto-Preis = netto × 1,19 (19 % USt.). Payment Link aus Stripe → Payment Links.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Code *</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="A14" />
                </div>
                <div className="space-y-1">
                  <Label>Sort-Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Untertitel</Label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Kategorie</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as CatalogCategory })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Modus</Label>
                  <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v as CatalogMode })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">Einmalig</SelectItem>
                      <SelectItem value="subscription">Abo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Preis netto (€) *</Label>
                  <Input type="number" value={form.price_net_eur} onChange={(e) => {
                    const net = Number(e.target.value);
                    setForm({ ...form, price_net_eur: net, price_gross_eur: Math.round(net * 1.19) });
                  }} />
                </div>
                <div className="space-y-1">
                  <Label>Preis brutto (€) *</Label>
                  <Input type="number" value={form.price_gross_eur} onChange={(e) => setForm({ ...form, price_gross_eur: Number(e.target.value) })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Periode (z. B. /Monat)</Label>
                  <Input value={form.price_period_label} onChange={(e) => setForm({ ...form, price_period_label: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Lieferzeit (Tage)</Label>
                  <Input type="number" value={form.delivery_days} onChange={(e) => setForm({ ...form, delivery_days: Number(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Laufzeit-Hinweis</Label>
                <Input value={form.term_label} onChange={(e) => setForm({ ...form, term_label: e.target.value })} placeholder="Mindestlaufzeit 6 Monate" />
              </div>

              <div className="space-y-1">
                <Label>Stripe Product ID *</Label>
                <Input value={form.stripe_product_id} onChange={(e) => setForm({ ...form, stripe_product_id: e.target.value })} placeholder="prod_…" />
              </div>
              <div className="space-y-1">
                <Label>Stripe Price ID *</Label>
                <Input value={form.stripe_price_id} onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })} placeholder="price_…" />
              </div>
              <div className="space-y-1">
                <Label>Payment Link *</Label>
                <Input value={form.payment_link} onChange={(e) => setForm({ ...form, payment_link: e.target.value })} placeholder="https://buy.stripe.com/…" />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label className="!m-0">Im Katalog sichtbar</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button onClick={submit} disabled={upsert.isPending}>
                {upsert.isPending ? 'Speichern…' : 'Speichern'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Code</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead className="hidden md:table-cell">Kategorie</TableHead>
                <TableHead className="text-right">Brutto</TableHead>
                <TableHead className="hidden lg:table-cell">Lieferzeit</TableHead>
                <TableHead className="text-center">Aktiv</TableHead>
                <TableHead className="w-[160px] text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Lädt…</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Keine Produkte.</TableCell></TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className={p.active ? '' : 'opacity-50'}>
                    <TableCell className="font-mono text-xs">{p.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{p.subtitle}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{p.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {fmtEUR(p.price_gross_cents)}{p.price_period_label ?? ''}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {p.delivery_days > 0 ? `${p.delivery_days} Tage` : '–'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={p.active}
                        onCheckedChange={(v) => toggle.mutate({ id: p.id, active: v })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="Arbeitsbereich öffnen (Prompt, Konnektoren)">
                          <Link to={`/app/produkte/${p.id}`}>
                            <Wand2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={p.payment_link} target="_blank" rel="noopener noreferrer" title="Payment Link öffnen">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(p)} title="Bearbeiten">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Löschen">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Produkt löschen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {p.code} – {p.name} wird endgültig entfernt. Stripe-Daten bleiben erhalten.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => del.mutate(p.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
