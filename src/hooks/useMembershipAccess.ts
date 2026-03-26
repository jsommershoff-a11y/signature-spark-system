import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const TIER_ORDER: Record<string, number> = {
  freebie: 0,
  basic: 1,
  starter: 2,
  growth: 3,
  premium: 4,
};

/** Max free demo lessons per course for non-paying users */
export const DEMO_LESSON_LIMIT = 2;

export type MembershipTier = 'none' | 'basic' | 'starter' | 'growth' | 'premium';

export function useMembershipAccess() {
  const { user } = useAuth();

  const membershipQuery = useQuery({
    queryKey: ['membership-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return { memberId: null, products: [] as string[], highestTier: 0, tierName: 'none' as MembershipTier };

      // Get member
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!member) return { memberId: null, products: [] as string[], highestTier: 0, tierName: 'none' as MembershipTier };

      // Get active memberships
      const { data: memberships } = await supabase
        .from('memberships')
        .select('product, status')
        .eq('member_id', member.id)
        .eq('status', 'active');

      const products = (memberships || []).map((m) => m.product);
      const highestTier = products.reduce((max, p) => Math.max(max, TIER_ORDER[p] || 0), 0);

      // Determine tier name
      const tierNames: MembershipTier[] = ['none', 'basic', 'starter', 'growth', 'premium'];
      const tierName = tierNames[highestTier] || 'none';

      return { memberId: member.id, products, highestTier, tierName };
    },
    enabled: !!user?.id,
  });

  const { memberId, products, highestTier, tierName } = membershipQuery.data || {
    memberId: null,
    products: [] as string[],
    highestTier: 0,
    tierName: 'none' as MembershipTier,
  };

  /**
   * Check if user can access a course.
   */
  function canAccessCourse(course: {
    price_tier?: string | null;
    required_product?: string | null;
  }): { hasAccess: boolean; reason: string } {
    // Freebie courses → always accessible
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
      const requiredLevel = TIER_ORDER[course.required_product] || 0;
      if (highestTier < requiredLevel) {
        return {
          hasAccess: false,
          reason: `Erfordert mindestens das "${course.required_product}"-Paket.`,
        };
      }
    }

    // Check price_tier mapping
    const tierLevel = TIER_ORDER[course.price_tier || 'freebie'] || 0;
    if (tierLevel > 0 && highestTier < tierLevel) {
      const tierLabel = tierLevel === 1 ? 'Mitgliedschaft' : tierLevel === 2 ? 'Starter' : tierLevel === 3 ? 'Growth' : 'Premium';
      return {
        hasAccess: false,
        reason: `Dieser Kurs erfordert das "${tierLabel}"-Paket.`,
      };
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

  /**
   * Check if user has at least a certain tier
   */
  function hasMinTier(minTier: MembershipTier): boolean {
    const minLevel = TIER_ORDER[minTier] || 0;
    return highestTier >= minLevel;
  }

  return {
    memberId,
    products,
    highestTier,
    tierName,
    isLoading: membershipQuery.isLoading,
    canAccessCourse,
    canAccessLesson,
    hasMinTier,
  };
}
