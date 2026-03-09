import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CoursePriceTier } from '@/types/lms';

const TIER_ORDER: Record<string, number> = {
  freebie: 0,
  low_budget: 1,
  mid_range: 2,
  high_class: 3,
};

const PRODUCT_TIER: Record<string, number> = {
  starter: 1,
  growth: 2,
  premium: 3,
};

/** Max free demo lessons per course for non-paying users */
export const DEMO_LESSON_LIMIT = 2;

export function useMembershipAccess() {
  const { user } = useAuth();

  const membershipQuery = useQuery({
    queryKey: ['membership-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return { memberId: null, products: [] as string[], highestTier: 0 };

      // Get member
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!member) return { memberId: null, products: [] as string[], highestTier: 0 };

      // Get active memberships
      const { data: memberships } = await supabase
        .from('memberships')
        .select('product, status')
        .eq('member_id', member.id)
        .eq('status', 'active');

      const products = (memberships || []).map((m) => m.product);
      const highestTier = products.reduce((max, p) => Math.max(max, PRODUCT_TIER[p] || 0), 0);

      return { memberId: member.id, products, highestTier };
    },
    enabled: !!user?.id,
  });

  const { memberId, products, highestTier } = membershipQuery.data || {
    memberId: null,
    products: [] as string[],
    highestTier: 0,
  };

  /**
   * Check if user can access a course.
   * Returns { hasAccess, reason }
   */
  function canAccessCourse(course: {
    price_tier?: string | null;
    required_product?: string | null;
  }): { hasAccess: boolean; reason: string } {
    // Freebie courses with no required_product → always accessible
    if (
      (!course.price_tier || course.price_tier === 'freebie') &&
      !course.required_product
    ) {
      return { hasAccess: true, reason: '' };
    }

    if (!memberId) {
      return { hasAccess: false, reason: 'Kein aktives Mitgliedskonto gefunden.' };
    }

    // Check required_product
    if (course.required_product) {
      const requiredLevel = PRODUCT_TIER[course.required_product] || 0;
      if (highestTier < requiredLevel) {
        return {
          hasAccess: false,
          reason: `Erfordert mindestens das "${course.required_product}"-Paket.`,
        };
      }
    }

    // Check price_tier: low_budget → starter, mid_range → growth, high_class → premium
    const tierLevel = TIER_ORDER[course.price_tier || 'freebie'] || 0;
    if (tierLevel > 0) {
      const neededProduct = tierLevel <= 1 ? 1 : tierLevel <= 2 ? 2 : 3;
      if (highestTier < neededProduct) {
        const productName = neededProduct === 1 ? 'Starter' : neededProduct === 2 ? 'Growth' : 'Premium';
        return {
          hasAccess: false,
          reason: `Dieser Kurs erfordert das "${productName}"-Paket.`,
        };
      }
    }

    return { hasAccess: true, reason: '' };
  }

  /**
   * Check if a specific lesson is accessible (demo mode: first N lessons free).
   */
  function canAccessLesson(
    lessonIndex: number,
    courseAccess: { hasAccess: boolean },
  ): boolean {
    if (courseAccess.hasAccess) return true;
    return lessonIndex < DEMO_LESSON_LIMIT;
  }

  return {
    memberId,
    products,
    highestTier,
    isLoading: membershipQuery.isLoading,
    canAccessCourse,
    canAccessLesson,
  };
}
