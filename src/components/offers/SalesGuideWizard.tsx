import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ChevronRight, ChevronLeft, List, LayoutGrid, CheckCircle2,
  MessageSquare, Search, Presentation, ShieldCheck, Save,
  Lightbulb, AlertTriangle, TrendingUp, FileText,
} from 'lucide-react';
import { PainPointDiscovery } from './PainPointDiscovery';
import { getPhaseCoaching, analyzeNotes, type AiSuggestion } from '@/lib/sales-guide-ai';
import type { DiscoveryData, OfferContent } from '@/types/offers';

// =============================================
// Types
// =============================================

interface GuideCheckItem {
  id: string;
  label: string;
  hint?: string;
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
  /** Called from Call context to create a deal + offer after closing phase */
  onCreateDeal?: (discoveryData: DiscoveryData | null, phaseNotes: Record<string, PhaseData>) => void;
  /** Structogram type for dynamic coaching */
  structogramType?: import('@/lib/sales-guide-ai').StructogramType | null;
}

// =============================================
// Phase Definitions
// =============================================

const PHASES = [
  {
    id: 'rapport',
    title: 'Begrüßung & Rapport',
    icon: <MessageSquare className="h-5 w-5" />,
    description: 'Vertrauen aufbauen, Gesprächsrahmen setzen',
    defaultChecklist: [
      { id: 'r1', label: 'Persönliche Begrüßung', hint: 'Name nennen, Wertschätzung zeigen' },
      { id: 'r2', label: 'Small Talk / Eisbrecher', hint: 'Gemeinsamkeiten finden, Branche ansprechen' },
      { id: 'r3', label: 'Gesprächsrahmen setzen', hint: '"In den nächsten 30 Min schauen wir gemeinsam..."' },
      { id: 'r4', label: 'Erwartungen klären', hint: 'Was erhofft sich der Kunde vom Gespräch?' },
      { id: 'r5', label: 'Zeitrahmen bestätigen', hint: 'Verfügbarkeit des Kunden sicherstellen' },
    ],
  },
  {
    id: 'discovery',
    title: 'Bedarfsermittlung & Pain Points',
    icon: <Search className="h-5 w-5" />,
    description: 'Probleme identifizieren, Schmerzpunkte bewerten',
    defaultChecklist: [
      { id: 'd1', label: 'Aktuelle Situation erfragen', hint: '"Wie sieht Ihr Alltag aktuell aus?"' },
      { id: 'd2', label: 'Hauptprobleme identifizieren', hint: 'Pain-Point Discovery Modul nutzen' },
      { id: 'd3', label: 'Auswirkungen quantifizieren', hint: '"Was kostet Sie das Problem monatlich?"' },
      { id: 'd4', label: 'Bisherige Lösungsversuche', hint: '"Was haben Sie bereits probiert?"' },
      { id: 'd5', label: 'Entscheidungsstruktur klären', hint: 'Wer entscheidet? Budget-Rahmen?' },
    ],
  },
  {
    id: 'presentation',
    title: 'Lösungspräsentation & Angebot',
    icon: <Presentation className="h-5 w-5" />,
    description: 'Passende Lösung vorstellen, Preise präsentieren',
    defaultChecklist: [
      { id: 'p1', label: 'Zusammenfassung der Probleme', hint: 'Pain Points spiegeln, Verständnis zeigen' },
      { id: 'p2', label: 'Lösung vorstellen', hint: 'Programm-Empfehlung auf Basis der Analyse' },
      { id: 'p3', label: 'Ergebnisse & Fallstudien', hint: 'Konkrete Erfolgsbeispiele nennen' },
      { id: 'p4', label: 'Preis & Konditionen', hint: 'Investition im Verhältnis zum Problem darstellen' },
      { id: 'p5', label: 'Zahlungsoptionen erklären', hint: 'Ratenzahlung, Einmalzahlung etc.' },
    ],
  },
  {
    id: 'closing',
    title: 'Einwandbehandlung & Closing',
    icon: <ShieldCheck className="h-5 w-5" />,
    description: 'Einwände entkräften, Abschluss herbeiführen',
    defaultChecklist: [
      { id: 'c1', label: 'Einwände aktiv erfragen', hint: '"Was hält Sie davon ab, heute zu starten?"' },
      { id: 'c2', label: 'Preis-Einwand behandeln', hint: 'ROI-Rechnung: Kosten vs. Verlust ohne Lösung' },
      { id: 'c3', label: 'Zeit-Einwand behandeln', hint: '"Wann wäre der perfekte Zeitpunkt?" → Jetzt' },
      { id: 'c4', label: 'Abschlussfrage stellen', hint: '"Sollen wir gemeinsam starten?"' },
      { id: 'c5', label: 'Nächste Schritte vereinbaren', hint: 'Angebot senden, Folgetermin, Vertrag' },
    ],
  },
];

// =============================================
// Component
// =============================================

export function SalesGuideWizard({ offerJson, onSaveDiscovery, onSaveNotes, onCreateDeal, structogramType }: SalesGuideWizardProps) {
  const [activePhase, setActivePhase] = useState(0);
  const [viewMode, setViewMode] = useState<'wizard' | 'overview'>('wizard');
  const [discoveryCompleted, setDiscoveryCompleted] = useState(!!offerJson.discovery_data);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(offerJson.discovery_data || null);

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
                  {/* Progress bar */}
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
  // Render: Wizard Mode
  // =============================================
  const renderWizard = () => {
    const pd = phaseData[currentPhase.id];
    const isDiscoveryPhase = currentPhase.id === 'discovery';

    return (
      <div className="space-y-4">
        {/* Phase header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground">
            {currentPhase.icon}
          </div>
          <div>
            <h3 className="font-semibold">{currentPhase.title}</h3>
            <p className="text-sm text-muted-foreground">{currentPhase.description}</p>
          </div>
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
            <Button size="sm" onClick={handleSaveAll}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Abschließen
            </Button>
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
