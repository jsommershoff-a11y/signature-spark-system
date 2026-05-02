import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  FOLLOW_UP_TEMPLATES as STATIC_TEMPLATES,
  type FollowUpTemplate,
  type FollowUpTemplateId,
} from '@/lib/sales-scripts/follow-up';

export interface FollowUpTemplateRow {
  id: string;
  template_key: string;
  label: string;
  description: string;
  subject: string;
  body: string;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

const QUERY_KEY = ['follow-up-templates'];

function rowToTemplate(row: FollowUpTemplateRow): FollowUpTemplate {
  return {
    id: row.template_key as FollowUpTemplateId,
    label: row.label,
    description: row.description,
    subject: row.subject,
    body: row.body.split('\n'),
  };
}

/**
 * Liefert aktive Templates aus DB, fällt bei Fehlern auf statische Defaults zurück.
 * Damit bleibt die PipelineCard auch bei DB-Ausfall funktionsfähig.
 */
export function useFollowUpTemplatesPublic() {
  const query = useQuery({
    queryKey: [...QUERY_KEY, 'public'],
    queryFn: async (): Promise<FollowUpTemplate[]> => {
      const { data, error } = await supabase
        .from('follow_up_templates' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as unknown as FollowUpTemplateRow[];
      if (rows.length === 0) return STATIC_TEMPLATES;
      return rows.map(rowToTemplate);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    templates: query.data ?? STATIC_TEMPLATES,
    isLoading: query.isLoading,
  };
}

/** Admin-Hook: lädt ALLE Templates inkl. inaktiver, mit CRUD-Mutationen. */
export function useFollowUpTemplatesAdmin() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [...QUERY_KEY, 'admin'],
    queryFn: async (): Promise<FollowUpTemplateRow[]> => {
      const { data, error } = await supabase
        .from('follow_up_templates' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as FollowUpTemplateRow[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const create = useMutation({
    mutationFn: async (input: Omit<FollowUpTemplateRow, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('follow_up_templates' as any)
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<FollowUpTemplateRow> & { id: string }) => {
      const { data, error } = await supabase
        .from('follow_up_templates' as any)
        .update(patch as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('follow_up_templates' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    templates: list.data ?? [],
    isLoading: list.isLoading,
    error: list.error,
    create,
    update,
    remove,
  };
}

export interface FollowUpTemplateVersionRow {
  id: string;
  template_id: string;
  version_number: number;
  template_key: string;
  label: string;
  description: string | null;
  subject: string;
  body: string;
  sort_order: number;
  is_active: boolean;
  change_type: 'create' | 'update' | 'rollback';
  changed_by: string | null;
  created_at: string;
}

export function useFollowUpTemplateVersions(templateId: string | null) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [...QUERY_KEY, 'versions', templateId],
    enabled: !!templateId,
    queryFn: async (): Promise<FollowUpTemplateVersionRow[]> => {
      const { data, error } = await supabase
        .from('follow_up_template_versions' as any)
        .select('*')
        .eq('template_id', templateId)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as FollowUpTemplateVersionRow[];
    },
  });

  const rollback = useMutation({
    mutationFn: async (versionId: string) => {
      const { data, error } = await supabase.rpc('rollback_follow_up_template' as any, {
        _version_id: versionId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    versions: list.data ?? [],
    isLoading: list.isLoading,
    rollback,
  };
}
