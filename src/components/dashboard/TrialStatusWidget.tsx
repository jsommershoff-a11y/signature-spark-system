import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, Loader2, Ticket, Calendar as CalendarIcon, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveCallEligibility } from '@/hooks/useLiveCallEligibility';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TRIAL_LENGTH_DAYS = 14; // Standard-Trial-Länge (für Fortschrittsbalken)

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'abgelaufen';
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}T ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function TrialStatusWidget() {
  const { profile } = useAuth();
  const { eligibility } = useLiveCallEligibility();
  const [now, setNow] = useState<number>(() => Date.now());
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Tick once per second so the countdown updates live
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startCheckout = async (skipTrial: boolean) => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('start-membership-checkout', {
        body: { skipTrial },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Keine Checkout-URL erhalten');
      }
    } catch (err: any) {
      console.error('[TrialStatusWidget] Checkout error', err);
      toast.error(err?.message || 'Checkout konnte nicht gestartet werden');
      setCheckoutLoading(false);
    }
  };

  const status = (profile as any)?.subscription_status as string | undefined;
  const trialEndsAt = (profile as any)?.trial_ends_at as string | null | undefined;

  const view = useMemo(() => {
    if (!profile) return null;

    // Active paid subscription → show subtle "active" state
    if (status === 'active') {
      return { kind: 'active' as const };
    }

    if (status === 'trialing' && trialEndsAt) {
      const end = new Date(trialEndsAt).getTime();
      const remainingMs = end - now;
      const totalMs = TRIAL_LENGTH_DAYS * 24 * 60 * 60 * 1000;
      const elapsed = Math.max(0, totalMs - Math.max(0, remainingMs));
      const percent = Math.min(100, Math.round((elapsed / totalMs) * 100));
      return {
        kind: remainingMs > 0 ? ('trial' as const) : ('expired' as const),
        remainingMs,
        percent,
        endIso: trialEndsAt,
      };
    }

    // Past trial without active sub
    if (trialEndsAt && new Date(trialEndsAt).getTime() < now && status !== 'active') {
      return { kind: 'expired' as const, endIso: trialEndsAt };
    }

    return null;
  }, [profile, status, trialEndsAt, now]);

  if (!view) return null;

  if (view.kind === 'active') {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">Mitgliedschaft aktiv</div>
            <div className="text-xs text-muted-foreground">
              Voller Zugriff auf alle Module, Live-Calls und Inhalte.
            </div>
          </div>
          <Badge variant="default" className="bg-green-600 hover:bg-green-600">Aktiv</Badge>
        </CardContent>
      </Card>
    );
  }

  if (view.kind === 'trial') {
    const urgent = view.remainingMs! < 24 * 60 * 60 * 1000;
    return (
      <Card className={urgent ? 'border-amber-500/40 bg-amber-500/5' : 'border-primary/30 bg-primary/5'}>
        <CardContent className="p-4 md:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Clock className={`h-5 w-5 shrink-0 mt-0.5 ${urgent ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">Trial aktiv</span>
                <Badge variant={urgent ? 'destructive' : 'secondary'}>
                  Noch {formatRemaining(view.remainingMs!)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trial endet am{' '}
                <span className="font-medium text-foreground">
                  {new Date(view.endIso!).toLocaleString('de-DE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                . Sichere dir jetzt deinen Platz vor Ablauf.
              </p>
            </div>
          </div>

          {/* Live-Call Status */}
          <LiveCallStatusRow eligibility={eligibility} compact />

          <Progress value={view.percent} className="h-1.5" />
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              variant={urgent ? 'default' : 'outline'}
              onClick={() => startCheckout(false)}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1.5" />
              )}
              Jetzt für 99 €/Monat sichern
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/app/calendar">Letzten Live-Call buchen</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // expired
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardContent className="p-4 md:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">Trial abgelaufen</span>
              <Badge variant="destructive">Kein aktiver Zugang</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {('endIso' in view) && view.endIso
                ? <>Dein Trial endete am <span className="font-medium text-foreground">
                    {new Date(view.endIso).toLocaleDateString('de-DE')}
                  </span>. </>
                : null}
              Schalte alle Module, Live-Calls und Vorlagen für 99 €/Monat wieder frei.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => startCheckout(true)} disabled={checkoutLoading}>
            {checkoutLoading ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1.5" />
            )}
            Mitgliedschaft starten – 99 €/Monat
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
