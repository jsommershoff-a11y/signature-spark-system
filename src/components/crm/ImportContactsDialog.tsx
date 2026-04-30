import { useState, useCallback, useMemo } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB CSV
const MAX_ROWS = 1000;
const BATCH_SIZE = 100;

const rowSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

type RowError = { row: number; reason: string };
type ImportSummary = {
  total: number;
  imported: number;
  duplicates: number;
  company_matches: number;
  errors: RowError[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const TEMPLATE = [
  'first_name,last_name,email,phone,company,notes',
  'Max,Mustermann,max@beispiel.de,+49 123 456,Firma GmbH,Auf Messe getroffen',
  'Anna,Schmidt,anna@example.com,,Schmidt UG,',
].join('\n');

/** Minimal RFC4180-ish CSV parser (handles quoted fields, commas, escaped quotes). */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const t = text.replace(/\r\n?/g, '\n');
  while (i < t.length) {
    const ch = t[i];
    if (inQuotes) {
      if (ch === '"' && t[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (ch === '"') { inQuotes = false; i++; continue; }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { row.push(field); field = ''; i++; continue; }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += ch; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export function ImportContactsDialog({ open, onOpenChange, onImportComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const reset = () => { setFile(null); setUploading(false); setProgress(0); setSummary(null); };
  const handleClose = () => { if (!uploading) { reset(); onOpenChange(false); } };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kontakte-vorlage.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Datei zu groß (max. 2 MB)');
      return;
    }

    setUploading(true);
    setProgress(5);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        toast.error('CSV enthält keine Datenzeilen');
        setUploading(false);
        return;
      }

      const header = rows[0].map((h) => h.trim().toLowerCase());
      const required = ['first_name', 'email'];
      const missing = required.filter((r) => !header.includes(r));
      if (missing.length) {
        toast.error(`Pflichtspalten fehlen: ${missing.join(', ')}`);
        setUploading(false);
        return;
      }

      const dataRows = rows.slice(1);
      if (dataRows.length > MAX_ROWS) {
        toast.error(`Maximal ${MAX_ROWS} Zeilen pro Import (Datei: ${dataRows.length})`);
        setUploading(false);
        return;
      }

      // Validate
      const errors: RowError[] = [];
      const valid: { input: z.infer<typeof rowSchema>; rowIndex: number }[] = [];
      dataRows.forEach((cells, idx) => {
        const obj: Record<string, string> = {};
        header.forEach((h, i) => { obj[h] = (cells[i] ?? '').trim(); });
        const parsed = rowSchema.safeParse(obj);
        if (!parsed.success) {
          errors.push({
            row: idx + 2, // +1 header, +1 1-based
            reason: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          });
          return;
        }
        valid.push({ input: parsed.data, rowIndex: idx + 2 });
      });

      setProgress(25);

      // Dedupe via central RPC (email exact + company case-insensitive).
      // Email-Match → skip; Company-Match → import but flag for summary.
      const dupEmails = new Set<string>();
      const companyMatchEmails = new Set<string>();
      // Run lookups with light concurrency to keep UI responsive
      const CONCURRENCY = 5;
      let cursor = 0;
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, valid.length) }).map(async () => {
          while (cursor < valid.length) {
            const myIdx = cursor++;
            const v = valid[myIdx];
            const { data } = await supabase.rpc('find_duplicate_contacts' as any, {
              _email: v.input.email,
              _company: v.input.company || null,
            });
            const rows = (data ?? []) as Array<{ match_type: string }>;
            if (rows.some((r) => r.match_type === 'email')) {
              dupEmails.add(v.input.email);
            } else if (rows.some((r) => r.match_type === 'company')) {
              companyMatchEmails.add(v.input.email);
            }
          }
        })
      );

      const toInsert = valid.filter((v) => !dupEmails.has(v.input.email));
      const duplicates = valid.length - toInsert.length;

      setProgress(50);

      // Batch insert
      let imported = 0;
      for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const batch = toInsert.slice(i, i + BATCH_SIZE).map((v) => ({
          first_name: v.input.first_name,
          last_name: v.input.last_name || null,
          email: v.input.email,
          phone: v.input.phone || null,
          company: v.input.company || null,
          notes: v.input.notes || null,
          status: 'contact' as never,
          source_type: 'outbound_manual' as never,
          discovered_by: 'manual' as never,
        }));
        const { error, count } = await supabase.from('crm_leads').insert(batch, { count: 'exact' });
        if (error) {
          batch.forEach((_, j) => {
            const original = toInsert[i + j];
            errors.push({ row: original.rowIndex, reason: error.message });
          });
        } else {
          imported += count ?? batch.length;
        }
        setProgress(50 + Math.round(((i + batch.length) / Math.max(toInsert.length, 1)) * 45));
      }

      setProgress(100);
      setSummary({
        total: dataRows.length,
        imported,
        duplicates,
        company_matches: companyMatchEmails.size,
        errors,
      });
      if (imported > 0) onImportComplete();
    } catch (err) {
      console.error(err);
      toast.error('Import fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  const acceptedFile = useMemo(() => file && file.name.toLowerCase().endsWith('.csv'), [file]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kontakte importieren</DialogTitle>
          <DialogDescription>
            CSV-Datei hochladen. Kontakte werden mit Status „Kontakt" angelegt (noch nicht in der Pipeline).
          </DialogDescription>
        </DialogHeader>

        {summary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold text-emerald-600">{summary.imported}</div>
                <div className="text-xs text-muted-foreground">Importiert</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold text-amber-600">{summary.duplicates}</div>
                <div className="text-xs text-muted-foreground">E-Mail-Duplikate</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold text-blue-600">{summary.company_matches}</div>
                <div className="text-xs text-muted-foreground">Firma bereits bekannt</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-2xl font-bold text-destructive">{summary.errors.length}</div>
                <div className="text-xs text-muted-foreground">Fehler</div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="font-medium">{summary.imported} von {summary.total}</span>{' '}
                Zeilen verarbeitet. {summary.company_matches > 0 && (
                  <>Bei {summary.company_matches} importierten Kontakten existiert bereits ein anderer Kontakt mit derselben Firma.{' '}</>
                )}
                Wechsle zum Filter „Potenzielle Kunden" um die neuen Kontakte zu sehen.
              </div>
            </div>


            {summary.errors.length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Fehlerhafte Zeilen:
                </p>
                {summary.errors.slice(0, 50).map((err, i) => (
                  <div key={i} className="text-xs p-2 rounded bg-destructive/10 text-destructive">
                    Zeile {err.row}: {err.reason}
                  </div>
                ))}
                {summary.errors.length > 50 && (
                  <p className="text-xs text-muted-foreground">… und {summary.errors.length - 50} weitere</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>Weitere Datei</Button>
              <Button onClick={handleClose}>Schließen</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => document.getElementById('contacts-csv-input')?.click()}
            >
              <input
                id="contacts-csv-input"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(0)} KB
                      {!acceptedFile && <span className="text-destructive ml-2">(nur .csv)</span>}
                    </p>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="ml-2"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">CSV-Datei hierher ziehen</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pflichtspalten: first_name, email · max. {MAX_ROWS} Zeilen / 2 MB
                  </p>
                </>
              )}
            </div>

            {uploading && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Verarbeite…
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-1.5" />
                CSV-Vorlage
              </Button>
              <Button onClick={handleUpload} disabled={!file || !acceptedFile || uploading}>
                {uploading ? 'Importiere…' : 'Importieren'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
