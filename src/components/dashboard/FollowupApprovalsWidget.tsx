import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Check, X, ChevronRight, User, Building2 } from 'lucide-react';
import { useFollowupPlans } from '@/hooks/useFollowupPlans';
import { FOLLOWUP_STATUS_COLORS, STEP_TYPE_LABELS } from '@/types/automation';

export function FollowupApprovalsWidget() {
  const { pendingPlans, pendingCount, isLoading, approvePlan, rejectPlan } = useFollowupPlans();

  // Get first 3 pending plans
  const topPlans = pendingPlans.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Ausstehende Genehmigungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Followup-Genehmigungen
          {pendingCount > 0 && (
            <Badge variant="destructive">{pendingCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topPlans.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <ClipboardCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Keine ausstehenden Genehmigungen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-3 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {plan.lead?.first_name} {plan.lead?.last_name}
                    </span>
                    {plan.lead?.company && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {plan.lead.company}
                        </span>
                      </>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {plan.triggered_by || 'Manuell'}
                  </Badge>
                </div>

                {plan.plan_json && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {(plan.plan_json as { summary?: string }).summary}
                  </p>
                )}

                {plan.steps && plan.steps.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {plan.steps.slice(0, 4).map((step, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {STEP_TYPE_LABELS[step.step_type as keyof typeof STEP_TYPE_LABELS] || step.step_type}
                      </Badge>
                    ))}
                    {plan.steps.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{plan.steps.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectPlan({ planId: plan.id })}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Ablehnen
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approvePlan(plan.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Genehmigen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
