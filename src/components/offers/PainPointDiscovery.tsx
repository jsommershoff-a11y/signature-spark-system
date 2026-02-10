import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, AlertTriangle, DollarSign, Clock, Brain, Users } from 'lucide-react';
import type { DiscoveryData, DiscoveryPainPoint, BudgetResponse, UrgencyLevel, StructogramQuickType, TeamAvailability, OfferMode } from '@/types/offers';

const PAIN_POINT_OPTIONS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'vertrieb', label: 'Vertrieb / Lead-Generierung', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'closing', label: 'Abschlussquote / Closing', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'prozesse', label: 'Prozesse / Workflows', icon: <Clock className="h-4 w-4" /> },
  { id: 'fuehrung', label: 'Führung / Delegation', icon: <Users className="h-4 w-4" /> },
  { id: 'sichtbarkeit', label: 'Sichtbarkeit / Marketing', icon: <Brain className="h-4 w-4" /> },
  { id: 'retention', label: 'Kundenbindung / Retention', icon: <Users className="h-4 w-4" /> },
];

const BUDGET_RANGES = ['3.000 – 5.000 €', '5.000 – 10.000 €', '10.000+ €', 'Noch offen'];
const URGENCY_OPTIONS: { value: UrgencyLevel; label: string }[] = [
  { value: 'sofort', label: 'Sofort' },
  { value: '2_4_wochen', label: 'In 2–4 Wochen' },
  { value: '1_3_monate', label: 'In 1–3 Monaten' },
];
const STRUCTOGRAM_OPTIONS: { value: StructogramQuickType; label: string; color: string; desc: string }[] = [
  { value: 'rot', label: 'ROT', color: 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400', desc: 'Direkt, ergebnisorientiert, entschlossen' },
  { value: 'gruen', label: 'GRÜN', color: 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400', desc: 'Sicherheitsbewusst, strukturiert, loyal' },
  { value: 'blau', label: 'BLAU', color: 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400', desc: 'Analytisch, datengetrieben, sachlich' },
  { value: 'mixed', label: 'Gemischt', color: 'bg-muted border-border text-foreground', desc: 'Keine klare Tendenz erkennbar' },
];
const TEAM_OPTIONS: { value: TeamAvailability; label: string }[] = [
  { value: 'ja', label: 'Ja' },
  { value: 'teilweise', label: 'Teilweise' },
  { value: 'nein', label: 'Nein' },
];

interface PainPointDiscoveryProps {
  onComplete: (data: DiscoveryData) => void;
  initialData?: Partial<DiscoveryData>;
}

export function PainPointDiscovery({ onComplete, initialData }: PainPointDiscoveryProps) {
  const [step, setStep] = useState(0);
  const [painPoints, setPainPoints] = useState<DiscoveryPainPoint[]>(
    initialData?.pain_points || PAIN_POINT_OPTIONS.map(o => ({ id: o.id, label: o.label, selected: false }))
  );
  const [budget1, setBudget1] = useState<BudgetResponse>(initialData?.budget_responses?.[0] || { question: 'Was wäre Ihnen eine funktionierende Lösung wert?', range: '', freetext: '' });
  const [budget2, setBudget2] = useState<BudgetResponse>(initialData?.budget_responses?.[1] || { question: 'Zweite Budget-Rückfrage (Konsistenzprüfung)', range: '', freetext: '' });
  const [urgency, setUrgency] = useState<UrgencyLevel>(initialData?.urgency || 'sofort');
  const [structogramType, setStructogramType] = useState<StructogramQuickType>(initialData?.structogram_type || 'rot');
  const [hasTeam, setHasTeam] = useState<TeamAvailability>(initialData?.has_team || 'teilweise');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const totalSteps = 5;

  const togglePainPoint = (id: string) => {
    setPainPoints(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const getRecommendedMode = (): OfferMode => {
    // Recommend Rocket Performance if: no team, high budget, or many pain points
    const selectedCount = painPoints.filter(p => p.selected).length;
    const highBudget = budget1.range === '10.000+ €' || budget2.range === '10.000+ €';
    const noTeam = hasTeam === 'nein';
    if (highBudget || noTeam || selectedCount >= 4) return 'rocket_performance';
    return 'performance';
  };

  const handleComplete = () => {
    const recommended = getRecommendedMode();
    onComplete({
      pain_points: painPoints,
      budget_responses: [budget1, budget2],
      urgency,
      structogram_type: structogramType,
      has_team: hasTeam,
      recommended_mode: recommended,
      notes,
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Pain Points
        return (
          <div className="space-y-3">
            <h3 className="font-medium">Welche Bereiche performen aktuell nicht?</h3>
            <p className="text-sm text-muted-foreground">Mehrfachauswahl möglich</p>
            <div className="grid grid-cols-2 gap-2">
              {PAIN_POINT_OPTIONS.map(opt => {
                const pp = painPoints.find(p => p.id === opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => togglePainPoint(opt.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-colors',
                      pp?.selected
                        ? 'bg-primary/10 border-primary text-foreground'
                        : 'bg-card border-border hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 1: // Budget
        return (
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="font-medium">Budget-Einschätzung (1. Rückfrage)</h3>
              <p className="text-sm text-muted-foreground">"Was wäre Ihnen eine funktionierende Lösung wert?"</p>
              <div className="flex flex-wrap gap-2">
                {BUDGET_RANGES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBudget1(prev => ({ ...prev, range: r }))}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-sm transition-colors',
                      budget1.range === r ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-muted'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Freitext-Antwort des Kunden..."
                value={budget1.freetext || ''}
                onChange={e => setBudget1(prev => ({ ...prev, freetext: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Budget-Einschätzung (2. Rückfrage)</h3>
              <p className="text-sm text-muted-foreground">Konsistenzprüfung – gleiche Frage, späterer Zeitpunkt</p>
              <div className="flex flex-wrap gap-2">
                {BUDGET_RANGES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBudget2(prev => ({ ...prev, range: r }))}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-sm transition-colors',
                      budget2.range === r ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-muted'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Freitext-Antwort des Kunden..."
                value={budget2.freetext || ''}
                onChange={e => setBudget2(prev => ({ ...prev, freetext: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
        );
      case 2: // Urgency
        return (
          <div className="space-y-3">
            <h3 className="font-medium">Wie schnell soll die Umsetzung starten?</h3>
            <div className="flex flex-wrap gap-2">
              {URGENCY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUrgency(opt.value)}
                  className={cn(
                    'px-4 py-3 rounded-lg border text-sm transition-colors',
                    urgency === opt.value ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-muted'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 3: // Structogram
        return (
          <div className="space-y-3">
            <h3 className="font-medium">Structogram-Schnelleinschätzung</h3>
            <p className="text-sm text-muted-foreground">Entscheidungsstil des Kunden</p>
            <div className="grid grid-cols-2 gap-2">
              {STRUCTOGRAM_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStructogramType(opt.value)}
                  className={cn(
                    'p-3 rounded-lg border text-sm text-left transition-colors',
                    structogramType === opt.value ? opt.color : 'bg-card border-border hover:bg-muted'
                  )}
                >
                  <span className="font-medium">{opt.label}</span>
                  <p className="text-xs mt-1 opacity-80">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 4: // Team + Notes
        return (
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="font-medium">Gibt es ein internes Team für die Umsetzung?</h3>
              <div className="flex gap-2">
                {TEAM_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHasTeam(opt.value)}
                    className={cn(
                      'px-4 py-3 rounded-lg border text-sm transition-colors flex-1',
                      hasTeam === opt.value ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-muted'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Zusätzliche Notizen</h3>
              <Textarea
                placeholder="Sonstige Beobachtungen aus dem Erstgespräch..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            {/* Recommendation preview */}
            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <p className="text-sm font-medium mb-1">Empfehlung basierend auf Eingaben:</p>
                <Badge variant="outline" className="text-sm">
                  {getRecommendedMode() === 'performance' ? '⚡ Performance' : '🚀 Rocket Performance'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= step ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Schritt {step + 1} von {totalSteps}</p>

      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
        {step < totalSteps - 1 ? (
          <Button
            type="button"
            size="sm"
            onClick={() => setStep(s => s + 1)}
          >
            Weiter
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={handleComplete}>
            Bedarfsermittlung abschließen
          </Button>
        )}
      </div>
    </div>
  );
}
