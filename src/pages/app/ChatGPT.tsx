import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Die Anfrage konnte nicht verarbeitet werden.';
}

export default function ChatGPT() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: 'user' as const, content }];
    setMessages(nextMessages);
    setDraft('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatgpt', {
        body: { messages: nextMessages },
      });
      if (error) throw error;

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: data?.message || 'Keine Antwort erhalten.',
        },
      ]);
    } catch (error) {
      toast({
        title: 'ChatGPT Fehler',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ChatGPT</h1>
            <p className="text-sm text-muted-foreground">KI-Assistent für deinen Arbeitsbereich</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMessages([])}
          disabled={messages.length === 0 || loading}
          aria-label="Chat leeren"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" />
            Unterhaltung
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-22rem)] min-h-[360px]">
            <div className="space-y-4 p-4">
              {messages.length === 0 && (
                <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
                  Noch keine Nachrichten
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[82%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed md:max-w-[72%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Antwort läuft
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <form onSubmit={sendMessage} className="border-t p-4">
            <div className="flex gap-3">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Nachricht eingeben..."
                className="min-h-[48px] resize-none"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={!draft.trim() || loading} aria-label="Nachricht senden">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
