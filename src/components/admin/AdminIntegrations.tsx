import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, Mail, Building2, Webhook, CheckCircle2, XCircle } from 'lucide-react';

interface Integration {
  name: string;
  description: string;
  icon: React.ReactNode;
  secretKeys: string[];
  docsUrl: string;
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Sipgate',
    description: 'VoIP-Telefonie und Anrufe',
    icon: <Phone className="h-5 w-5" />,
    secretKeys: ['SIPGATE_TOKEN_ID', 'SIPGATE_TOKEN'],
    docsUrl: 'https://developer.sipgate.io/',
  },
  {
    name: 'Resend',
    description: 'E-Mail-Versand für Kampagnen und Transaktionen',
    icon: <Mail className="h-5 w-5" />,
    secretKeys: ['RESEND_API_KEY'],
    docsUrl: 'https://resend.com/docs',
  },
  {
    name: 'HubSpot',
    description: 'CRM-Synchronisation und Kontakt-Export',
    icon: <Building2 className="h-5 w-5" />,
    secretKeys: ['HUBSPOT_ACCESS_TOKEN'],
    docsUrl: 'https://developers.hubspot.com/',
  },
  {
    name: 'Webhooks',
    description: 'Payment-Webhook, Twilio, Zoom',
    icon: <Webhook className="h-5 w-5" />,
    secretKeys: ['CRON_SECRET', 'CHANNEL_INGEST_API_KEY'],
    docsUrl: '',
  },
];

// These are the secrets known to be configured
const CONFIGURED_SECRETS = [
  'RESEND_API_KEY', 'HUBSPOT_ACCESS_TOKEN', 'SIPGATE_TOKEN_ID', 'SIPGATE_TOKEN',
  'CRON_SECRET', 'CHANNEL_INGEST_API_KEY',
];

export default function AdminIntegrations() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {INTEGRATIONS.map(intg => {
        const allConfigured = intg.secretKeys.every(k => CONFIGURED_SECRETS.includes(k));
        return (
          <Card key={intg.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">{intg.icon}</div>
                  <div>
                    <CardTitle className="text-base">{intg.name}</CardTitle>
                    <CardDescription className="text-xs">{intg.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={allConfigured ? 'default' : 'secondary'} className="gap-1">
                  {allConfigured ? (
                    <><CheckCircle2 className="h-3 w-3" /> Aktiv</>
                  ) : (
                    <><XCircle className="h-3 w-3" /> Fehlt</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Secrets:</p>
                <div className="flex flex-wrap gap-1.5">
                  {intg.secretKeys.map(key => (
                    <Badge
                      key={key}
                      variant="outline"
                      className={`text-[10px] font-mono ${CONFIGURED_SECRETS.includes(key) ? 'border-green-500/50 text-green-700 dark:text-green-400' : 'border-destructive/50 text-destructive'}`}
                    >
                      {key}
                    </Badge>
                  ))}
                </div>
                {intg.docsUrl && (
                  <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1" asChild>
                    <a href={intg.docsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" /> Dokumentation
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
