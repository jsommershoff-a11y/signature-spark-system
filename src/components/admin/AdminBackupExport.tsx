import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Users, UserPlus, Activity, FileText, Target } from 'lucide-react';

interface ExportConfig {
  label: string;
  table: string;
  icon: React.ReactNode;
  description: string;
}

const EXPORTS: ExportConfig[] = [
  { label: 'CRM Leads', table: 'crm_leads', icon: <UserPlus className="h-5 w-5" />, description: 'Alle Leads mit Kontaktdaten und Scores' },
  { label: 'Inbound Leads', table: 'leads', icon: <Users className="h-5 w-5" />, description: 'Formulardaten aus Landing Pages' },
  { label: 'Aktivitäten', table: 'activities', icon: <Activity className="h-5 w-5" />, description: 'Kompletter Audit-Trail' },
  { label: 'Angebote', table: 'offers', icon: <FileText className="h-5 w-5" />, description: 'Alle Angebote mit Status' },
  { label: 'Ziele', table: 'goals', icon: <Target className="h-5 w-5" />, description: 'Team- und Einzelziele' },
];

function downloadCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(';'),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(';')
    ),
  ];
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBackupExport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (config: ExportConfig) => {
    setLoading(config.table);
    try {
      const { data, error } = await supabase
        .from(config.table as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ title: 'Keine Daten', description: `${config.label} ist leer.` });
        return;
      }

      const date = new Date().toISOString().slice(0, 10);
      downloadCSV(data, `${config.table}_export_${date}.csv`);
      toast({ title: 'Export erfolgreich', description: `${data.length} Einträge exportiert` });
    } catch (err: any) {
      toast({ title: 'Export fehlgeschlagen', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {EXPORTS.map(config => (
        <Card key={config.table}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">{config.icon}</div>
              <div>
                <CardTitle className="text-base">{config.label}</CardTitle>
                <CardDescription className="text-xs">{config.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              disabled={loading === config.table}
              onClick={() => handleExport(config)}
            >
              {loading === config.table ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              CSV Export
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
