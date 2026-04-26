import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

const QK_LIST = ["notifications", "list"] as const;

/**
 * Hook for the in-app notifications panel.
 * - Loads the 50 most recent notifications for the current user (RLS enforces auth.uid() = user_id).
 * - Subscribes to realtime postgres_changes on public.notifications and re-fetches on any event.
 * - Exposes unread count, mark-as-read and mark-all-as-read.
 */
export function useNotifications() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: QK_LIST,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications" as never)
        .select("id, user_id, type, title, body, link, metadata, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as Notification[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table: "notifications" },
        () => {
          qc.invalidateQueries({ queryKey: QK_LIST });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const unreadCount = notifications.filter((n) => n.read_at === null).length;

  const markRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications" as never)
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) qc.invalidateQueries({ queryKey: QK_LIST });
  };

  const markAllRead = async () => {
    const { error } = await supabase
      .from("notifications" as never)
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    if (!error) qc.invalidateQueries({ queryKey: QK_LIST });
  };

  return { notifications, unreadCount, isLoading, markRead, markAllRead, refetch };
}
