import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, CalendarPlus, BookmarkPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS } from '@/types/social';
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
  };

  const saveToLibrary = (type: 'hook' | 'hashtag' | 'template' | 'story', content: string) => {
    createItem.mutate({ type, title: `${topic} – ${type}`, content });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> KI Content Generator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Plattform</Label>
              <Select value={platform} onValueChange={v => setPlatform(v as SocialPlatform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PLATFORM_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content-Typ</Label>
              <Select value={contentType} onValueChange={v => setContentType(v as SocialContentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ziel</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead-Generierung</SelectItem>
                  <SelectItem value="authority">Authority</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tonalität</Label>
              <Select value={tonality} onValueChange={setTonality}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dominant">Dominant</SelectItem>
                  <SelectItem value="unternehmerisch">Unternehmerisch</SelectItem>
                  <SelectItem value="empathisch">Empathisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Thema</Label><Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="z.B. Warum 90% der Handwerker zu wenig Bewerber haben" /></div>
          <div><Label>Call-to-Action</Label><Input value={cta} onChange={e => setCta(e.target.value)} placeholder="z.B. Link in Bio für kostenloses Erstgespräch" /></div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generiere...</> : <><Sparkles className="h-4 w-4 mr-2" /> Content generieren</>}
          </Button>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader><CardTitle>Ergebnis</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-1 block">Hook-Varianten</Label>
              {output.hooks.map((h, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span className="text-sm flex-1 bg-muted p-2 rounded">{h}</span>
                  <Button size="sm" variant="ghost" onClick={() => saveToLibrary('hook', h)}><BookmarkPlus className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
            <div>
              <Label className="mb-1 block">Caption</Label>
              <Textarea readOnly rows={4} value={output.caption} className="text-sm" />
              <Button size="sm" variant="ghost" className="mt-1" onClick={() => saveToLibrary('template', output.caption)}><BookmarkPlus className="h-3 w-3 mr-1" /> In Bibliothek</Button>
            </div>
            <div>
              <Label className="mb-1 block">Hashtags</Label>
              <div className="flex flex-wrap gap-1">
                {output.hashtags.map((h, i) => <span key={i} className="text-xs bg-muted px-2 py-1 rounded">#{h}</span>)}
              </div>
              <Button size="sm" variant="ghost" className="mt-1" onClick={() => saveToLibrary('hashtag', output.hashtags.map(h => `#${h}`).join(' '))}><BookmarkPlus className="h-3 w-3 mr-1" /> In Bibliothek</Button>
            </div>
            {output.story_script && (
              <div>
                <Label className="mb-1 block">Story Script</Label>
                <Textarea readOnly rows={3} value={output.story_script} className="text-sm" />
                <Button size="sm" variant="ghost" className="mt-1" onClick={() => saveToLibrary('story', output.story_script!)}><BookmarkPlus className="h-3 w-3 mr-1" /> In Bibliothek</Button>
              </div>
            )}
            <div className="text-sm text-muted-foreground">Empfohlener Posting-Zeitpunkt: {output.posting_time}</div>
            <Button onClick={saveAsPost} className="w-full"><CalendarPlus className="h-4 w-4 mr-2" /> Als Post planen</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
