import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ExternalLink, Phone, Mail, Building2 } from 'lucide-react';
import { 
  CrmLead, 
  LEAD_STATUS_LABELS, 
  SOURCE_TYPE_LABELS,
  PIPELINE_STAGE_LABELS,
  PipelineStage,
} from '@/types/crm';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface LeadTableProps {
  leads: CrmLead[];
  loading?: boolean;
  onViewLead?: (lead: CrmLead) => void;
  onEditLead?: (lead: CrmLead) => void;
  onDeleteLead?: (lead: CrmLead) => void;
  onStageChange?: (leadId: string, stage: PipelineStage) => void;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'qualified': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'unqualified': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
}

function getPriorityColor(score?: number) {
  if (!score) return 'text-muted-foreground';
  if (score >= 80) return 'text-green-500 font-semibold';
  if (score >= 60) return 'text-yellow-500 font-medium';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

export function LeadTable({ 
  leads, 
  loading,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onStageChange,
}: LeadTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Keine Leads gefunden
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Pri</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Firma</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Quelle</TableHead>
            <TableHead>Besitzer</TableHead>
            <TableHead>Erstellt</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow 
              key={lead.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewLead?.(lead)}
            >
              <TableCell>
                <span className={getPriorityColor(lead.pipeline_item?.pipeline_priority_score)}>
                  {lead.pipeline_item?.pipeline_priority_score ?? '-'}
                </span>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {lead.first_name} {lead.last_name}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {lead.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {lead.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    {lead.company}
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {lead.pipeline_item && (
                  <Badge variant="outline" className="font-normal">
                    {PIPELINE_STAGE_LABELS[lead.pipeline_item.stage]}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(lead.status)}>
                  {LEAD_STATUS_LABELS[lead.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {SOURCE_TYPE_LABELS[lead.source_type]}
                </span>
              </TableCell>
              <TableCell>
                {lead.owner?.full_name || lead.owner?.first_name || '-'}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(lead.created_at), 'dd.MM.yy', { locale: de })}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onViewLead?.(lead);
                    }}>
                      Details anzeigen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEditLead?.(lead);
                    }}>
                      Bearbeiten
                    </DropdownMenuItem>
                    {lead.website_url && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        window.open(lead.website_url, '_blank');
                      }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website öffnen
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Stage ändern</DropdownMenuLabel>
                    {Object.entries(PIPELINE_STAGE_LABELS).map(([stage, label]) => (
                      <DropdownMenuItem 
                        key={stage}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStageChange?.(lead.id, stage as PipelineStage);
                        }}
                        disabled={lead.pipeline_item?.stage === stage}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLead?.(lead);
                      }}
                    >
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
