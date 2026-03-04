import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CalendarPlus, BookmarkPlus, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS, PLATFORM_ICONS } from '@/types/social';
import type { SocialPlatform, SocialContentType } from '@/types/social';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useSocialLibrary } from '@/hooks/useSocialLibrary';
import { useToast } from '@/hooks/use-toast';

interface GeneratorOutput {
  hooks: string[];
  caption: string;
  hashtags: string[];
  story_script: string | null;
  posting_time: string;
}

export function GeneratorTab() {
  const { toast } = useToast();
  const { createPost } = useSocialPosts();
  const { createItem } = useSocialLibrary();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<GeneratorOutput | null>(null);

  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [contentType, setContentType] = useState<SocialContentType>('post');
  const [goal, setGoal] = useState('lead');
  const [topic, setTopic] = useState('');
  const [tonality, setTonality] = useState('unternehmerisch');
  const [cta, setCta] = useState('');

  const generate = async () => {
    if (!topic) { toast({ title: 'Bitte Thema eingeben', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-social-content', {
        body: { platform, content_type: contentType, goal, topic, tonality, cta },
      });
      if (error) throw error;
      setOutput(data);
    } catch (e: any) {
      toast({ title: 'KI-Fehler', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const saveAsPost = () => {
    if (!output) return;
    createPost.mutate({
      title: topic,
      platform,
      content_type: contentType,
      status: 'idee',
      hook: output.hooks[0] || null,
      caption: output.caption,
    });
    toast({ title: 'Post aus KI-Ergebnis erstellt' });
  };

  const saveToLibrary = (type: 'hook' | 'hashtag' | 'template' | 'story', content: string) => {
    createItem.mutate({ type, title: `${topic} – ${type}`, content });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Card */}
      <Card className="border-module-green/20">
        <CardHeader className="bg-module-green-muted/30 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-module-green flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-module-green-foreground" />
            </div>
            KI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Plattform</Label>
              <Select value={platform} onValueChange={v => setPlatform(v as SocialPlatform)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{PLATFORM_ICONS[k as SocialPlatform]} {v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Content-Typ</Label>
              <Select value={contentType} onValueChange={v => setContentType(v as SocialContentType)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Ziel</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead-Generierung</SelectItem>
                  <SelectItem value="authority">Authority</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Tonalität</Label>
              <Select value={tonality} onValueChange={setTonality}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dominant">Dominant & Direkt</SelectItem>
                  <SelectItem value="unternehmerisch">Unternehmerisch</SelectItem>
                  <SelectItem value="empathisch">Empathisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Thema *</Label>
            <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="z.B. Warum 90% der Handwerker zu wenig Bewerber haben" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Call-to-Action</Label>
            <Input value={cta} onChange={e => setCta(e.target.value)} placeholder="z.B. Link in Bio für kostenloses Erstgespräch" className="mt-1" />
          </div>
          <Button onClick={generate} disabled={loading} className="w-full bg-module-green hover:bg-module-green-dark text-module-green-foreground">
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generiere...</>
            ) : (
              <><Zap className="h-4 w-4 mr-2" /> Content generieren</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Output Card */}
      {output ? (
        <Card className="border-module-green/30">
          <CardHeader className="bg-module-green-muted/30 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-module-green" />
              Ergebnis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {/* Hooks */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Hook-Varianten</Label>
              {output.hooks.map((h, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="text-sm flex-1 bg-module-green-muted/50 p-2.5 rounded-lg border border-module-green/10">{h}</span>
                  <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8 text-module-green hover:bg-module-green/10" onClick={() => saveToLibrary('hook', h)}>
                    <BookmarkPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Caption */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Caption</Label>
              <Textarea readOnly rows={4} value={output.caption} className="text-sm bg-muted/30" />
              <Button size="sm" variant="ghost" className="mt-1 text-module-green hover:bg-module-green/10" onClick={() => saveToLibrary('template', output.caption)}>
                <BookmarkPlus className="h-3 w-3 mr-1" /> In Bibliothek
              </Button>
            </div>

            {/* Hashtags */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Hashtags</Label>
              <div className="flex flex-wrap gap-1.5">
                {output.hashtags.map((h, i) => (
                  <Badge key={i} variant="outline" className="border-module-green/30 text-module-green">#{h}</Badge>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="mt-2 text-module-green hover:bg-module-green/10" onClick={() => saveToLibrary('hashtag', output.hashtags.map(h => `#${h}`).join(' '))}>
                <BookmarkPlus className="h-3 w-3 mr-1" /> In Bibliothek
              </Button>
            </div>

            {/* Story Script */}
            {output.story_script && (
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Story Script</Label>
                <Textarea readOnly rows={3} value={output.story_script} className="text-sm bg-muted/30" />
                <Button size="sm" variant="ghost" className="mt-1 text-module-green hover:bg-module-green/10" onClick={() => saveToLibrary('story', output.story_script!)}>
                  <BookmarkPlus className="h-3 w-3 mr-1" /> In Bibliothek
                </Button>
              </div>
            )}

            <div className="text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
              ⏰ Empfohlener Posting-Zeitpunkt: <strong>{output.posting_time}</strong>
            </div>

            <Button onClick={saveAsPost} className="w-full bg-module-green hover:bg-module-green-dark text-module-green-foreground">
              <CalendarPlus className="h-4 w-4 mr-2" /> Als Post planen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex items-center justify-center min-h-[400px] border-dashed">
          <div className="text-center text-muted-foreground">
            <div className="h-16 w-16 mx-auto rounded-full bg-module-green-muted flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-module-green/60" />
            </div>
            <p className="font-medium">KI-Ergebnis erscheint hier</p>
            <p className="text-sm mt-1">Fülle das Formular aus und klicke auf "Content generieren"</p>
          </div>
        </Card>
      )}
    </div>
  );
}
