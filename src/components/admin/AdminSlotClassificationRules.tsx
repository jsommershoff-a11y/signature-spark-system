import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, Tags } from 'lucide-react';
import { toast } from 'sonner';

type Category =
  | 'discovery_call' | 'closing' | 'strategy' | 'demo'
  | 'onboarding' | 'internal' | 'personal' | 'blocker' | 'other';

interface Rule {
  id: string;
  name: string;
  category: Category;
  keywords: string[];
  priority: number;
  is_active: boolean;
  applies_to_source: string;
}

const CATEGORY_LABEL: Record<Category, string> = {
  discovery_call: 'Discovery-Call',
  closing: 'Closing',
  strategy: 'Strategie',
  demo: 'Demo',
  onboarding: 'Onboarding',
  internal: 'Intern / Team',
  personal: 'Privat',
  blocker: 'Blocker / Fokus',
  other: 'Sonstige',
};

const EMPTY: Omit<Rule, 'id'> = {
  name: '',
  category: 'discovery_call',
  keywords: [],
  priority: 100,
  is_active: true,
  applies_to_source: 'google_busy',
};

export default function AdminSlotClassificationRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [draft, setDraft] = useState<Omit<Rule, 'id'>>(EMPTY);
  const [keywordInput, setKeywordInput] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slot_classification_rules')
      .select('*')
      .order('priority', { ascending: false });
    if (error) toast.error('Regeln konnten nicht geladen werden');
    else setRules((data ?? []) as Rule[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setDraft(EMPTY);
    setKeywordInput('');
    setOpen(true);
  };

  const openEdit = (r: Rule) => {
    setEditing(r);
    setDraft({ ...r });
    setKeywordInput('');
    setOpen(true);
  };

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (!kw) return;
    if (draft.keywords.includes(kw)) return;
    setDraft({ ...draft, keywords: [...draft.keywords, kw] });
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setDraft({ ...draft, keywords: draft.keywords.filter(k => k !== kw) });
  };

  const save = async () => {
    if (!draft.name.trim()) { toast.error('Name erforderlich'); return; }
    if (draft.keywords.length === 0) { toast.error('Mindestens ein Keyword erforderlich'); return; }

    if (editing) {
      const { error } = await supabase
        .from('slot_classification_rules')
        .update(draft)
        .eq('id', editing.id);
      if (error) { toast.error('Speichern fehlgeschlagen'); return; }
      toast.success('Regel aktualisiert');
    } else {
      const { error } = await supabase
        .from('slot_classification_rules')
        .insert(draft);
      if (error) { toast.error('Erstellen fehlgeschlagen'); return; }
      toast.success('Regel erstellt');
    }
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Regel wirklich löschen?')) return;
    const { error } = await supabase.from('slot_classification_rules').delete().eq('id', id);
    if (error) toast.error('Löschen fehlgeschlagen');
    else { toast.success('Gelöscht'); load(); }
  };

  const toggleActive = async (r: Rule) => {
    const { error } = await supabase
      .from('slot_classification_rules')
      .update({ is_active: !r.is_active })
      .eq('id', r.id);
    if (error) toast.error('Status konnte nicht geändert werden');
    else load();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" /> Slot-Klassifizierungsregeln
            </CardTitle>
            <CardDescription>
              Importierte Google-Termine werden automatisch nach Titel/Beschreibung kategorisiert.
              Höhere Priorität gewinnt.
            </CardDescription>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Neue Regel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Regeln definiert.</p>
        ) : (
          <div className="space-y-2">
            {rules.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{r.name}</span>
                    <Badge variant="outline">{CATEGORY_LABEL[r.category]}</Badge>
                    <Badge variant="secondary" className="text-[10px]">Priorität {r.priority}</Badge>
                    {!r.is_active && <Badge variant="destructive" className="text-[10px]">Inaktiv</Badge>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.keywords.map(k => (
                      <Badge key={k} variant="outline" className="text-[10px] font-mono">{k}</Badge>
                    ))}
                  </div>
                </div>
                <Switch checked={r.is_active} onCheckedChange={() => toggleActive(r)} />
                <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Regel bearbeiten' : 'Neue Regel'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="z.B. Discovery-Calls" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Kategorie</Label>
                  <Select value={draft.category} onValueChange={(v: Category) => setDraft({ ...draft, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CATEGORY_LABEL) as Category[]).map(c => (
                        <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priorität</Label>
                  <Input type="number" value={draft.priority} onChange={e => setDraft({ ...draft, priority: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <Label>Keywords (Match in Titel oder Beschreibung)</Label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={e => setKeywordInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                    placeholder="z.B. discovery"
                  />
                  <Button type="button" onClick={addKeyword}>Hinzufügen</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {draft.keywords.map(k => (
                    <Badge key={k} variant="outline" className="cursor-pointer" onClick={() => removeKeyword(k)}>
                      {k} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={draft.is_active} onCheckedChange={v => setDraft({ ...draft, is_active: v })} />
                <Label>Aktiv</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button onClick={save}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
