import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, Pause, Clock, Trash2, Workflow, Users } from 'lucide-react';
import { useEmailSequences, useSequenceSteps, useSequenceEnrollments } from '@/hooks/useEmailSequences';
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

  const activeCount = sequences.filter(s => s.status === 'active').length;
  const draftCount = sequences.filter(s => s.status === 'draft').length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-module-green-muted border-module-green/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Workflow className="h-5 w-5 text-module-green" />
            <div>
              <p className="text-2xl font-bold text-module-green">{sequences.length}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Play className="h-5 w-5 text-module-green-light" />
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Aktiv</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Pause className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{draftCount}</p>
              <p className="text-xs text-muted-foreground">Entwurf</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sequenzen</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-module-green hover:bg-module-green-light text-module-green-foreground">
              <Plus className="h-4 w-4 mr-1" /> Neue Sequenz
            </Button>
          </DialogTrigger>
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
              <Button onClick={handleCreate} disabled={createSequence.isPending} className="w-full bg-module-green hover:bg-module-green-light text-module-green-foreground">
                Erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sequences.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-module-green-muted mb-3">
              <Workflow className="h-8 w-8 text-module-green" />
            </div>
            <h3 className="font-semibold mb-1">Keine Sequenzen</h3>
            <p className="text-sm text-muted-foreground mb-4">Erstelle deine erste automatische Email-Sequenz</p>
            <Button size="sm" className="bg-module-green hover:bg-module-green-light text-module-green-foreground" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Sequenz erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sequences.map(seq => (
            <Card key={seq.id} className={selectedId === seq.id ? 'ring-2 ring-module-green' : 'hover:shadow-md transition-shadow'}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedId(selectedId === seq.id ? null : seq.id)}>
                    <div className="p-1.5 rounded bg-module-green-muted">
                      <Workflow className="h-4 w-4 text-module-green" />
                    </div>
                    <CardTitle className="text-base">
                      {seq.name}
                      {seq.is_preset && <Badge variant="secondary" className="ml-2 text-[10px]">Preset</Badge>}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={SEQUENCE_STATUS_COLORS[seq.status]}>{SEQUENCE_STATUS_LABELS[seq.status]}</Badge>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleStatus(seq)}>
                      {seq.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-module-green" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteSequence.mutate(seq.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {seq.description && <p className="text-sm text-muted-foreground mt-1">{seq.description}</p>}
                {seq.trigger_type && (
                  <Badge variant="outline" className="mt-1 text-xs border-module-green/30 text-module-green-muted-foreground">
                    Trigger: {TRIGGER_TYPE_LABELS[seq.trigger_type as TriggerType] || seq.trigger_type}
                  </Badge>
                )}
              </CardHeader>
              {selectedId === seq.id && (
                <CardContent className="border-t">
                  <SequenceStepEditor sequenceId={seq.id} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SequenceStepEditor({ sequenceId }: { sequenceId: string }) {
  const { steps, isLoading, addStep, deleteStep } = useSequenceSteps(sequenceId);
  const { enrollments } = useSequenceEnrollments(sequenceId);
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

  const formatDelay = (min: number) => {
    if (min === 0) return 'Sofort';
    if (min < 60) return `${min} Min`;
    if (min < 1440) return `${Math.round(min / 60)}h`;
    return `${Math.round(min / 1440)} Tag(e)`;
  };

  return (
    <div className="space-y-4 pt-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Steps ({steps.length})</h4>
        {enrollments.length > 0 && (
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" /> {enrollments.length} eingeschrieben
          </Badge>
        )}
      </div>
      
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3 bg-module-green-muted rounded-lg p-3">
          <span className="text-xs font-mono w-6 text-module-green font-bold">{i + 1}.</span>
          <Clock className="h-3.5 w-3.5 text-module-green" />
          <span className="text-sm font-medium">{formatDelay(s.delay_minutes)}</span>
          <span className="text-sm text-muted-foreground">→</span>
          <span className="text-sm flex-1">{templates.find(t => t.id === s.template_id)?.name || 'Kein Template'}</span>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteStep.mutate(s.id)}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
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
        <Button size="sm" onClick={handleAdd} disabled={addStep.isPending} className="bg-module-green hover:bg-module-green-light text-module-green-foreground">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
