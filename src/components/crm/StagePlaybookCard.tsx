import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, MessageCircleQuestion, Lightbulb } from 'lucide-react';
import { PipelineStage, PIPELINE_STAGE_LABELS } from '@/types/crm';
import { STAGE_PLAYBOOK } from '@/lib/sales-scripts/stage-playbook';

interface StagePlaybookCardProps {
  stage: PipelineStage;
  className?: string;
}

export function StagePlaybookCard({ stage, className }: StagePlaybookCardProps) {
  const entry = STAGE_PLAYBOOK[stage];
  if (!entry) return null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            Sales-Skript
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {PIPELINE_STAGE_LABELS[stage]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <Target className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ziel</p>
            <p>{entry.ziel}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MessageCircleQuestion className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fragen</p>
            <ul className="list-disc list-outside pl-4 space-y-1 mt-1">
              {entry.fragen.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2">
          <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
          <p className="text-xs text-muted-foreground">{entry.hinweis}</p>
        </div>
      </CardContent>
    </Card>
  );
}
