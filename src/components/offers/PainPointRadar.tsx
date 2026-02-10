import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { PAIN_POINT_LABELS, PAIN_POINT_MODULE_MAP, PAIN_POINT_SOLUTION_TEXTS, getModuleById } from '@/lib/offer-modules';
import type { DiscoveryData, OfferMode } from '@/types/offers';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PainPointRadarProps {
  discoveryData: DiscoveryData;
  selectedModules?: string[];
  offerMode?: OfferMode;
}

const RADAR_AXES = ['vertrieb', 'closing', 'prozesse', 'fuehrung', 'sichtbarkeit', 'kundenbindung'] as const;

function buildRadarData(discoveryData: DiscoveryData) {
  const activePainIds = new Set(
    discoveryData.pain_points.filter(p => p.selected).map(p => p.id)
  );

  return RADAR_AXES.map(axis => {
    const isActive = activePainIds.has(axis);
    const painPoint = discoveryData.pain_points.find(p => p.id === axis);
    const severity = painPoint?.severity ?? (isActive ? 2 : 8);

    return {
      axis: PAIN_POINT_LABELS[axis]?.split(' / ')[0] ?? axis,
      ist: isActive ? Math.max(1, Math.min(10, severity)) : 8,
      soll: 9,
    };
  });
}

export function PainPointRadar({ discoveryData, selectedModules = [], offerMode }: PainPointRadarProps) {
  const radarData = buildRadarData(discoveryData);
  const activePainPoints = discoveryData.pain_points.filter(p => p.selected);

  if (activePainPoints.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ihre aktuelle Situation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Rot = Ist-Zustand · Grün = Soll-Zustand nach Umsetzung
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar
                name="Ist-Zustand"
                dataKey="ist"
                stroke="hsl(0, 72%, 51%)"
                fill="hsl(0, 72%, 51%)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Soll-Zustand"
                dataKey="soll"
                stroke="hsl(142, 71%, 45%)"
                fill="hsl(142, 71%, 45%)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Challenge vs Solution Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Challenges */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Ihre Herausforderungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activePainPoints.map(pp => (
              <div key={pp.id} className="flex items-start gap-2 text-sm">
                <div className="mt-1 h-2 w-2 rounded-full bg-destructive/80 shrink-0" />
                <div>
                  <p className="font-medium">{PAIN_POINT_LABELS[pp.id] || pp.label}</p>
                  {pp.notes && <p className="text-muted-foreground text-xs mt-0.5">{pp.notes}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Solutions */}
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Unsere Lösung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activePainPoints.map(pp => {
              const moduleIds = PAIN_POINT_MODULE_MAP[pp.id] || [];
              const modules = moduleIds
                .map(id => getModuleById(id))
                .filter(Boolean);
              const solutionText = PAIN_POINT_SOLUTION_TEXTS[pp.id];

              return (
                <div key={pp.id} className="flex items-start gap-2 text-sm">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="font-medium">{solutionText}</p>
                    {modules.length > 0 && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Bausteine: {modules.map(m => m!.label).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
