import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Course, Module, Lesson } from '@/types/members';

export function useCourses() {
  const queryClient = useQueryClient();

  // Fetch all published courses
  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('sort_order');

      if (error) throw error;
      return data as unknown as Course[];
    },
  });

  // Fetch single course with modules and lessons
  const fetchCourse = async (courseId: string): Promise<Course | null> => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules(
          *,
          lessons(*)
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    // Sort modules and lessons by sort_order
    if (data.modules) {
      (data.modules as unknown[]).sort((a: unknown, b: unknown) => 
        ((a as Module).sort_order || 0) - ((b as Module).sort_order || 0)
      );
      (data.modules as unknown[]).forEach((mod: unknown) => {
        const module = mod as { lessons?: unknown[] };
        if (module.lessons) {
          module.lessons.sort((a: unknown, b: unknown) => 
            ((a as Lesson).sort_order || 0) - ((b as Lesson).sort_order || 0)
          );
        }
      });
    }

    return data as unknown as Course;
  };

  // Fetch modules for a course
  const fetchModules = async (courseId: string): Promise<Module[]> => {
    const { data, error } = await supabase
      .from('modules')
      .select(`
        *,
        lessons(*)
      `)
      .eq('course_id', courseId)
      .order('sort_order');

    if (error) throw error;

    // Sort lessons within each module
    (data || []).forEach((mod) => {
      if (mod.lessons) {
        (mod.lessons as unknown[]).sort((a: unknown, b: unknown) => 
          ((a as Lesson).sort_order || 0) - ((b as Lesson).sort_order || 0)
        );
      }
    });

    return data as unknown as Module[];
  };

  // Fetch lessons for a module
  const fetchLessons = async (moduleId: string): Promise<Lesson[]> => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('sort_order');

    if (error) throw error;
    return data as unknown as Lesson[];
  };

  // Fetch single lesson
  const fetchLesson = async (lessonId: string): Promise<Lesson | null> => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as unknown as Lesson;
  };

  // Admin: Create course
  const createCourseMutation = useMutation({
    mutationFn: async (course: Partial<Course>) => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          name: course.name!,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          published: course.published,
          required_product: course.required_product,
          sort_order: course.sort_order,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // Admin: Update course
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Course> & { id: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // Admin: Create module
  const createModuleMutation = useMutation({
    mutationFn: async (module: Partial<Module>) => {
      const { data, error } = await supabase
        .from('modules')
        .insert({
          course_id: module.course_id!,
          name: module.name!,
          description: module.description,
          sort_order: module.sort_order,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // Admin: Create lesson
  const createLessonMutation = useMutation({
    mutationFn: async (lesson: Partial<Lesson>) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          module_id: lesson.module_id!,
          name: lesson.name!,
          description: lesson.description,
          content_ref: lesson.content_ref,
          lesson_type: lesson.lesson_type,
          duration_seconds: lesson.duration_seconds,
          sort_order: lesson.sort_order,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  return {
    courses: coursesQuery.data || [],
    isLoading: coursesQuery.isLoading,
    fetchCourse,
    fetchModules,
    fetchLessons,
    fetchLesson,
    createCourse: createCourseMutation.mutate,
    updateCourse: updateCourseMutation.mutate,
    createModule: createModuleMutation.mutate,
    createLesson: createLessonMutation.mutate,
    refetch: () => coursesQuery.refetch(),
  };
}
