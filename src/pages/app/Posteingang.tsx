import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useIncomingMail,
  useUploadMail,
  useClassifyMail,
  useDeleteMail,
  useProcessMail,
  useMailSyncSettings,
  useSaveMailSyncSettings,
  useSyncOneDrive,
  getMailFileUrl,
  type IncomingMail,
} from "@/hooks/useIncomingMail";
import { Upload, Sparkles, Trash2, FileText, Eye, Mail, CheckSquare, Ticket, Target, Link2, Cloud, Settings, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const priorityColors: Record<string, string> = {
  urgent: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
};

export default function Posteingang() {
  const { data: mails, isLoading } = useIncomingMail();
  const { data: settings } = useMailSyncSettings();
  const saveSettings = useSaveMailSyncSettings();
  const syncOneDrive = useSyncOneDrive();
  const upload = useUploadMail();
  const classify = useClassifyMail();
  const del = useDeleteMail();
  const process = useProcessMail();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ mail: IncomingMail; url: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [src, setSrc] = useState("");
  const [dst, setDst] = useState("");
  const [byCat, setByCat] = useState(true);

  const openSettings = () => {
    setSrc(settings?.source_folder_path || "/Posteingang");
    setDst(settings?.processed_folder_path || "/Posteingang/Verarbeitet");
    setByCat(settings?.sort_by_category ?? true);
    setSettingsOpen(true);
  };

  const handleSaveSettings = async () => {
    await saveSettings.mutateAsync({
      source_folder_path: src.trim() || "/Posteingang",
      processed_folder_path: dst.trim() || "/Posteingang/Verarbeitet",
      sort_by_category: byCat,
    });
    setSettingsOpen(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const f of Array.from(files)) {
      const created = await upload.mutateAsync(f);
      classify.mutate(created.id);
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  const openPreview = async (mail: IncomingMail) => {
    const url = await getMailFileUrl(mail.file_path);
    if (url) setPreview({ mail, url });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Mail className="h-7 w-7" />
            Posteingang
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Eingangsbriefe scannen, KI-OCR und Klassifizierung
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={openSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </Button>
          <Button
            variant="secondary"
            onClick={() => syncOneDrive.mutate()}
            disabled={syncOneDrive.isPending}
          >
            {syncOneDrive.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Cloud className="h-4 w-4 mr-2" />
            )}
            OneDrive Sync
          </Button>
          <Button onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
            <Upload className="h-4 w-4 mr-2" />
            Brief hochladen
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {settings?.last_sync_at && (
        <p className="text-xs text-muted-foreground">
          Letzter OneDrive-Sync:{" "}
          {format(new Date(settings.last_sync_at), "dd. MMM yyyy HH:mm", { locale: de })}
          {" · "}
          {settings.last_sync_count ?? 0} importiert
          {settings.last_sync_error && (
            <span className="text-destructive"> · Fehler: {settings.last_sync_error}</span>
          )}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !mails?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>Noch keine Briefe vorhanden. Lade einen Scan oder ein PDF hoch.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {mails.map((mail) => (
            <Card key={mail.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {mail.subject || mail.file_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {mail.sender && (
                        <span className="text-sm text-muted-foreground">{mail.sender}</span>
                      )}
                      {mail.category && <Badge variant="outline">{mail.category}</Badge>}
                      <Badge variant={priorityColors[mail.priority] as any}>
                        {mail.priority}
                      </Badge>
                      <Badge variant={mail.status === "processed" ? "default" : "secondary"}>
                        {mail.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => openPreview(mail)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {mail.status !== "processed" && (
                      <Button
                        size="sm"
                        onClick={() => classify.mutate(mail.id)}
                        disabled={classify.isPending}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        OCR
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Wirklich löschen?")) del.mutate(mail);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(mail.ai_summary || mail.status !== "processed") && (
                <CardContent className="pt-0 space-y-3">
                  {mail.ai_summary && <p className="text-sm">{mail.ai_summary}</p>}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                    <span className="text-xs text-muted-foreground mr-1">Aktionen:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => process.mutate({ mail_id: mail.id, action: "task" })}
                      disabled={process.isPending}
                    >
                      <CheckSquare className="h-3.5 w-3.5 mr-1" />
                      Aufgabe
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => process.mutate({ mail_id: mail.id, action: "ticket" })}
                      disabled={process.isPending}
                    >
                      <Ticket className="h-3.5 w-3.5 mr-1" />
                      Ticket
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => process.mutate({ mail_id: mail.id, action: "deal" })}
                      disabled={process.isPending}
                    >
                      <Target className="h-3.5 w-3.5 mr-1" />
                      Deal
                    </Button>
                    {mail.lead_id && (
                      <Badge variant="secondary" className="ml-auto">
                        <Link2 className="h-3 w-3 mr-1" />
                        Lead verknüpft
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hochgeladen{" "}
                    {format(new Date(mail.created_at), "dd. MMM yyyy HH:mm", { locale: de })}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>{preview?.mail.subject || preview?.mail.file_name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <iframe src={preview.url} className="w-full h-full rounded border" title="Brief" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OneDrive Sync-Einstellungen</DialogTitle>
            <DialogDescription>
              Briefe werden aus dem Quell-Ordner gelesen, per KI verarbeitet und in den
              Ziel-Ordner verschoben.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="src">Quell-Ordner (OneDrive)</Label>
              <Input
                id="src"
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                placeholder="/Posteingang"
              />
              <p className="text-xs text-muted-foreground">
                Pfad ab Root deines OneDrive, z.B. /Scans/Briefe
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dst">Ziel-Ordner (verarbeitet)</Label>
              <Input
                id="dst"
                value={dst}
                onChange={(e) => setDst(e.target.value)}
                placeholder="/Posteingang/Verarbeitet"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="bycat">Nach Kategorie sortieren</Label>
                <p className="text-xs text-muted-foreground">
                  Unterordner je KI-Kategorie (Rechnungen, Verträge, …)
                </p>
              </div>
              <Switch id="bycat" checked={byCat} onCheckedChange={setByCat} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveSettings} disabled={saveSettings.isPending}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
