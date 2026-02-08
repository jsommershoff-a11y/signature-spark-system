import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoreGauge } from './ScoreGauge';
import { StructogramChart } from './StructogramChart';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalysis } from '@/hooks/useAnalysis';
import { 
  AiAnalysis, 
  QUALITY_LABELS, 
  OBJECTION_TYPE_LABELS 
} from '@/types/calls';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Target,
  Lightbulb,
  Loader2,
} from 'lucide-react';

interface AnalysisPanelProps {
  analysis: AiAnalysis | null;
  callId: string;
  onAnalysisUpdated?: () => void;
}

export function AnalysisPanel({ analysis, callId, onAnalysisUpdated }: AnalysisPanelProps) {
  const { hasMinRole } = useAuth();
  const { regenerateAnalysis, analyzing } = useAnalysis();
  const canRegenerate = hasMinRole('teamleiter');

  const handleRegenerate = async () => {
    const result = await regenerateAnalysis(callId);
    if (result && onAnalysisUpdated) {
      onAnalysisUpdated();
    }
  };

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Analyse vorhanden</h3>
          <p className="text-muted-foreground mb-4">
            Für diesen Call wurde noch keine KI-Analyse erstellt.
          </p>
          {canRegenerate && (
            <Button onClick={handleRegenerate} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analysiere...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Analyse starten
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const { analysis_json: data } = analysis;

  return (
    <div className="space-y-6">
      {/* Scores Overview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Scoring</CardTitle>
            {canRegenerate && (
              <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={analyzing}>
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Neu analysieren</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-8">
            <ScoreGauge
              value={analysis.purchase_readiness || 0}
              label="Kaufbereitschaft"
              size="lg"
            />
            <ScoreGauge
              value={analysis.success_probability || 0}
              label="Erfolgswahrsch."
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="problems">Probleme</TabsTrigger>
          <TabsTrigger value="objections">Einwände</TabsTrigger>
          <TabsTrigger value="structogram">Structogram</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Zusammenfassung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Gesprächsqualität:</span>
                <Badge variant={
                  data.summary.call_quality === 'excellent' ? 'default' :
                  data.summary.call_quality === 'good' ? 'secondary' :
                  data.summary.call_quality === 'average' ? 'outline' : 'destructive'
                }>
                  {QUALITY_LABELS[data.summary.call_quality] || data.summary.call_quality}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Kernpunkte:</p>
                <ul className="space-y-1">
                  {data.summary.key_points.map((point, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Buying Signals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kaufsignale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-green-600 flex items-center gap-1 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Positive Signale
                  </p>
                  <ul className="space-y-1">
                    {data.buying_signals.positive.length > 0 ? (
                      data.buying_signals.positive.map((signal, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                          {signal}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">Keine erkannt</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 flex items-center gap-1 mb-2">
                    <TrendingDown className="h-4 w-4" />
                    Negative Signale
                  </p>
                  <ul className="space-y-1">
                    {data.buying_signals.negative.length > 0 ? (
                      data.buying_signals.negative.map((signal, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <XCircle className="h-3 w-3 text-red-500 mt-1 shrink-0" />
                          {signal}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground">Keine erkannt</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Empfehlungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Nächste Schritte:</p>
                <ul className="space-y-1">
                  {data.recommendations.immediate_actions.map((action, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="font-medium text-primary">{i + 1}.</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Follow-up Timing:</span>
                <Badge variant="outline">{data.recommendations.follow_up_timing}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Problems Tab */}
        <TabsContent value="problems">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Identifizierte Probleme
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Schmerzintensität:</span>
                  <Badge variant={data.problems.pain_intensity > 70 ? 'destructive' : 'secondary'}>
                    {data.problems.pain_intensity}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.problems.identified.length > 0 ? (
                <div className="space-y-4">
                  {data.problems.identified.map((problem, i) => (
                    <div key={i} className="border-l-2 pl-4 py-2" style={{
                      borderColor: problem.severity === 'high' ? 'hsl(var(--destructive))' :
                                   problem.severity === 'medium' ? 'hsl(var(--chart-4))' :
                                   'hsl(var(--muted-foreground))'
                    }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {problem.category}
                        </Badge>
                        <Badge variant={
                          problem.severity === 'high' ? 'destructive' :
                          problem.severity === 'medium' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {problem.severity === 'high' ? 'Hoch' :
                           problem.severity === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                      </div>
                      <p className="text-sm">{problem.description}</p>
                      {problem.quote && (
                        <blockquote className="mt-2 text-sm italic text-muted-foreground border-l-2 border-muted pl-3">
                          "{problem.quote}"
                        </blockquote>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Probleme identifiziert
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objections Tab */}
        <TabsContent value="objections">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Einwände</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Handling Score:</span>
                  <Badge variant={data.objections.objection_handling_score > 70 ? 'default' : 'secondary'}>
                    {data.objections.objection_handling_score}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.objections.raised.length > 0 ? (
                <div className="space-y-4">
                  {data.objections.raised.map((objection, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`p-1.5 rounded-full ${
                        objection.handled ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}>
                        {objection.handled ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {OBJECTION_TYPE_LABELS[objection.type] || objection.type}
                          </Badge>
                          {objection.handled && objection.response_quality && (
                            <Badge variant="secondary" className="text-xs">
                              {QUALITY_LABELS[objection.response_quality]}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{objection.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {objection.handled ? 'Behandelt' : 'Offen'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Einwände erkannt
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Structogram Tab */}
        <TabsContent value="structogram">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Persönlichkeitsanalyse (Structogram)</CardTitle>
            </CardHeader>
            <CardContent>
              <StructogramChart
                primaryColor={data.structogram.primary_color}
                secondaryColor={data.structogram.secondary_color}
                confidence={data.structogram.confidence}
                indicators={data.structogram.indicators}
                tips={data.structogram.communication_tips}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
