import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { LearningPath, LearningCourse, PathLevel } from '@/types/lms';

export function useLearningPaths() {
  const { user } = useAuth();

  // Get member ID for progress tracking
  const memberQuery = useQuery({
    queryKey: ['lms-member', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();
      return data?.id || null;
    },
    enabled: !!user?.id,
  });

  const memberId = memberQuery.data;

  // Fetch all learning paths with courses
  const pathsQuery = useQuery({
    queryKey: ['learning-paths', memberId],
    queryFn: async () => {
      // Fetch paths
      const { data: paths, error: pathErr } = await supabase
        .from('learning_paths')
        .select('*')
        .order('sort_order');
      if (pathErr) throw pathErr;

      // Fetch all published courses with modules & lessons
      const { data: courses, error: courseErr } = await supabase
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
      if (courseErr) throw courseErr;

      // Fetch lesson progress if member exists
      let progressMap = new Map<string, string>();
      if (memberId) {
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('lesson_id, status')
          .eq('member_id', memberId);
        (progress || []).forEach((p: { lesson_id: string; status: string }) => {
          progressMap.set(p.lesson_id, p.status);
        });
      }

      // Build enriched paths
      const enrichedPaths: LearningPath[] = (paths || []).map((path: Record<string, unknown>) => {
        const pathCourses = (courses || [])
          .filter((c: Record<string, unknown>) => c.learning_path_id === path.id)
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
            const levelOrder: Record<string, number> = { starter: 1, fortgeschritten: 2, experte: 3 };
            return (levelOrder[(a.path_level as string) || 'starter'] || 1) -
                   (levelOrder[(b.path_level as string) || 'starter'] || 1);
          })
          .map((course: Record<string, unknown>) => {
            const modules = ((course.modules as Record<string, unknown>[]) || [])
              .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
                ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0)
              );
            
            const allLessons = modules.flatMap((m: Record<string, unknown>) =>
              ((m.lessons as Record<string, unknown>[]) || [])
                .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
                  ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0)
                )
            );

            const totalLessons = allLessons.length;
            const completedLessons = allLessons.filter(
              (l: Record<string, unknown>) => progressMap.get(l.id as string) === 'completed'
            ).length;

            return {
              ...course,
              modules: modules.map((m: Record<string, unknown>) => ({
                ...m,
                lessons: ((m.lessons as Record<string, unknown>[]) || [])
                  .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
                    ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0)
                  )
                  .map((l: Record<string, unknown>) => ({
                    ...l,
                    progress_status: progressMap.get(l.id as string) || 'not_started',
                  })),
              })),
              total_lessons: totalLessons,
              completed_lessons: completedLessons,
              progress_percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
            } as LearningCourse;
          });

        // Calculate path-level lock status
        const withLocks = pathCourses.map((course: LearningCourse, idx: number) => {
          if (idx === 0) return { ...course, is_locked: false };
          const prev = pathCourses[idx - 1];
          const prevComplete = (prev.progress_percent || 0) >= 80;
          return { ...course, is_locked: !prevComplete };
        });

        const totalCourses = withLocks.length;
        const completedCourses = withLocks.filter(
          (c: LearningCourse) => (c.progress_percent || 0) >= 100
        ).length;

        return {
          ...path,
          courses: withLocks,
          total_courses: totalCourses,
          completed_courses: completedCourses,
          progress_percent: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
        } as LearningPath;
      });

      return enrichedPaths;
    },
    enabled: memberQuery.isFetched,
  });

  // Also return unassigned courses (not in any path)
  const allCoursesQuery = useQuery({
    queryKey: ['all-courses-lms', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules(*, lessons(*))
        `)
        .eq('published', true)
        .is('learning_path_id', null)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as unknown as LearningCourse[];
    },
    enabled: memberQuery.isFetched,
  });

  // Overall stats
  const allPaths = pathsQuery.data || [];
  const totalLessonsAll = allPaths.reduce((sum, p) =>
    sum + (p.courses || []).reduce((s, c) => s + (c.total_lessons || 0), 0), 0
  );
  const completedLessonsAll = allPaths.reduce((sum, p) =>
    sum + (p.courses || []).reduce((s, c) => s + (c.completed_lessons || 0), 0), 0
  );

  return {
    paths: allPaths,
    standaloneCourses: allCoursesQuery.data || [],
    memberId,
    isLoading: pathsQuery.isLoading || memberQuery.isLoading,
    totalLessons: totalLessonsAll,
    completedLessons: completedLessonsAll,
    overallProgress: totalLessonsAll > 0 ? Math.round((completedLessonsAll / totalLessonsAll) * 100) : 0,
    refetch: () => {
      pathsQuery.refetch();
      allCoursesQuery.refetch();
    },
  };
}
