import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranscriptView } from './TranscriptView';
import { AnalysisPanel } from './AnalysisPanel';
import { SalesGuideWizard } from '@/components/offers/SalesGuideWizard';
import type { StructogramType } from '@/lib/sales-guide-ai';
import type { DiscoveryData, OfferContent } from '@/types/offers';
import { 
  Call, 
  Transcript, 
  AiAnalysis,
  CALL_STATUS_LABELS,
  CALL_TYPE_LABELS,
  CALL_PROVIDER_LABELS,
} from '@/types/calls';
import {
  Phone,
  Video,
  Clock,
  User,
  Building2,
  Mail,
  Calendar,
  Play,
  Square,
  ExternalLink,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface CallDetailViewProps {
  call: Call | null;
  transcript: Transcript | null;
  analysis: AiAnalysis | null;
  loading?: boolean;
  onStartCall?: () => void;
  onEndCall?: () => void;
  onRefresh?: () => void;
  onCreateDeal?: (discoveryData: DiscoveryData | null, phaseNotes: Record<string, unknown>) => void;
}

export function CallDetailView({
  call,
  transcript,
  analysis,
  loading,
  onStartCall,
  onEndCall,
  onRefresh,
  onCreateDeal,
}: CallDetailViewProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="text-center py-12">
        <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Call nicht gefunden</p>
      </div>
    );
  }

  const isVideo = call.call_type === 'zoom' || call.call_type === 'teams';
  const Icon = isVideo ? Video : Phone;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} Minuten`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-xl bg-muted">
              <Icon className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {call.lead?.first_name} {call.lead?.last_name}
                </h1>
                <Badge variant="secondary">
                  {CALL_STATUS_LABELS[call.status]}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {call.lead?.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {call.lead.company}
                  </div>
                )}
                {call.lead?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {call.lead.email}
                  </div>
                )}
                {call.conductor && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {call.conductor.first_name} {call.conductor.last_name}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant="outline">
                  {CALL_TYPE_LABELS[call.call_type]}
                </Badge>
                <Badge variant="outline">
                  {CALL_PROVIDER_LABELS[call.provider]}
                </Badge>
                {call.scheduled_at && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(call.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </div>
                )}
                {call.duration_seconds && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDuration(call.duration_seconds)}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {call.status === 'scheduled' && onStartCall && (
                <Button onClick={onStartCall}>
                  <Play className="h-4 w-4 mr-2" />
                  Call starten
                </Button>
              )}
              {call.status === 'in_progress' && onEndCall && (
                <Button variant="destructive" onClick={onEndCall}>
                  <Square className="h-4 w-4 mr-2" />
                  Call beenden
                </Button>
              )}
              {call.recording_url && (
                <Button variant="outline" asChild>
                  <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Aufnahme
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Notes */}
          {call.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Notizen:</p>
              <p className="text-sm text-muted-foreground">{call.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">
            Analyse
            {analysis && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                ✓
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transcript">
            Transkript
            {transcript?.status === 'done' && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                ✓
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recording">Aufnahme</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <AnalysisPanel 
            analysis={analysis} 
            callId={call.id}
            onAnalysisUpdated={onRefresh}
          />
        </TabsContent>

        <TabsContent value="transcript">
          <TranscriptView transcript={transcript} />
        </TabsContent>

        <TabsContent value="recording">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aufnahme</CardTitle>
            </CardHeader>
            <CardContent>
              {call.recording_url ? (
                <div className="space-y-4">
                  <audio controls className="w-full">
                    <source src={call.recording_url} />
                    Ihr Browser unterstützt kein Audio.
                  </audio>
                  <Button variant="outline" asChild>
                    <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      In neuem Tab öffnen
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Keine Aufnahme verfügbar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
