import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import {
  ChevronRight, ChevronLeft, List, LayoutGrid, CheckCircle2,
  MessageSquare, Search, Presentation, ShieldCheck, Save,
  Lightbulb, AlertTriangle, TrendingUp, FileText, Zap,
} from 'lucide-react';
import { PainPointDiscovery } from './PainPointDiscovery';
import { getPhaseCoaching, analyzeNotes, type AiSuggestion } from '@/lib/sales-guide-ai';
import { OBJECTION_HANDLING, GOLDEN_RULES, TRIAGE_SCRIPT, STRATEGY_SCRIPT, COLD_CALL_SCRIPT } from '@/lib/sales-scripts';
import type { DiscoveryData, OfferContent } from '@/types/offers';

// =============================================
// Types
// =============================================

interface GuideCheckItem {
  id: string;
  label: string;
  hint?: string;
  script?: string;
  checked: boolean;
}

interface PhaseData {
  notes: string;
  checklist: GuideCheckItem[];
}

interface SalesGuideWizardProps {
  offerJson: OfferContent;
  onSaveDiscovery: (data: DiscoveryData) => void;
  onSaveNotes: (phaseNotes: Record<string, PhaseData>) => void;
  onCreateDeal?: (discoveryData: DiscoveryData | null, phaseNotes: Record<string, PhaseData>) => void;
  structogramType?: import('@/lib/sales-guide-ai').StructogramType | null;
  callType?: 'triage' | 'strategy' | 'cold';
}

// =============================================
// Phase Definitions with Scripts
// =============================================

const PHASES = [
  {
    id: 'rapport',
    title: 'Begrüßung & Rapport',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Vertrauen aufbauen, Gesprächsrahmen setzen',
    defaultChecklist: [
      { id: 'r1', label: 'Persönliche Begrüßung', hint: 'Name nennen, Wertschätzung zeigen', script: 'Hey [Name], lass uns keine Zeit verlieren. Ich will herausfinden, ob und wie ich dir helfen kann.' },
      { id: 'r2', label: 'Gesprächsrahmen setzen', hint: '"In den nächsten X Min schauen wir gemeinsam..."', script: 'Wenn ja, planen wir den nächsten Schritt. Wenn nein, sag ich dir das ehrlich. Deal?' },
      { id: 'r3', label: 'Situation erfragen', hint: 'Was machst du, wie lange, wie viele Leute?', script: 'Erzähl mir kurz: Was machst du genau und wie lange schon? Wie viele Leute arbeiten bei dir?' },
      { id: 'r4', label: 'Auslöser verstehen', hint: 'Warum hat die Person reagiert?', script: 'Was war der Hauptgrund, warum du auf meine Nachricht reagiert hast?' },
      { id: 'r5', label: 'Zeitrahmen bestätigen', hint: 'Verfügbarkeit des Kunden sicherstellen' },
    ],
  },
  {
    id: 'discovery',
    title: 'Bedarfsermittlung & Pain Points',
    icon: <Search className="h-5 w-5" />,
    description: 'Probleme identifizieren, Schmerzpunkte bewerten',
    defaultChecklist: [
      { id: 'd1', label: 'Operatives Problem identifizieren', hint: 'Größter Engpass im Alltag', script: 'Was ist gerade dein größtes operatives Problem?' },
      { id: 'd2', label: 'Zeitverlust quantifizieren', hint: 'Stunden pro Woche messbar machen', script: 'Wie viele Stunden pro Woche verbringst du mit Dingen, die eigentlich ein System machen sollte?' },
      { id: 'd3', label: 'Kosten des Problems beziffern', hint: 'Monatlicher Verlust in Euro', script: 'Was kostet dich das im Monat? Rechnen wir mal zusammen: [X] Stunden × Stundensatz = [Y] €.' },
      { id: 'd4', label: 'Konsequenz aufzeigen', hint: 'Was passiert bei Nichtstun?', script: 'Was passiert, wenn du so weitermachst wie bisher? Auf 12 Monate: Das sind [Z] €.' },
      { id: 'd5', label: 'Budget & Entscheider klären', hint: 'Entscheidungsfähigkeit prüfen', script: 'Bist du der Entscheider? Hast du grundsätzlich Budget für eine Lösung eingeplant? Wärst du bereit, in den nächsten 30 Tagen etwas zu verändern?' },
    ],
  },
  {
    id: 'presentation',
    title: 'Lösungspräsentation & Angebot',
    icon: <Presentation className="h-5 w-5" />,
    description: 'Passende Lösung vorstellen, Preise präsentieren',
    defaultChecklist: [
      { id: 'p1', label: 'Zielbild aufbauen (Future Pacing)', hint: 'Kunde soll das Ergebnis spüren', script: 'Stell dir vor, in 90 Tagen: Dein Team arbeitet eigenständig. Du hast 2 Tage pro Woche zurück. Was würdest du mit dieser Zeit machen?' },
      { id: 'p2', label: 'Lösung vorstellen', hint: 'Signature System als Done-with-you', script: 'Wir bauen das System GEMEINSAM in dein Unternehmen. 30 Tage. Ab Tag 1 Ergebnisse. Das ist kein Kurs, kein Coaching von der Seitenlinie.' },
      { id: 'p3', label: 'Case Study nennen', hint: 'Konkretes Beispiel mit Ergebnis', script: 'Case Study: [Name] hatte das gleiche Problem. Nach 4 Wochen: [konkretes Ergebnis].' },
      { id: 'p4', label: 'Preis im Kontext präsentieren', hint: 'Investition vs. monatlicher Verlust', script: 'Die Investition liegt bei [Betrag]. Verglichen mit [monatlicher Verlust] × 12 = [Jahresverlust] ist das ein klarer Business Case.' },
      { id: 'p5', label: 'Zahlungsoptionen erklären', hint: 'Ratenzahlung, Finanzierung', script: 'Ratenzahlung und Signature Transformation Finanzierung sind möglich – bis zu 250.000 €.' },
    ],
  },
  {
    id: 'closing',
    title: 'Einwandbehandlung & Closing',
    icon: <ShieldCheck className="h-5 w-5" />,
    description: 'Einwände entkräften, Abschluss herbeiführen',
    defaultChecklist: [
      { id: 'c1', label: 'Zusammenfassung geben', hint: 'Problem, Kosten, Lösung, Ergebnis', script: 'Ok [Name], ich fasse zusammen: [Problem], [Kosten pro Monat], [unsere Lösung], [erwartetes Ergebnis].' },
      { id: 'c2', label: 'Einwände aktiv erfragen', hint: 'Nicht warten, direkt fragen', script: 'Was hält dich davon ab, heute zu starten?' },
      { id: 'c3', label: 'Einwände behandeln', hint: 'Big 5 Konter nutzen (siehe unten)' },
      { id: 'c4', label: 'Abschlussfrage stellen', hint: 'Direkt, klar, keine Umwege', script: 'Sollen wir das aufsetzen? Wenn ja: Ich schicke dir jetzt das Angebot, wir starten nächste Woche.' },
      { id: 'c5', label: 'Nächste Schritte vereinbaren', hint: 'Termin, Angebot, Deadline', script: 'Das Angebot steht 48 Stunden. Wann können wir starten – Montag oder Mittwoch?' },
    ],
  },
];

// =============================================
// Component
// =============================================

export function SalesGuideWizard({ offerJson, onSaveDiscovery, onSaveNotes, onCreateDeal, structogramType, callType }: SalesGuideWizardProps) {
  const [activePhase, setActivePhase] = useState(0);
  const [viewMode, setViewMode] = useState<'wizard' | 'overview'>('wizard');
  const [discoveryCompleted, setDiscoveryCompleted] = useState(!!offerJson.discovery_data);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(offerJson.discovery_data || null);
  const [showScripts, setShowScripts] = useState(false);

  const [phaseData, setPhaseData] = useState<Record<string, PhaseData>>(() => {
    const initial: Record<string, PhaseData> = {};
    PHASES.forEach((phase) => {
      initial[phase.id] = {
        notes: '',
        checklist: phase.defaultChecklist.map((c) => ({ ...c, checked: false })),
      };
    });
    return initial;
  });

  const toggleCheck = useCallback((phaseId: string, itemId: string) => {
    setPhaseData((prev) => ({
      ...prev,
      [phaseId]: {
        ...prev[phaseId],
        checklist: prev[phaseId].checklist.map((c) =>
          c.id === itemId ? { ...c, checked: !c.checked } : c
        ),
      },
    }));
  }, []);

  const updateNotes = useCallback((phaseId: string, notes: string) => {
    setPhaseData((prev) => ({
      ...prev,
      [phaseId]: { ...prev[phaseId], notes },
    }));
  }, []);

  const handleDiscoveryComplete = (data: DiscoveryData) => {
    setDiscoveryData(data);
    setDiscoveryCompleted(true);
    onSaveDiscovery(data);
  };

  const handleSaveAll = () => {
    onSaveNotes(phaseData);
  };

  const getPhaseProgress = (phaseId: string) => {
    const pd = phaseData[phaseId];
    if (!pd) return 0;
    const total = pd.checklist.length;
    const done = pd.checklist.filter((c) => c.checked).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const currentPhase = PHASES[activePhase];

  // =============================================
  // Render: Overview Mode
  // =============================================
  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {PHASES.map((phase, idx) => {
        const progress = getPhaseProgress(phase.id);
        const isComplete = progress === 100;
        return (
          <Card
            key={phase.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isComplete && 'border-primary/30 bg-primary/5'
            )}
            onClick={() => { setActivePhase(idx); setViewMode('wizard'); }}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'flex items-center justify-center h-10 w-10 rounded-full shrink-0',
                  isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {isComplete ? <CheckCircle2 className="h-5 w-5" /> : phase.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-sm">{phase.title}</h3>
                    <Badge variant={isComplete ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {progress}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // =============================================
  // Render: Objection Handling Accordion
  // =============================================
  const renderObjectionHandling = () => (
    <Card className="border-destructive/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-destructive" />
          Einwandbehandlung – Big 5
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {OBJECTION_HANDLING.map((obj) => (
            <AccordionItem key={obj.id} value={obj.id}>
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <span>{obj.emoji}</span>
                  <span className="font-medium">„{obj.objection}"</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs font-medium text-primary">Reframe:</p>
                  <p className="text-sm font-medium">{obj.reframe}</p>
                </div>
                <div className="space-y-1.5">
                  {obj.response.map((line, i) => (
                    <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary shrink-0 mt-0.5">→</span>
                      {line}
                    </p>
                  ))}
                </div>
                <p className="text-xs italic text-muted-foreground border-t pt-2">
                  🧠 {obj.psychology}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Golden Rules */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs font-medium mb-2 flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            6 Goldene Regeln
          </p>
          <ol className="space-y-1">
            {GOLDEN_RULES.map((rule, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {i + 1}. {rule}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );

  // =============================================
  // Render: Wizard Mode
  // =============================================
  const renderWizard = () => {
    const pd = phaseData[currentPhase.id];
    const isDiscoveryPhase = currentPhase.id === 'discovery';
    const isClosingPhase = currentPhase.id === 'closing';

    return (
      <div className="space-y-4">
        {/* Phase header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
            {currentPhase.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{currentPhase.title}</h3>
            <p className="text-sm text-muted-foreground">{currentPhase.description}</p>
          </div>
          <Button
            variant={showScripts ? 'default' : 'outline'}
            size="sm"
            className="text-xs h-7"
            onClick={() => setShowScripts(!showScripts)}
          >
            <FileText className="h-3 w-3 mr-1" />
            Skripte
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1">
          {PHASES.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors cursor-pointer',
                i <= activePhase ? 'bg-primary' : 'bg-muted'
              )}
              onClick={() => setActivePhase(i)}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Phase {activePhase + 1} von {PHASES.length}
        </p>

        {/* Checklist */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Checkliste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pd.checklist.map((item) => (
              <label
                key={item.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  item.checked
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-card border-border hover:bg-muted/50'
                )}
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleCheck(currentPhase.id, item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', item.checked && 'line-through text-muted-foreground')}>
                    {item.label}
                  </p>
                  {item.hint && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.hint}</p>
                  )}
                  {showScripts && item.script && (
                    <div className="mt-2 p-2 bg-muted/50 rounded border border-dashed text-xs text-muted-foreground italic">
                      💬 „{item.script}"
                    </div>
                  )}
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Discovery Module (only in discovery phase) */}
        {isDiscoveryPhase && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4" />
                Pain-Point Analyse
                {discoveryCompleted && (
                  <Badge variant="default" className="text-xs ml-auto">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Abgeschlossen
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {discoveryCompleted && discoveryData ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {discoveryData.pain_points.filter((p) => p.selected).length} Pain Points identifiziert ·
                    Empfehlung: <span className="font-medium text-foreground">
                      {discoveryData.recommended_mode === 'rocket_performance' ? '🚀 Rocket Performance' : '⚡ Performance'}
                    </span>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDiscoveryCompleted(false)}
                  >
                    Erneut durchführen
                  </Button>
                </div>
              ) : (
                <PainPointDiscovery
                  onComplete={handleDiscoveryComplete}
                  initialData={discoveryData ? discoveryData : offerJson.discovery_data}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Objection Handling (only in closing phase) */}
        {isClosingPhase && renderObjectionHandling()}

        {/* AI Coaching Panel */}
        {structogramType && structogramType !== 'mixed' && structogramType !== 'unknown' && (() => {
          const coaching = getPhaseCoaching(structogramType, currentPhase.id);
          return (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  KI-Coaching ({structogramType === 'rot' ? 'Zielorientiert' : structogramType === 'gruen' ? 'Sicherheitsorientiert' : 'Analytisch'})
                </div>
                <p className="text-xs text-muted-foreground">{coaching.greeting}</p>
                <ul className="space-y-1">
                  {coaching.tips.map((tip, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5">
                      <TrendingUp className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
                {coaching.avoidPhrases.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs font-medium flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-3 w-3" /> Vermeiden:
                    </p>
                    {coaching.avoidPhrases.map((p, i) => (
                      <p key={i} className="text-xs text-muted-foreground italic ml-4">"{p}"</p>
                    ))}
                  </div>
                )}
                <p className="text-xs pt-1">
                  <span className="font-medium">Closing-Stil:</span>{' '}
                  <span className="text-muted-foreground">{coaching.closingStyle}</span>
                </p>
              </CardContent>
            </Card>
          );
        })()}

        {/* AI Note Suggestions */}
        {(() => {
          const allNotes = Object.values(phaseData).map(p => p.notes).join(' ');
          if (allNotes.trim().length < 10) return null;
          const suggestions = analyzeNotes(allNotes);
          if (suggestions.length === 0) return null;
          return (
            <Card className="border-dashed">
              <CardContent className="pt-3 space-y-1.5">
                <p className="text-xs font-medium flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-primary" /> KI-Hinweise aus Ihren Notizen
                </p>
                {suggestions.map((s, i) => (
                  <p key={i} className={cn(
                    'text-xs flex items-start gap-1.5',
                    s.type === 'warning' && 'text-destructive',
                    s.type === 'opportunity' && 'text-primary',
                  )}>
                    {s.type === 'warning' ? <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" /> :
                     s.type === 'opportunity' ? <TrendingUp className="h-3 w-3 shrink-0 mt-0.5" /> :
                     <Lightbulb className="h-3 w-3 shrink-0 mt-0.5" />}
                    {s.text}
                  </p>
                ))}
              </CardContent>
            </Card>
          );
        })()}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Gesprächsnotizen zu dieser Phase</label>
          <Textarea
            placeholder={`Notizen für "${currentPhase.title}"...`}
            value={pd.notes}
            onChange={(e) => updateNotes(currentPhase.id, e.target.value)}
            rows={3}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActivePhase((p) => p - 1)}
            disabled={activePhase === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveAll}>
            <Save className="h-4 w-4 mr-1" />
            Speichern
          </Button>
          {activePhase < PHASES.length - 1 ? (
            <Button size="sm" onClick={() => setActivePhase((p) => p + 1)}>
              Weiter
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleSaveAll}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Abschließen
              </Button>
              {onCreateDeal && (
                <Button size="sm" onClick={() => onCreateDeal(discoveryData, phaseData)}>
                  <FileText className="h-4 w-4 mr-1" />
                  Angebot erstellen
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // =============================================
  // Main Render
  // =============================================
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Gesprächsleitfaden
          </CardTitle>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <Button
              variant={viewMode === 'wizard' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('wizard')}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              Wizard
            </Button>
            <Button
              variant={viewMode === 'overview' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('overview')}
            >
              <List className="h-3.5 w-3.5 mr-1" />
              Übersicht
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {viewMode === 'wizard' ? renderWizard() : renderOverview()}
      </CardContent>
    </Card>
  );
}
