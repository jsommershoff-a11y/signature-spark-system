import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { PipelineStage, PIPELINE_STAGE_LABELS } from '@/types/crm';
import { useActivities } from '@/hooks/useActivities';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/contexts/AuthContext';

// Lineare Reihenfolge zur Erkennung von Rückwärts-Wechseln.
// `lost` ist seitwärts (kein Vor/Zurück).
const STAGE_ORDER: PipelineStage[] = [
  'new_lead',
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
];

const isBackwardMove = (from: PipelineStage | null, to: PipelineStage): boolean => {
  if (!from) return false;
  const fi = STAGE_ORDER.indexOf(from);
  const ti = STAGE_ORDER.indexOf(to);
  if (fi < 0 || ti < 0) return false;
  return ti < fi;
};

/** Liefert übersprungene Stages bei Vorwärts-Sprung (>1 Schritt). Leeres Array = kein Skip. */
const getSkippedStages = (from: PipelineStage | null, to: PipelineStage): PipelineStage[] => {
  if (!from) return [];
  const fi = STAGE_ORDER.indexOf(from);
  const ti = STAGE_ORDER.indexOf(to);
  if (fi < 0 || ti < 0) return [];
  if (ti - fi <= 1) return [];
  return STAGE_ORDER.slice(fi + 1, ti);
};

export type StageTransitionAction =
  | { kind: 'open_calendar' }
  | { kind: 'open_email' }
  | { kind: 'create_task' }
  | { kind: 'open_offer' }
  | { kind: 'create_offer' }
  | { kind: 'plan_followup'; hours: number }
  | { kind: 'plan_followup_manual' }
  | { kind: 'verify_payment' }
  | { kind: 'start_onboarding' }
  | { kind: 'document_objection' }
  | { kind: 'plan_second_call' }
  | { kind: 'later' }
  | { kind: 'cancel' };

interface ActionDef {
  label: string;
  action: StageTransitionAction;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  disabled?: boolean;
  disabledReason?: string;
}

interface PromptConfig {
  question: string;
  description?: string;
  actions: ActionDef[];
  /** Spezialform: Verlustgrund-Auswahl */
  lossReasonPicker?: boolean;
  /** Spezialform: Won-Bestätigung */
  wonConfirmation?: boolean;
}

const STAGE_TRANSITION_PROMPTS: Partial<Record<PipelineStage, PromptConfig>> = {
  setter_call_scheduled: {
    question: 'Soll direkt eine Terminbestätigung oder Vorbereitung erstellt werden?',
    actions: [
      { label: 'Termin öffnen', action: { kind: 'open_calendar' }, variant: 'default' },
      { label: 'E-Mail vorbereiten', action: { kind: 'open_email' }, variant: 'outline' },
      { label: 'Später', action: { kind: 'later' }, variant: 'ghost' },
    ],
  },
  setter_call_done: {
    question: 'Soll jetzt die Analyse gestartet werden?',
    actions: [
      { label: 'Analyse starten', action: { kind: 'open_offer' }, variant: 'default', disabled: true, disabledReason: 'Analyse-Modul folgt' },
      { label: 'Aufgabe erstellen', action: { kind: 'create_task' }, variant: 'outline' },
      { label: 'Später', action: { kind: 'later' }, variant: 'ghost' },
    ],
  },
  analysis_ready: {
    question: 'Soll ein Angebot vorbereitet werden?',
    actions: [
      { label: 'Angebot erstellen', action: { kind: 'create_offer' }, variant: 'default' },
      { label: 'Kosten-Nutzen-Rechnung vorbereiten', action: { kind: 'create_task' }, variant: 'outline' },
      { label: 'Später', action: { kind: 'later' }, variant: 'ghost' },
    ],
  },
  offer_draft: {
    question: 'Soll eine Angebotsprüfung angelegt werden?',
    actions: [
      { label: 'Prüfung erstellen', action: { kind: 'create_task' }, variant: 'default' },
      { label: 'Angebot öffnen', action: { kind: 'open_offer' }, variant: 'outline' },
      { label: 'Später', action: { kind: 'later' }, variant: 'ghost' },
    ],
  },
  offer_sent: {
    question: 'Soll ein Follow-up terminiert werden?',
    actions: [
      { label: 'Follow-up in 24h', action: { kind: 'plan_followup', hours: 24 }, variant: 'default' },
      { label: 'Follow-up in 48h', action: { kind: 'plan_followup', hours: 48 }, variant: 'outline' },
      { label: 'Manuell planen', action: { kind: 'plan_followup_manual' }, variant: 'ghost' },
    ],
  },
  payment_unlocked: {
    question: 'Welche Closing-Aktion ist notwendig?',
    actions: [
      { label: 'Einwand dokumentieren', action: { kind: 'document_objection' }, variant: 'default' },
      { label: 'Zweitgespräch planen', action: { kind: 'plan_second_call' }, variant: 'outline' },
      { label: 'Aufgabe erstellen', action: { kind: 'create_task' }, variant: 'ghost' },
    ],
  },
  won: {
    question: 'Wurde Zahlung bestätigt oder durch Admin freigegeben?',
    description:
      'Eine Stage „Gewonnen" sollte erst gesetzt werden, wenn die Zahlung eingegangen oder vom Admin bestätigt wurde.',
    wonConfirmation: true,
    actions: [
      { label: 'Zahlung prüfen', action: { kind: 'verify_payment' }, variant: 'outline' },
      { label: 'Onboarding starten', action: { kind: 'start_onboarding' }, variant: 'default' },
      { label: 'Abbrechen', action: { kind: 'cancel' }, variant: 'ghost' },
    ],
  },
  lost: {
    question: 'Bitte Verlustgrund dokumentieren.',
    lossReasonPicker: true,
    actions: [],
  },
};

const LOSS_REASONS = [
  'Kein Budget',
  'Kein Bedarf',
  'Timing falsch',
  'Nicht erreichbar',
  'Wettbewerb',
  'Sonstiges',
];

interface StageTransitionDialogProps {
  transition: { itemId: string; fromStage: PipelineStage | null; toStage: PipelineStage } | null;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  onUpdateLeadNotes: (leadId: string, notes: string) => Promise<void>;
  leadIdForItem: (itemId: string) => string | null;
}

export function StageTransitionDialog({
  transition,
  onConfirm,
  onCancel,
  onUpdateLeadNotes,
  leadIdForItem,
}: StageTransitionDialogProps) {
  const navigate = useNavigate();
  const leadId = transition ? leadIdForItem(transition.itemId) : null;
  const { createActivity } = useActivities({ lead_id: leadId ?? undefined });
  const { createTask } = useTasks();
  const { profile } = useAuth();
  const assignedUserId = profile?.id ?? '';

  const [busy, setBusy] = useState(false);
  const [lossReason, setLossReason] = useState<string>(LOSS_REASONS[0]);
  const [backwardNote, setBackwardNote] = useState<string>('');
  const [skipConfirmed, setSkipConfirmed] = useState<Record<string, boolean>>({});
  const [skipAcknowledged, setSkipAcknowledged] = useState(false);

  useEffect(() => {
    if (transition) {
      setLossReason(LOSS_REASONS[0]);
      setBackwardNote('');
      setSkipConfirmed({});
      setSkipAcknowledged(false);
    }
  }, [transition]);

  const isBackward = transition ? isBackwardMove(transition.fromStage, transition.toStage) : false;
  const skippedStages = transition ? getSkippedStages(transition.fromStage, transition.toStage) : [];

  const config = useMemo<PromptConfig | null>(() => {
    if (!transition) return null;
    return STAGE_TRANSITION_PROMPTS[transition.toStage] ?? null;
  }, [transition]);

  if (!transition) return null;

  const targetLabel = PIPELINE_STAGE_LABELS[transition.toStage];

  // Rückwärts-Wechsel: Pflicht-Notiz bevor gespeichert wird.
  // Stage-Skip: Vorwärts-Sprung über mindestens eine Stage hinweg → aktive Bestätigung.
  if (skippedStages.length > 0 && !skipAcknowledged) {
    const fromLabel = transition.fromStage ? PIPELINE_STAGE_LABELS[transition.fromStage] : '';
    const allChecked = skippedStages.every((s) => skipConfirmed[s]);
    return (
      <AlertDialog open onOpenChange={(o) => !o && !busy && onCancel()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              {skippedStages.length === 1 ? 'Eine Stage' : `${skippedStages.length} Stages`} überspringen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Du verschiebst den Lead von <strong>{fromLabel}</strong> direkt zu{' '}
              <strong>{targetLabel}</strong>. Bitte bestätige, dass die folgenden Schritte bewusst übersprungen werden:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ul className="space-y-2 py-2">
            {skippedStages.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <Checkbox
                  id={`skip-${s}`}
                  checked={!!skipConfirmed[s]}
                  onCheckedChange={(v) =>
                    setSkipConfirmed((prev) => ({ ...prev, [s]: v === true }))
                  }
                  className="mt-0.5"
                />
                <Label htmlFor={`skip-${s}`} className="cursor-pointer text-sm leading-snug">
                  <span className="font-medium">{PIPELINE_STAGE_LABELS[s]}</span>
                  <span className="text-muted-foreground"> wird übersprungen</span>
                </Label>
              </li>
            ))}
          </ul>

          <AlertDialogFooter>
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Abbrechen
            </Button>
            <Button
              onClick={async () => {
                if (!allChecked) return;
                setBusy(true);
                try {
                  await onConfirm();
                  if (leadId) {
                    await createActivity.mutateAsync({
                      type: 'notiz',
                      content: `Stage-Sprung: ${fromLabel} → ${targetLabel}. Übersprungen: ${skippedStages
                        .map((s) => PIPELINE_STAGE_LABELS[s])
                        .join(', ')}`,
                      lead_id: leadId,
                      metadata: {
                        stage_skip: true,
                        from_stage: transition.fromStage,
                        to_stage: transition.toStage,
                        skipped_stages: skippedStages,
                      },
                    });
                  }
                  toast.success('Sprung dokumentiert', {
                    description: `Übersprungen: ${skippedStages.length} Stage${skippedStages.length > 1 ? 's' : ''}`,
                  });
                  setSkipAcknowledged(true);
                } catch (e) {
                  console.error('Stage-Skip fehlgeschlagen', e);
                  toast.error('Sprung konnte nicht gespeichert werden');
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy || !allChecked}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {busy ? 'Speichert…' : 'Sprung bestätigen & verschieben'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (isBackward) {
    const fromLabel = transition.fromStage ? PIPELINE_STAGE_LABELS[transition.fromStage] : '';
    const noteValid = backwardNote.trim().length >= 10;
    const handleBackward = async () => {
      if (!noteValid) return;
      setBusy(true);
      try {
        await onConfirm();
        if (leadId) {
          const reason = backwardNote.trim();
          await createActivity.mutateAsync({
            type: 'notiz',
            content: `Stage rückwärts verschoben: ${fromLabel} → ${targetLabel}\nGrund: ${reason}`,
            lead_id: leadId,
            metadata: {
              backward_move: true,
              from_stage: transition.fromStage,
              to_stage: transition.toStage,
              reason,
            },
          });
        }
        toast.success('Lead zurückgesetzt', {
          description: `Notiz dokumentiert (${fromLabel} → ${targetLabel}).`,
        });
      } catch (e) {
        console.error('Backward-Move fehlgeschlagen', e);
        toast.error('Rückwärts-Wechsel konnte nicht gespeichert werden');
      } finally {
        setBusy(false);
      }
    };

    return (
      <AlertDialog open onOpenChange={(o) => !o && !busy && onCancel()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Lead in vorherige Phase verschieben?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Du verschiebst den Lead von <strong>{fromLabel}</strong> zurück zu{' '}
              <strong>{targetLabel}</strong>. Bitte dokumentiere den Grund (mind. 10 Zeichen) – das hilft Coaching und Audit.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="backward-note" className="text-sm font-medium">
              Grund für Rückstufung <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="backward-note"
              value={backwardNote}
              onChange={(e) => setBackwardNote(e.target.value)}
              placeholder="z. B. Kunde will Angebot nochmals überarbeiten lassen, Termin geplatzt, weitere Discovery nötig …"
              rows={4}
              maxLength={500}
              disabled={busy}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-right tabular-nums">
              {backwardNote.trim().length}/500 · mindestens 10 Zeichen
            </p>
          </div>

          <AlertDialogFooter>
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Abbrechen
            </Button>
            <Button
              onClick={handleBackward}
              disabled={busy || !noteValid}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {busy ? 'Speichert…' : 'Rückstufung speichern'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }


  // Wenn keine Konfiguration für diese Stage → direkt bestätigen
  if (!config) {
    return (
      <AlertDialog open onOpenChange={(o) => !o && onCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>In „{targetLabel}" verschieben?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Abbrechen
            </Button>
            <Button
              onClick={async () => {
                setBusy(true);
                await onConfirm();
                setBusy(false);
              }}
              disabled={busy}
            >
              Verschieben
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const handleAction = async (action: StageTransitionAction) => {
    if (action.kind === 'cancel') {
      onCancel();
      return;
    }

    setBusy(true);
    try {
      // 1. Stage-Wechsel ausführen
      await onConfirm();

      // 2. Folgeaktion
      switch (action.kind) {
        case 'open_calendar':
          navigate(leadId ? `/app/calls?lead=${leadId}` : '/app/calls');
          break;
        case 'open_email':
          navigate(leadId ? `/app/inbox?lead=${leadId}` : '/app/inbox');
          break;
        case 'create_task':
          if (leadId) {
            await createTask({
              type: 'followup',
              title: `Aufgabe nach Wechsel in „${targetLabel}"`,
              lead_id: leadId,
              assigned_user_id: assignedUserId,
            });
            toast.success('Aufgabe angelegt');
          }
          break;
        case 'open_offer':
          navigate(leadId ? `/app/offers?lead=${leadId}` : '/app/offers');
          break;
        case 'create_offer':
          navigate(leadId ? `/app/offers/new?lead=${leadId}` : '/app/offers');
          break;
        case 'plan_followup': {
          if (leadId) {
            const due = new Date();
            due.setHours(due.getHours() + action.hours);
            await createTask({
              type: 'followup',
              title: `Follow-up zum Angebot (${action.hours}h)`,
              lead_id: leadId,
              due_at: due.toISOString(),
              assigned_user_id: assignedUserId,
            });
            toast.success(`Follow-up in ${action.hours}h geplant`);
          }
          break;
        }
        case 'plan_followup_manual':
          if (leadId) navigate(`/app/crm?lead=${leadId}&tab=tasks`);
          break;
        case 'plan_second_call':
          navigate(leadId ? `/app/calls?lead=${leadId}` : '/app/calls');
          break;
        case 'document_objection':
          if (leadId) {
            await createActivity.mutateAsync({
              type: 'notiz',
              content: 'Einwand dokumentiert nach Wechsel in „Follow-up & Abschlussphase"',
              lead_id: leadId,
            });
            toast.success('Einwand-Notiz erstellt');
          }
          break;
        case 'verify_payment':
          navigate('/app/coo');
          break;
        case 'start_onboarding':
          if (leadId) navigate(`/app/customers?lead=${leadId}`);
          else navigate('/app/customers');
          break;
        case 'later':
          // nichts weiter
          break;
      }
    } catch (e) {
      console.error('Stage-Folgeaktion fehlgeschlagen', e);
      toast.error('Folgeaktion konnte nicht ausgeführt werden');
    } finally {
      setBusy(false);
    }
  };

  const handleLost = async () => {
    if (!leadId) {
      onCancel();
      return;
    }
    setBusy(true);
    try {
      await onConfirm();
      const note = `Verlustgrund: ${lossReason} (${new Date().toLocaleString('de-DE')})`;
      await onUpdateLeadNotes(leadId, note);
      await createActivity.mutateAsync({
        type: 'notiz',
        content: `Lead verloren – Grund: ${lossReason}`,
        lead_id: leadId,
        metadata: { loss_reason: lossReason, transitioned_to: 'lost' },
      });
      toast.success('Verlustgrund dokumentiert');
    } catch (e) {
      console.error(e);
      toast.error('Verlustgrund konnte nicht gespeichert werden');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(o) => !o && !busy && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{config.question}</AlertDialogTitle>
          <AlertDialogDescription>
            Wechsel{' '}
            {transition.fromStage && (
              <>
                von <strong>{PIPELINE_STAGE_LABELS[transition.fromStage]}</strong>{' '}
              </>
            )}
            zu <strong>{targetLabel}</strong>.
            {config.description && <span className="block mt-2 text-xs">{config.description}</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {config.lossReasonPicker && (
          <RadioGroup value={lossReason} onValueChange={setLossReason} className="space-y-2 py-2">
            {LOSS_REASONS.map((r) => (
              <div key={r} className="flex items-center space-x-2">
                <RadioGroupItem value={r} id={`loss-${r}`} />
                <Label htmlFor={`loss-${r}`} className="cursor-pointer">
                  {r}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-2">
          {config.lossReasonPicker ? (
            <>
              <Button variant="ghost" onClick={onCancel} disabled={busy}>
                Abbrechen
              </Button>
              <Button onClick={handleLost} disabled={busy || !leadId}>
                Speichern &amp; verschieben
              </Button>
            </>
          ) : (
            <TooltipProvider>
              <Button variant="ghost" onClick={onCancel} disabled={busy}>
                Abbrechen
              </Button>
              {config.actions.map((a, idx) => {
                const btn = (
                  <Button
                    key={`${a.label}-${idx}`}
                    variant={a.variant ?? 'outline'}
                    disabled={busy || a.disabled}
                    onClick={() => handleAction(a.action)}
                  >
                    {a.label}
                  </Button>
                );
                if (a.disabled && a.disabledReason) {
                  return (
                    <Tooltip key={`${a.label}-${idx}`}>
                      <TooltipTrigger asChild>
                        <span>{btn}</span>
                      </TooltipTrigger>
                      <TooltipContent>{a.disabledReason}</TooltipContent>
                    </Tooltip>
                  );
                }
                return btn;
              })}
            </TooltipProvider>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
