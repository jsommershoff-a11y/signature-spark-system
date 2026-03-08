import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSipgate } from '@/hooks/useSipgate';
import { 
  Phone, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  History,
  Wifi
} from 'lucide-react';

export function SipgatePanel() {
  const { isLoading, testConnection, syncHistory } = useSipgate();
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [connectedUser, setConnectedUser] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<{ synced: number; skipped: number } | null>(null);

  const handleTestConnection = async () => {
    const result = await testConnection();
    if (result?.success) {
      setConnectionStatus('connected');
      setConnectedUser(result.user);
    } else {
      setConnectionStatus('failed');
      setConnectedUser(null);
    }
  };

  const handleSync = async () => {
    const result = await syncHistory(100);
    if (result) {
      setLastSync({ synced: result.synced, skipped: result.skipped });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Sipgate Integration
          </CardTitle>
          <Badge
            variant={connectionStatus === 'connected' ? 'default' : 'outline'}
            className={
              connectionStatus === 'connected'
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : connectionStatus === 'failed'
                ? 'border-destructive text-destructive'
                : ''
            }
          >
            {connectionStatus === 'connected' && (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            )}
            {connectionStatus === 'failed' && (
              <XCircle className="h-3 w-3 mr-1" />
            )}
            {connectionStatus === 'connected'
              ? 'Verbunden'
              : connectionStatus === 'failed'
              ? 'Fehler'
              : 'Nicht geprüft'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectedUser && (
          <p className="text-sm text-muted-foreground">
            Angemeldet als: <span className="font-medium text-foreground">{connectedUser}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4 mr-2" />
            )}
            Verbindung testen
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isLoading || connectionStatus !== 'connected'}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <History className="h-4 w-4 mr-2" />
            )}
            Anrufe synchronisieren
          </Button>
        </div>

        {lastSync && (
          <p className="text-xs text-muted-foreground">
            Letzter Sync: {lastSync.synced} importiert, {lastSync.skipped} übersprungen
          </p>
        )}
      </CardContent>
    </Card>
  );
}
