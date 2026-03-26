import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PromptCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Prompt {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  prompt_text: string;
  min_tier: string;
  is_customizable: boolean;
  tags: string[];
  sort_order: number;
}

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  url: string | null;
  icon_url: string | null;
  min_tier: string;
  is_featured: boolean;
  sort_order: number;
}

export function usePromptCategories() {
  return useQuery({
    queryKey: ['prompt-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompt_categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as PromptCategory[];
    },
  });
}

export function usePrompts(categoryId?: string) {
  return useQuery({
    queryKey: ['prompts', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('prompts')
        .select('*')
        .order('sort_order');
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Prompt[];
    },
  });
}

export function useTools() {
  return useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as Tool[];
    },
  });
}
