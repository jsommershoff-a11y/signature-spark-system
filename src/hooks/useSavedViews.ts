import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SavedView<TFilter = Record<string, unknown>> = {
  id: string;
  name: string;
  filter: TFilter;
  created_at: string;
};

/**
 * Saved Views per scope (e.g. 'customers', 'leads'), persisted in profiles.meta.saved_views[scope].
 * Loads on mount, mutates optimistically, writes back the whole array.
 */
export function useSavedViews<TFilter = Record<string, unknown>>(scope: string) {
  const [views, setViews] = useState<SavedView<TFilter>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setViews([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('profiles')
      .select('meta')
      .eq('user_id', auth.user.id)
      .maybeSingle();
    if (!error) {
      const meta = (data?.meta as Record<string, any>) ?? {};
      const list = (meta?.saved_views?.[scope] ?? []) as SavedView<TFilter>[];
      setViews(Array.isArray(list) ? list : []);
    }
    setLoading(false);
  }, [scope]);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (next: SavedView<TFilter>[]) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data: prof } = await supabase
      .from('profiles').select('meta').eq('user_id', auth.user.id).maybeSingle();
    const meta = ((prof?.meta as Record<string, any>) ?? {}) as Record<string, any>;
    const saved_views = { ...(meta.saved_views ?? {}), [scope]: next };
    const { error } = await supabase
      .from('profiles')
      .update({ meta: { ...meta, saved_views } })
      .eq('user_id', auth.user.id);
    if (error) { toast.error('Ansicht konnte nicht gespeichert werden'); throw error; }
  }, [scope]);

  const save = useCallback(async (name: string, filter: TFilter) => {
    const cleanName = name.trim().slice(0, 60);
    if (!cleanName) { toast.error('Name darf nicht leer sein'); return; }
    const view: SavedView<TFilter> = {
      id: crypto.randomUUID(),
      name: cleanName,
      filter,
      created_at: new Date().toISOString(),
    };
    const next = [...views, view];
    setViews(next);
    setActiveId(view.id);
    try {
      await persist(next);
      toast.success(`Ansicht „${cleanName}" gespeichert`);
    } catch { setViews(views); }
  }, [views, persist]);

  const remove = useCallback(async (id: string) => {
    const next = views.filter((v) => v.id !== id);
    setViews(next);
    if (activeId === id) setActiveId(null);
    try { await persist(next); } catch { setViews(views); }
  }, [views, activeId, persist]);

  const apply = useCallback((id: string) => {
    const v = views.find((x) => x.id === id);
    if (v) setActiveId(id);
    return v?.filter ?? null;
  }, [views]);

  return { views, loading, activeId, setActiveId, save, remove, apply };
}
