import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useIncomingMail,
  useUploadMail,
  useClassifyMail,
  useDeleteMail,
  getMailFileUrl,
  type IncomingMail,
} from "@/hooks/useIncomingMail";
import { Upload, Sparkles, Trash2, FileText, Eye, Mail } from "lucide-react";
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
  const upload = useUploadMail();
  const classify = useClassifyMail();
  const del = useDeleteMail();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ mail: IncomingMail; url: string } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const f of Array.from(files)) {
      const created = await upload.mutateAsync(f);
      // Auto-classify after upload
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
        <Button onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
          <Upload className="h-4 w-4 mr-2" />
          Brief hochladen
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

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
              {mail.ai_summary && (
                <CardContent className="pt-0">
                  <p className="text-sm">{mail.ai_summary}</p>
                  <p className="text-xs text-muted-foreground mt-2">
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
    </div>
  );
}
