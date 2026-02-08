import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Transcript, TRANSCRIPT_STATUS_LABELS } from '@/types/calls';
import { Search, Clock, User, FileText, Loader2 } from 'lucide-react';

interface TranscriptViewProps {
  transcript: Transcript | null;
  loading?: boolean;
}

export function TranscriptView({ transcript, loading }: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!transcript) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Kein Transkript vorhanden</h3>
          <p className="text-muted-foreground">
            Für diesen Call wurde noch kein Transkript erstellt.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (transcript.status === 'pending' || transcript.status === 'processing') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
          <h3 className="text-lg font-medium mb-2">Transkript wird erstellt</h3>
          <p className="text-muted-foreground mb-2">
            Das Transkript wird gerade verarbeitet. Dies kann einige Minuten dauern.
          </p>
          <Badge variant="secondary">
            {TRANSCRIPT_STATUS_LABELS[transcript.status]}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (transcript.status === 'failed') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Transkription fehlgeschlagen</h3>
          <p className="text-muted-foreground mb-2">
            {transcript.error_message || 'Bei der Transkription ist ein Fehler aufgetreten.'}
          </p>
          <Badge variant="destructive">Fehlgeschlagen</Badge>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  const segments = transcript.segments || [];
  const hasSegments = segments.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transkript
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{transcript.language.toUpperCase()}</Badge>
            {transcript.word_count && (
              <span>{transcript.word_count} Wörter</span>
            )}
            {transcript.confidence_score && (
              <span>Konfidenz: {Math.round(transcript.confidence_score * 100)}%</span>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Im Transkript suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {hasSegments ? (
            <div className="space-y-3">
              {segments.map((segment, index) => {
                const isHighlighted = highlightedIndex === index;
                const matchesSearch = searchQuery && 
                  segment.text.toLowerCase().includes(searchQuery.toLowerCase());
                
                return (
                  <div
                    key={index}
                    className={`flex gap-3 p-2 rounded-lg transition-colors ${
                      isHighlighted ? 'bg-primary/10' : 
                      matchesSearch ? 'bg-yellow-50 dark:bg-yellow-900/20' : 
                      'hover:bg-muted/50'
                    }`}
                    onClick={() => setHighlightedIndex(index)}
                  >
                    <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground shrink-0 w-16">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(segment.start)}
                      </div>
                      {segment.speaker && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {segment.speaker}
                        </div>
                      )}
                    </div>
                    <p className="text-sm flex-1">
                      {highlightText(segment.text, searchQuery)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : transcript.text ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">
                {highlightText(transcript.text, searchQuery)}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Kein Transkript-Text verfügbar
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
