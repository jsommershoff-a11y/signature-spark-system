import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Lightbulb } from 'lucide-react';
import { CustomerAvatar } from '@/types/automation';

export function CustomerAvatarWidget() {
  const { data: avatarModel, isLoading } = useQuery({
    queryKey: ['customer_avatar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_avatar_models')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kunden-Avatar (PCA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!avatarModel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kunden-Avatar (PCA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch keine Avatar-Daten verfügbar.</p>
            <p className="text-xs">Wird nach ersten Abschlüssen generiert.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const avatar = avatarModel.avatar_json as unknown as CustomerAvatar;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Kunden-Avatar (PCA)
          <span className="text-xs text-muted-foreground font-normal">
            v{avatarModel.version} • {avatarModel.sample_size} Kunden
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {avatar?.summary && (
          <p className="text-sm">{avatar.summary}</p>
        )}

        {/* Pain Points */}
        {avatar?.psychographics?.pain_points && avatar.psychographics.pain_points.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
              <Target className="h-4 w-4 text-red-500" />
              Typische Pain Points
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {avatar.psychographics.pain_points.slice(0, 3).map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decision Factors */}
        {avatar?.psychographics?.decision_factors && avatar.psychographics.decision_factors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Entscheidungsfaktoren
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {avatar.psychographics.decision_factors.slice(0, 3).map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sales Cycle */}
        {avatar?.behavior?.typical_sales_cycle_days && (
          <div className="text-sm text-muted-foreground">
            Typischer Sales Cycle: <span className="font-medium text-foreground">{avatar.behavior.typical_sales_cycle_days} Tage</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
