import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID;

type Status = 'loading' | 'ok' | 'error';

function ConsentPage({ action }: { action: 'confirm' | 'revoke' }) {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<Status>('loading');
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setHtml('Es fehlt ein gültiges Token.');
      return;
    }
    const url = `https://${PROJECT_REF}.supabase.co/functions/v1/email-consent-action?token=${encodeURIComponent(token)}&action=${action}`;
    fetch(url)
      .then(async (r) => {
        const text = await r.text();
        setHtml(text);
        setStatus(r.ok ? 'ok' : 'error');
      })
      .catch(() => {
        setStatus('error');
        setHtml('Netzwerkfehler. Bitte später erneut versuchen.');
      });
  }, [token, action]);

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'ok' && <CheckCircle2 className="h-5 w-5 text-primary" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
            {action === 'confirm' ? 'E-Mail bestätigen' : 'Einwilligung widerrufen'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' ? (
            <p className="text-muted-foreground">Bitte einen Moment Geduld …</p>
          ) : (
            <div
              className="rounded-md border bg-background p-4 text-sm"
              // The action endpoint returns a self-contained branded HTML page
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function EmailConsentConfirm() {
  return <ConsentPage action="confirm" />;
}

export function EmailConsentRevoke() {
  return <ConsentPage action="revoke" />;
}

export default EmailConsentConfirm;
