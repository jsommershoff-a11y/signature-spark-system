import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, Building2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Detail = {
  id: string;
  source: 'profile' | 'crm_lead';
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  assigned_staff_name: string | null;
  record_status: string;
  created_at: string;
};

/**
 * CRM Step 01 — Stub Detail-Ansicht.
 * Step 02 baut hier die vollständige 360°-Akte aus.
 */
export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data: rows, error } = await supabase.rpc('get_customers', {
          _include_deleted: true,
          _status_filter: null,
        });
        if (error) throw error;
        const row = (rows ?? []).find((r: any) => r.id === id);
        setData((row as Detail) ?? null);
      } catch (e: any) {
        toast.error(e?.message ?? 'Datensatz konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const displayName = (d: Detail) =>
    d.full_name || `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || d.email || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Zurück
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardHeader><Skeleton className="h-7 w-64" /></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </CardContent>
        </Card>
      ) : !data ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Datensatz nicht gefunden oder kein Zugriff.
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/app/customers">Zurück zur Übersicht</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Kopfbereich */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{displayName(data)}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{data.record_status}</Badge>
                    <span>· Quelle: {data.source === 'profile' ? 'Mitglied' : 'CRM'}</span>
                    <span>
                      · Verantwortlich: {data.assigned_staff_name ?? 'Jan (Standard)'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <InfoRow icon={<Mail className="h-4 w-4" />} label="E-Mail" value={data.email} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Telefon" value={data.phone} />
              <InfoRow icon={<Building2 className="h-4 w-4" />} label="Firma" value={data.company} />
              <InfoRow icon={<User className="h-4 w-4" />} label="Zugewiesen" value={data.assigned_staff_name ?? 'Jan (Standard)'} />
            </CardContent>
          </Card>

          {/* Stub-Hinweis: Step 02 erweitert die 360°-Akte */}
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Erweiterte Akte (Kommunikation, Pipeline-Verlauf, Angebote, Aufgaben, Termine,
              Tracking, Dokumente) wird in Step&nbsp;02 ergänzt.
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card/40 p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate font-medium">{value ?? '—'}</div>
      </div>
    </div>
  );
}
