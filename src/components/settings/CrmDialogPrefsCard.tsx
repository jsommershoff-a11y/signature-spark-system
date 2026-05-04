import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquareOff, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { PipelineStage } from '@/types/crm';
import { PIPELINE_STAGE_LABELS } from '@/types/crm';
import {
  listSuppressedStageDialogs,
  listSuppressedSkipDialogs,
  clearStageDialogSuppression,
  clearSkipDialogSuppression,
  resetStageDialogSuppressions,
} from '@/lib/crm/stage-dialog-prefs';
import { useMandatorySkipStages } from '@/hooks/useAppSettings';
import { ShieldAlert } from 'lucide-react';

export default function CrmDialogPrefsCard() {
  const [stageSuppressed, setStageSuppressed] = useState<PipelineStage[]>([]);
  const [skipSuppressed, setSkipSuppressed] = useState<PipelineStage[]>([]);
  const { stages: mandatoryStages } = useMandatorySkipStages();

  const refresh = useCallback(() => {
    setStageSuppressed(listSuppressedStageDialogs());
    setSkipSuppressed(listSuppressedSkipDialogs());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('crm:stage-dialog')) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const handleClearStage = (stage: PipelineStage) => {
    clearStageDialogSuppression(stage);
    refresh();
    toast.success(`Übergangs-Dialog für „${PIPELINE_STAGE_LABELS[stage]}" reaktiviert`);
  };

  const handleClearSkip = (stage: PipelineStage) => {
    clearSkipDialogSuppression(stage);
    refresh();
    toast.success(`Skip-Dialog für „${PIPELINE_STAGE_LABELS[stage]}" reaktiviert`);
  };

  const handleResetAll = () => {
    resetStageDialogSuppressions();
    refresh();
    toast.success('Alle CRM-Dialoge wurden reaktiviert');
  };

  const totalCount = stageSuppressed.length + skipSuppressed.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareOff className="h-5 w-5" /> CRM-Dialog-Verhalten
        </CardTitle>
        <CardDescription>
          Stillgestellte Bestätigungs-Dialoge der Pipeline. Reaktiviere sie einzeln oder alle auf einmal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Skip-Dialoge (Stages überspringen)</p>
            <Badge variant="secondary">{skipSuppressed.length}</Badge>
          </div>
          {skipSuppressed.length === 0 ? (
            <p className="text-xs text-muted-foreground">Keine Skip-Dialoge stillgestellt.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skipSuppressed.map((stage) => {
                const overridden = mandatoryStages.includes(stage);
                return (
                  <Badge key={stage} variant="outline" className="gap-1.5 pl-2 pr-1 py-1">
                    {overridden && <ShieldAlert className="h-3 w-3 text-destructive" aria-label="Admin-Policy aktiv" />}
                    <span className={overridden ? 'line-through text-muted-foreground' : ''}>
                      {PIPELINE_STAGE_LABELS[stage]}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleClearSkip(stage)}
                      aria-label={`Skip-Dialog für ${PIPELINE_STAGE_LABELS[stage]} reaktivieren`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
          {mandatoryStages.length > 0 && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
              <ShieldAlert className="h-3 w-3" />
              Admin-Policy: Skip-Dialog ist für markierte Stages verpflichtend und überschreibt deine Stillstellung.
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Übergangs-Dialoge (Stage-Wechsel)</p>
            <Badge variant="secondary">{stageSuppressed.length}</Badge>
          </div>
          {stageSuppressed.length === 0 ? (
            <p className="text-xs text-muted-foreground">Keine Übergangs-Dialoge stillgestellt.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stageSuppressed.map((stage) => (
                <Badge key={stage} variant="outline" className="gap-1.5 pl-2 pr-1 py-1">
                  {PIPELINE_STAGE_LABELS[stage]}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => handleClearStage(stage)}
                    aria-label={`Übergangs-Dialog für ${PIPELINE_STAGE_LABELS[stage]} reaktivieren`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          disabled={totalCount === 0}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Alle Dialoge reaktivieren
        </Button>
      </CardContent>
    </Card>
  );
}
