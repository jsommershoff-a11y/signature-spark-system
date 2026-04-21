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

export async function getMailFileUrl(path: string) {
  const { data } = await supabase.storage
    .from("incoming-mail")
    .createSignedUrl(path, 3600);
  return data?.signedUrl;
}
