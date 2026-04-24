import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type GmailTemplate = 'invitation' | 'confirmation' | 'reminder';

export interface SendGmailPayload {
  template: GmailTemplate;
  to: string;
  /**
   * Variablen je Template:
   * - invitation:    name, inviter, invite_url
   * - confirmation:  name, topic
   * - reminder:      name, event, when, url
   */
  data?: Record<string, string>;
  cc?: string;
  bcc?: string;
  from_name?: string;
}

export function useSendGmail() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: SendGmailPayload) => {
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: payload,
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Unbekannter Fehler');
      return data as { success: true; message_id: string; template: GmailTemplate; subject: string };
    },
    onSuccess: (res) => {
      toast({ title: 'E-Mail versendet', description: `Vorlage: ${res.template}` });
    },
    onError: (err: any) => {
      toast({
        title: 'Versand fehlgeschlagen',
        description: err?.message ?? 'Bitte später erneut versuchen.',
        variant: 'destructive',
      });
    },
  });
}
