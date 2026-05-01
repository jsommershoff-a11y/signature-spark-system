import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SavedView<TFilter = Record<string, unknown>> = {
  id: string;
  name: string;
  filter: TFilter;
  created_at: string;
};

type ScopePayload<TFilter> = {
  views?: SavedView<TFilter>[];
  defaultId?: string | null;
};

/**
 * Saved Views per scope (e.g. 'customers', 'leads'), persisted in user_preferences.saved_views[scope].
 * Stores both the list of views and an optional defaultId for auto-loading.
 */
export function useSavedViews<TFilter = Record<string, unknown>>(scope: string) {
  const [views, setViews] = useState<SavedView<TFilter>[]>([]);
  const [defaultId, setDefaultIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setViews([]); setDefaultIdState(null); setLoading(false); return; }
    const { data } = await supabase
      .from('user_preferences')
      .select('saved_views')
      .eq('user_id', auth.user.id)
      .maybeSingle();
    const all = (data?.saved_views as Record<string, unknown> | null) ?? {};
    const raw = all?.[scope];
    // Backward compat: scope value used to be an array of views.
    let list: SavedView<TFilter>[] = [];
    let def: string | null = null;
    if (Array.isArray(raw)) {
      list = raw as SavedView<TFilter>[];
    } else if (raw && typeof raw === 'object') {
      const payload = raw as ScopePayload<TFilter>;
      list = Array.isArray(payload.views) ? payload.views : [];
      def = payload.defaultId ?? null;
    }
    setViews(list);
    setDefaultIdState(def && list.some((v) => v.id === def) ? def : null);
    setLoading(false);
  }, [scope]);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (next: SavedView<TFilter>[], nextDefault: string | null) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('saved_views')
      .eq('user_id', auth.user.id)
      .maybeSingle();
    const all = ((existing?.saved_views as Record<string, unknown>) ?? {}) as Record<string, unknown>;
    const saved_views = { ...all, [scope]: { views: next, defaultId: nextDefault } };
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: auth.user.id, saved_views }, { onConflict: 'user_id' });
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
      await persist(next, defaultId);
      toast.success(`Ansicht „${cleanName}" gespeichert`);
    } catch { setViews(views); }
  }, [views, persist, defaultId]);

  const remove = useCallback(async (id: string) => {
    const next = views.filter((v) => v.id !== id);
    setViews(next);
    const nextDefault = defaultId === id ? null : defaultId;
    if (defaultId === id) setDefaultIdState(null);
    if (activeId === id) setActiveId(null);
    try { await persist(next, nextDefault); } catch { setViews(views); }
  }, [views, activeId, defaultId, persist]);

  const apply = useCallback((id: string) => {
    const v = views.find((x) => x.id === id);
    if (v) setActiveId(id);
    return v?.filter ?? null;
  }, [views]);

  const setDefault = useCallback(async (id: string | null) => {
    const prev = defaultId;
    setDefaultIdState(id);
    try {
      await persist(views, id);
      if (id) {
        const v = views.find((x) => x.id === id);
        toast.success(v ? `„${v.name}" als Standard gesetzt` : 'Standard gesetzt');
      } else {
        toast.success('Standard-Ansicht entfernt');
      }
    } catch {
      setDefaultIdState(prev);
    }
  }, [views, defaultId, persist]);

  return { views, loading, activeId, setActiveId, save, remove, apply, defaultId, setDefault };
}
