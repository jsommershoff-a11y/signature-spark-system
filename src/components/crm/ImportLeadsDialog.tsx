import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ImportResult {
  type: "data_import" | "file_stored";
  imported?: number;
  skipped?: number;
  total?: number;
  errors?: { row: number; reason: string }[];
  message?: string;
  path?: string;
}

interface ImportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

const ACCEPTED_TYPES = ".csv,.xlsx,.xls,.jpg,.jpeg,.png,.pdf";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function generateCSVTemplate(): string {
  const headers = "first_name,last_name,email,phone,company,industry,location,source_type";
  const example = "Max,Mustermann,max@beispiel.de,+49 123 456,Firma GmbH,Handwerk,Berlin,inbound_organic";
  return `${headers}\n${example}`;
}

export function ImportLeadsDialog({ open, onOpenChange, onImportComplete }: ImportLeadsDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setResult(null);
  };

  const handleClose = () => {
    if (!uploading) {
      reset();
      onOpenChange(false);
    }
  };

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

  const handleUpload = async () => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "Datei zu groß", description: "Maximale Dateigröße: 5 MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(20);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Nicht eingeloggt", description: "Bitte melde dich an.", variant: "destructive" });
        return;
      }

      setProgress(40);

      const formData = new FormData();
      formData.append("file", file);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/import-leads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      setProgress(80);

      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Import fehlgeschlagen", description: data.error || "Unbekannter Fehler", variant: "destructive" });
        setUploading(false);
        return;
      }

      setProgress(100);
      setResult(data as ImportResult);

      if (data.type === "data_import" && data.imported > 0) {
        onImportComplete();
      }
    } catch (err) {
      console.error("Import error:", err);
      toast({ title: "Fehler", description: "Upload fehlgeschlagen. Bitte versuche es erneut.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead-import-vorlage.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Leads importieren</DialogTitle>
          <DialogDescription>
            Lade eine CSV- oder Excel-Datei hoch, um neue Leads anzulegen.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            {result.type === "file_stored" ? (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Datei gespeichert</p>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {result.imported} von {result.total} Leads importiert
                    </p>
                    {(result.skipped ?? 0) > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {result.skipped} übersprungen
                      </p>
                    )}
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Fehlerhafte Zeilen:
                    </p>
                    {result.errors.map((err, i) => (
                      <div key={i} className="text-xs p-2 rounded bg-destructive/10 text-destructive">
                        Zeile {err.row}: {err.reason}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>
                Weitere Datei
              </Button>
              <Button onClick={handleClose}>Schließen</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept={ACCEPTED_TYPES}
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
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">Datei hierher ziehen</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    CSV, Excel, Bilder oder PDF (max. 5 MB)
                  </p>
                </>
              )}
            </div>

            {uploading && (
              <Progress value={progress} className="h-2" />
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-1.5" />
                CSV-Vorlage
              </Button>
              <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "Importiere..." : "Importieren"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
