import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Member, Membership, Course, LessonProgress, MemberKPI, ProgressStatus } from '@/types/members';

export function useMember() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get current user's member profile
  const memberQuery = useQuery({
    queryKey: ['member', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          profile:profiles(*),
          memberships(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data as unknown as Member;
    },
    enabled: !!user?.id,
  });

  // Get active memberships
  const membershipsQuery = useQuery({
    queryKey: ['memberships', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!member) return [];

      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('member_id', member.id)
        .eq('status', 'active');

      if (error) throw error;
      return data as unknown as Membership[];
    },
    enabled: !!user?.id,
  });

  // Get available courses based on membership
  const coursesQuery = useQuery({
    queryKey: ['courses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules(
            *,
            lessons(*)
          )
        `)
        .eq('published', true)
        .order('sort_order');

      if (error) throw error;

      // Calculate progress for each course
      const coursesWithProgress = await Promise.all(
        (data || []).map(async (course) => {
          const totalLessons = course.modules?.reduce(
            (sum: number, mod: { lessons?: unknown[] }) => sum + (mod.lessons?.length || 0),
            0
          ) || 0;

          // Get completed lessons count
          if (memberQuery.data?.id) {
            const lessonIds = course.modules?.flatMap((mod: { lessons?: { id: string }[] }) => 
              mod.lessons?.map(l => l.id) || []
            ) || [];

            const { count } = await supabase
              .from('lesson_progress')
              .select('*', { count: 'exact', head: true })
              .eq('member_id', memberQuery.data.id)
              .eq('status', 'completed')
              .in('lesson_id', lessonIds);

            return {
              ...course,
              total_lessons: totalLessons,
              completed_lessons: count || 0,
              progress_percent: totalLessons > 0 
                ? Math.round(((count || 0) / totalLessons) * 100)
                : 0,
            };
          }

          return {
            ...course,
            total_lessons: totalLessons,
            completed_lessons: 0,
            progress_percent: 0,
          };
        })
      );

      return coursesWithProgress as Course[];
    },
    enabled: !!user?.id,
  });

  // Get lesson progress
  const getLessonProgress = async (lessonId: string): Promise<LessonProgress | null> => {
    if (!memberQuery.data?.id) return null;

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('member_id', memberQuery.data.id)
      .eq('lesson_id', lessonId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as unknown as LessonProgress;
  };

  // Update lesson progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({
      lessonId,
      status,
      progressPercent,
      lastPositionSeconds,
    }: {
      lessonId: string;
      status?: ProgressStatus;
      progressPercent?: number;
      lastPositionSeconds?: number;
    }) => {
      if (!memberQuery.data?.id) throw new Error('Member not found');

      const now = new Date().toISOString();
      
      // Build the upsert data with explicit fields
      const upsertData: {
        member_id: string;
        lesson_id: string;
        last_seen_at: string;
        status?: ProgressStatus;
        started_at?: string;
        completed_at?: string;
        progress_percent?: number;
        last_position_seconds?: number;
      } = {
        member_id: memberQuery.data.id,
        lesson_id: lessonId,
        last_seen_at: now,
      };

      if (status) {
        upsertData.status = status;
        if (status === 'in_progress') {
          upsertData.started_at = now;
        }
        if (status === 'completed') {
          upsertData.completed_at = now;
          upsertData.progress_percent = 100;
        }
      }

      if (progressPercent !== undefined) {
        upsertData.progress_percent = progressPercent;
      }

      if (lastPositionSeconds !== undefined) {
        upsertData.last_position_seconds = lastPositionSeconds;
      }

      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert(upsertData, {
          onConflict: 'member_id,lesson_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['lesson_progress'] });
    },
  });

  // Get member KPIs
  const kpisQuery = useQuery({
    queryKey: ['member_kpis', memberQuery.data?.id],
    queryFn: async () => {
      if (!memberQuery.data?.id) return [];

      const { data, error } = await supabase
        .from('member_kpis')
        .select('*')
        .eq('member_id', memberQuery.data.id)
        .order('week_start_date', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data as unknown as MemberKPI[];
    },
    enabled: !!memberQuery.data?.id,
  });

  // Get current week KPI
  const currentKPI = kpisQuery.data?.[0];

  // Determine demo user status
  const hasActiveMembership = (membershipsQuery.data || []).length > 0;
  const isDemoUser = !!user?.id && !memberQuery.data && !memberQuery.isLoading;

  return {
    member: memberQuery.data,
    memberships: membershipsQuery.data || [],
    courses: coursesQuery.data || [],
    kpis: kpisQuery.data || [],
    currentKPI,
    isDemoUser,
    hasActiveMembership,
    isLoading: memberQuery.isLoading || coursesQuery.isLoading,
    getLessonProgress,
    updateProgress: updateProgressMutation.mutate,
    isUpdatingProgress: updateProgressMutation.isPending,
    refetch: () => {
      memberQuery.refetch();
      coursesQuery.refetch();
      kpisQuery.refetch();
    },
  };
}
