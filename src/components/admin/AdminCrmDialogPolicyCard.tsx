import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldAlert, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PipelineStage, PIPELINE_STAGE_LABELS } from '@/types/crm';
import { useMandatorySkipStages } from '@/hooks/useAppSettings';

const SELECTABLE_STAGES: PipelineStage[] = [
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
];

export default function AdminCrmDialogPolicyCard() {
  const { stages, loading, save } = useMandatorySkipStages();
  const [draft, setDraft] = useState<PipelineStage[] | null>(null);
  const [saving, setSaving] = useState(false);

  const current = draft ?? stages;
  const dirty = draft !== null && JSON.stringify([...draft].sort()) !== JSON.stringify([...stages].sort());

  const toggle = (stage: PipelineStage, checked: boolean) => {
    const base = draft ?? stages;
    setDraft(checked ? [...base, stage] : base.filter((s) => s !== stage));
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await save(draft);
      setDraft(null);
      toast.success('Policy gespeichert – Skip-Dialog jetzt verpflichtend');
    } catch (e) {
      toast.error('Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> Policy: Skip-Dialog ist verpflichtend
        </CardTitle>
        <CardDescription>
          Wähle Ziel-Stages, für die der Skip-Bestätigungs-Dialog immer erscheinen muss.
          User-Suppressions („Nicht erneut fragen") werden für diese Stages ignoriert.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Lädt…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SELECTABLE_STAGES.map((stage) => {
              const checked = current.includes(stage);
              return (
                <label
                  key={stage}
                  className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2 cursor-pointer hover:bg-muted/40"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => toggle(stage, v === true)}
                  />
                  <span className="text-sm flex-1">{PIPELINE_STAGE_LABELS[stage]}</span>
                  {checked && <Badge variant="secondary">verpflichtend</Badge>}
                </label>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          <p className="text-xs text-muted-foreground">
            {stages.length === 0
              ? 'Keine Stage ist aktuell verpflichtend.'
              : `${stages.length} Stage(s) verpflichtend.`}
          </p>
          <div className="flex gap-2">
            {dirty && (
              <Button variant="ghost" size="sm" onClick={() => setDraft(null)} disabled={saving}>
                Verwerfen
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
