import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, Pause, Clock, Trash2 } from 'lucide-react';
import { useEmailSequences, useSequenceSteps } from '@/hooks/useEmailSequences';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { TRIGGER_TYPE_LABELS, SEQUENCE_STATUS_LABELS, SEQUENCE_STATUS_COLORS } from '@/types/email';
import type { EmailSequence, SequenceStatus, TriggerType } from '@/types/email';

export function SequenceList() {
  const { sequences, isLoading, createSequence, updateSequence, deleteSequence } = useEmailSequences();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', trigger_type: '' as TriggerType | '', status: 'draft' as SequenceStatus });

  const handleCreate = () => {
    createSequence.mutate({
      name: form.name,
      description: form.description || null,
      trigger_type: form.trigger_type || null,
      status: 'draft',
    }, { onSuccess: () => { setCreateOpen(false); setForm({ name: '', description: '', trigger_type: '', status: 'draft' }); } });
  };

  const toggleStatus = (seq: EmailSequence) => {
    const next = seq.status === 'active' ? 'paused' : 'active';
    updateSequence.mutate({ id: seq.id, status: next });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Email Sequenzen</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Neue Sequenz</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Neue Sequenz</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><Label>Beschreibung</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div>
                <Label>Trigger</Label>
                <Select value={form.trigger_type} onValueChange={v => setForm(f => ({ ...f, trigger_type: v as TriggerType }))}>
                  <SelectTrigger><SelectValue placeholder="Kein automatischer Trigger" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRIGGER_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createSequence.isPending} className="w-full">Erstellen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {sequences.map(seq => (
          <Card key={seq.id} className={selectedId === seq.id ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base cursor-pointer" onClick={() => setSelectedId(selectedId === seq.id ? null : seq.id)}>
                  {seq.name}
                  {seq.is_preset && <Badge variant="secondary" className="ml-2 text-[10px]">Preset</Badge>}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={SEQUENCE_STATUS_COLORS[seq.status]}>{SEQUENCE_STATUS_LABELS[seq.status]}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => toggleStatus(seq)}>
                    {seq.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteSequence.mutate(seq.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              {seq.description && <p className="text-sm text-muted-foreground">{seq.description}</p>}
              {seq.trigger_type && <p className="text-xs text-muted-foreground">Trigger: {TRIGGER_TYPE_LABELS[seq.trigger_type as TriggerType] || seq.trigger_type}</p>}
            </CardHeader>
            {selectedId === seq.id && (
              <CardContent>
                <SequenceStepEditor sequenceId={seq.id} />
              </CardContent>
            )}
          </Card>
        ))}
        {sequences.length === 0 && <p className="text-center text-muted-foreground py-8">Keine Sequenzen vorhanden</p>}
      </div>
    </div>
  );
}

function SequenceStepEditor({ sequenceId }: { sequenceId: string }) {
  const { steps, isLoading, addStep, deleteStep } = useSequenceSteps(sequenceId);
  const { templates } = useEmailTemplates();
  const [delayMin, setDelayMin] = useState(0);
  const [templateId, setTemplateId] = useState('');

  const handleAdd = () => {
    addStep.mutate({
      sequence_id: sequenceId,
      step_order: steps.length + 1,
      delay_minutes: delayMin,
      template_id: templateId || null,
    });
    setDelayMin(0);
    setTemplateId('');
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Steps</h4>
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3 bg-muted/50 rounded p-2">
          <span className="text-xs font-mono w-6">{i + 1}.</span>
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{s.delay_minutes === 0 ? 'Sofort' : `Nach ${Math.round(s.delay_minutes / 60)}h (${Math.round(s.delay_minutes / 1440)}d)`}</span>
          <span className="text-sm text-muted-foreground">→</span>
          <span className="text-sm flex-1">{templates.find(t => t.id === s.template_id)?.name || 'Kein Template'}</span>
          <Button size="icon" variant="ghost" onClick={() => deleteStep.mutate(s.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      ))}
      <div className="flex items-end gap-2 pt-2 border-t">
        <div className="flex-1">
          <Label className="text-xs">Verzögerung (Min)</Label>
          <Input type="number" min={0} value={delayMin} onChange={e => setDelayMin(parseInt(e.target.value) || 0)} />
        </div>
        <div className="flex-1">
          <Label className="text-xs">Template</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
            <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleAdd} disabled={addStep.isPending}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
