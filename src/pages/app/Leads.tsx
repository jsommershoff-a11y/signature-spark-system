import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { LeadFilters } from '@/components/crm/LeadFilters';
import { LeadTable } from '@/components/crm/LeadTable';
import { CreateLeadDialog } from '@/components/crm/CreateLeadDialog';
import { LeadDetailModal } from '@/components/crm/LeadDetailModal';
import { ImportLeadsDialog } from '@/components/crm/ImportLeadsDialog';
import { 
  LeadFilters as LeadFiltersType,
  CrmLead,
  CreateLeadInput,
  PipelineStage,
} from '@/types/crm';

export default function Leads() {
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const { 
    leads, 
    loading, 
    createLead,
    updateLead,
    deleteLead,
    updatePipelineStage,
    refetch,
  } = useLeads(filters);

  const handleCreateLead = async (data: CreateLeadInput) => {
    await createLead(data);
  };

  const handleViewLead = (lead: CrmLead) => {
    setSelectedLead(lead);
    setDetailModalOpen(true);
  };

  const handleEditLead = (lead: CrmLead) => {
    setSelectedLead(lead);
    setDetailModalOpen(true);
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importieren
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Lead
          </Button>
        </div>
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

      <ImportLeadsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={refetch}
      />

      <LeadDetailModal
        lead={selectedLead}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSave={updateLead}
        onStageChange={updatePipelineStage}
      />
    </div>
  );
}
