import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { LeadFilters } from '@/components/crm/LeadFilters';
import { LeadTable } from '@/components/crm/LeadTable';
import { CreateLeadDialog } from '@/components/crm/CreateLeadDialog';
import { 
  LeadFilters as LeadFiltersType,
  CrmLead,
  CreateLeadInput,
  PipelineStage,
} from '@/types/crm';

export default function Leads() {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const { 
    leads, 
    loading, 
    createLead,
    deleteLead,
    updatePipelineStage,
  } = useLeads(filters);

  const handleCreateLead = async (data: CreateLeadInput) => {
    await createLead(data);
  };

  const handleViewLead = (lead: CrmLead) => {
    // TODO: Open detail modal
    console.log('View lead:', lead);
  };

  const handleEditLead = (lead: CrmLead) => {
    // TODO: Open edit modal
    console.log('Edit lead:', lead);
  };

  const handleDeleteLead = async (lead: CrmLead) => {
    if (window.confirm(`Möchtest du ${lead.first_name} ${lead.last_name || ''} wirklich löschen?`)) {
      await deleteLead(lead.id);
    }
  };

  const handleStageChange = async (leadId: string, stage: PipelineStage) => {
    await updatePipelineStage(leadId, stage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Verwalte deine Interessenten und neue Anfragen
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Lead
        </Button>
      </div>

      <LeadFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      <LeadTable
        leads={leads}
        loading={loading}
        onViewLead={handleViewLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleDeleteLead}
        onStageChange={handleStageChange}
      />

      <CreateLeadDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateLead}
      />
    </div>
  );
}
