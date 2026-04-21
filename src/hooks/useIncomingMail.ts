import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IncomingMail {
  id: string;
  file_path: string;
  file_name: string;
  sender: string | null;
  subject: string | null;
  received_date: string | null;
  ocr_text: string | null;
  ai_summary: string | null;
  category: string | null;
  priority: string;
  status: string;
  lead_id: string | null;
  ticket_id: string | null;
  task_id: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useIncomingMail() {
  return useQuery({
    queryKey: ["incoming_mail"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incoming_mail")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as IncomingMail[];
    },
  });
}

export function useUploadMail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() || "pdf";
      const path = `${userData.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("incoming-mail")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userData.user.id)
        .single();

      const { data, error } = await supabase
        .from("incoming_mail")
        .insert({
          file_path: path,
          file_name: file.name,
          uploaded_by: profile?.id,
          status: "new",
        })
        .select()
        .single();
      if (error) throw error;
      return data as IncomingMail;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incoming_mail"] });
      toast.success("Hochgeladen");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useClassifyMail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mail_id: string) => {
      const { data, error } = await supabase.functions.invoke("mail-ocr-classify", {
        body: { mail_id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incoming_mail"] });
      toast.success("OCR & Klassifizierung abgeschlossen");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateMail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<IncomingMail> }) => {
      const { error } = await supabase.from("incoming_mail").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incoming_mail"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteMail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mail: IncomingMail) => {
      await supabase.storage.from("incoming-mail").remove([mail.file_path]);
      const { error } = await supabase.from("incoming_mail").delete().eq("id", mail.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incoming_mail"] });
      toast.success("Gelöscht");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type MailAction = "task" | "ticket" | "deal" | "link_lead";

export function useProcessMail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { mail_id: string; action: MailAction; lead_id?: string }) => {
      const { data, error } = await supabase.functions.invoke("mail-process-action", {
        body: params,
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { ok: true; kind: MailAction; id?: string; leadId?: string | null };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["incoming_mail"] });
      const labels: Record<MailAction, string> = {
        task: "Aufgabe erstellt",
        ticket: "Ticket erstellt",
        deal: "Deal in Pipeline platziert",
        link_lead: "Lead verknüpft",
      };
      toast.success(labels[res.kind]);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export async function getMailFileUrl(path: string) {
  const { data } = await supabase.storage
    .from("incoming-mail")
    .createSignedUrl(path, 3600);
  return data?.signedUrl;
}

export interface MailSyncSettings {
  id: string;
  user_id: string;
  provider: string;
  source_folder_path: string;
  processed_folder_path: string;
  sort_by_category: boolean;
  last_sync_at: string | null;
  last_sync_count: number | null;
  last_sync_error: string | null;
}

export function useMailSyncSettings() {
  return useQuery({
    queryKey: ["mail_sync_settings"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase
        .from("mail_sync_settings")
        .select("*")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (error) throw error;
      return data as MailSyncSettings | null;
    },
  });
}

export function useSaveMailSyncSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<MailSyncSettings>) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("mail_sync_settings")
        .upsert({ user_id: u.user.id, ...patch }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mail_sync_settings"] });
      toast.success("Einstellungen gespeichert");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSyncOneDrive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("onedrive-mail-sync", {
        body: {},
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { ok: true; scanned: number; imported: number; skipped: number; errors: string[] };
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["incoming_mail"] });
      qc.invalidateQueries({ queryKey: ["mail_sync_settings"] });
      const errSuffix = r.errors.length ? ` · ${r.errors.length} Fehler` : "";
      toast.success(`OneDrive synchronisiert: ${r.imported} neu, ${r.skipped} übersprungen${errSuffix}`);
    },
    onError: (e: Error) => toast.error(`Sync fehlgeschlagen: ${e.message}`),
  });
}
