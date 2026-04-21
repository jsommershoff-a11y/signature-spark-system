import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Inbox, Send, RefreshCw, Mail as MailIcon, Loader2, CheckSquare, Ticket as TicketIcon, Kanban } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface OutlookMessage {
  id: string;
  subject: string;
  from?: { emailAddress?: { name?: string; address?: string } };
  receivedDateTime: string;
  isRead: boolean;
  bodyPreview: string;
  hasAttachments: boolean;
}

export default function AdminOutlookMailbox() {
  const qc = useQueryClient();
  const [folder, setFolder] = useState<'inbox' | 'sentitems'>('inbox');

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['outlook-messages', folder],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('outlook-list-messages', {
        body: null,
        method: 'GET',
        // GET with query string via custom URL
      });
      // supabase-js invoke doesn't support query params for GET reliably; use direct fetch
      if (error) throw error;
      return data as { messages: OutlookMessage[] };
    },
    refetchOnWindowFocus: false,
    enabled: false, // we'll trigger manually with fetch wrapper below
  });

  // Direct fetch helper because supabase.functions.invoke is finicky with query params
  const fetchMessages = async () => {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) {
      toast.error('Nicht eingeloggt');
      return;
    }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/outlook-list-messages?folder=${folder}&top=30`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Fehler beim Laden');
      qc.setQueryData(['outlook-messages', folder], json);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const messages = (qc.getQueryData<{ messages: OutlookMessage[] }>(['outlook-messages', folder])?.messages) ?? [];

  // Send form
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const sendMutation = useMutation({
    mutationFn: async () => {
      const recipients = to.split(',').map(s => s.trim()).filter(Boolean);
      if (recipients.length === 0) throw new Error('Mindestens einen Empfänger angeben');
      if (!subject) throw new Error('Betreff fehlt');
      if (!content) throw new Error('Inhalt fehlt');
      const { data, error } = await supabase.functions.invoke('outlook-send-email', {
        body: { to: recipients, subject, content, contentType: 'HTML' },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast.success('E-Mail gesendet');
      setTo(''); setSubject(''); setContent('');
    },
    onError: (e: any) => toast.error(e.message ?? 'Senden fehlgeschlagen'),
  });

  return (
    <Tabs defaultValue="inbox" className="space-y-4">
      <TabsList>
        <TabsTrigger value="inbox" onClick={() => setFolder('inbox')} className="gap-1.5">
          <Inbox className="h-4 w-4" /> Posteingang
        </TabsTrigger>
        <TabsTrigger value="sent" onClick={() => setFolder('sentitems')} className="gap-1.5">
          <Send className="h-4 w-4" /> Gesendet
        </TabsTrigger>
        <TabsTrigger value="compose" className="gap-1.5">
          <MailIcon className="h-4 w-4" /> Schreiben
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inbox" className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Postfach des verbundenen Outlook-Kontos</p>
          <Button variant="outline" size="sm" onClick={fetchMessages} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Laden
          </Button>
        </div>
        <MessageList messages={messages} />
      </TabsContent>

      <TabsContent value="sent" className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Zuletzt gesendete E-Mails</p>
          <Button variant="outline" size="sm" onClick={fetchMessages} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Laden
          </Button>
        </div>
        <MessageList messages={messages} />
      </TabsContent>

      <TabsContent value="compose">
        <Card>
          <CardHeader>
            <CardTitle>Neue E-Mail</CardTitle>
            <CardDescription>Wird über das verbundene Outlook-Konto versendet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">An (kommagetrennt)</Label>
              <Input id="to" placeholder="empfaenger@example.com, weiterer@example.com"
                value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Betreff</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Nachricht (HTML erlaubt)</Label>
              <Textarea id="content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Senden
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function MessageList({ messages }: { messages: OutlookMessage[] }) {
  if (messages.length === 0) {
    return (
      <Card><CardContent className="py-10 text-center text-muted-foreground">
        Keine Nachrichten geladen. Klicke auf "Laden".
      </CardContent></Card>
    );
  }
  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <div className="divide-y">
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} />
        ))}
      </div>
    </ScrollArea>
  );
}

function MessageRow({ message: m }: { message: OutlookMessage }) {
  const action = useMutation({
    mutationFn: async (kind: 'task' | 'ticket' | 'deal') => {
      const { data, error } = await supabase.functions.invoke('outlook-process-action', {
        body: {
          action: kind,
          email: {
            messageId: m.id,
            subject: m.subject,
            bodyPreview: m.bodyPreview,
            fromName: m.from?.emailAddress?.name,
            fromAddress: m.from?.emailAddress?.address,
          },
        },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    },
    onSuccess: (_, kind) => {
      const labels = { task: 'Aufgabe erstellt', ticket: 'Ticket erstellt', deal: 'Lead/Deal in Pipeline' };
      toast.success(labels[kind]);
    },
    onError: (e: Error) => toast.error(e.message ?? 'Aktion fehlgeschlagen'),
  });

  return (
    <div className="p-3 hover:bg-muted/50">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {!m.isRead && <Badge variant="default" className="h-1.5 w-1.5 p-0 rounded-full" />}
            <p className="font-medium truncate">{m.subject || '(kein Betreff)'}</p>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {m.from?.emailAddress?.name || m.from?.emailAddress?.address || '—'}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{m.bodyPreview}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDistanceToNow(new Date(m.receivedDateTime), { addSuffix: true, locale: de })}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate('task')}>
          <CheckSquare className="h-3.5 w-3.5 mr-1.5" /> Aufgabe
        </Button>
        <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate('ticket')}>
          <TicketIcon className="h-3.5 w-3.5 mr-1.5" /> Ticket
        </Button>
        <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate('deal')}>
          <Kanban className="h-3.5 w-3.5 mr-1.5" /> Pipeline-Deal
        </Button>
      </div>
    </div>
  );
}
