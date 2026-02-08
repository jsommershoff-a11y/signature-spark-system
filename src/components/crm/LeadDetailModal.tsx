import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { useCalls } from '@/hooks/useCalls';
import { TaskCard } from './TaskCard';
import { CallList } from '@/components/calls/CallList';
import { ScheduleCallDialog } from '@/components/calls/ScheduleCallDialog';
import {
  CrmLead,
  UpdateLeadInput,
  PipelineStage,
  LeadStatus,
  PIPELINE_STAGE_LABELS,
  LEAD_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
} from '@/types/crm';
import { Call, CreateCallInput } from '@/types/calls';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Briefcase,
  Save,
  Loader2,
  Plus,
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: CrmLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateLeadInput) => Promise<CrmLead | null>;
  onStageChange: (leadId: string, stage: PipelineStage) => Promise<boolean>;
  onDelete?: () => Promise<void>;
}

export function LeadDetailModal({
  lead,
  open,
  onOpenChange,
  onSave,
  onStageChange,
}: LeadDetailModalProps) {
  const [formData, setFormData] = useState<Partial<CrmLead>>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false);

  const { tasks, updateTask } = useTasks({ lead_id: lead?.id });
  const { calls, loading: callsLoading, createCall } = useCalls({ lead_id: lead?.id });

  useEffect(() => {
    if (lead) {
      setFormData({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        website_url: lead.website_url,
        industry: lead.industry,
        location: lead.location,
        icp_fit_score: lead.icp_fit_score,
        status: lead.status,
        notes: lead.notes,
      });
      setHasChanges(false);
    }
  }, [lead]);

  const handleChange = (field: keyof CrmLead, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    await onSave({
      id: lead.id,
      ...formData,
    } as UpdateLeadInput);
    setSaving(false);
    setHasChanges(false);
  };

  const handleStageChange = async (stage: PipelineStage) => {
    if (!lead) return;
    await onStageChange(lead.id, stage);
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (!lead) return;
    handleChange('status', status);
    await onSave({
      id: lead.id,
      status,
    });
  };

  const handleTaskComplete = async (taskId: string) => {
    await updateTask({ id: taskId, status: 'done' });
  };

  const handleTaskReopen = async (taskId: string) => {
    await updateTask({ id: taskId, status: 'open' });
  };

  const handleScheduleCall = async (data: CreateCallInput) => {
    await createCall(data);
    setScheduleCallOpen(false);
  };

  const handleViewCall = (call: Call) => {
    // Navigate to call detail - close modal first
    onOpenChange(false);
    window.location.href = `/app/calls/${call.id}`;
  };

  if (!lead) return null;

  const currentStage = lead.pipeline_item?.stage || 'new_lead';
  const priorityScore = lead.pipeline_item?.pipeline_priority_score || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            {lead.first_name} {lead.last_name || ''}
            <Badge variant="outline" className="ml-2">
              {SOURCE_TYPE_LABELS[lead.source_type]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="calls">
              Calls {calls.length > 0 && `(${calls.length})`}
            </TabsTrigger>
            <TabsTrigger value="activities">
              Aktivitäten {tasks.length > 0 && `(${tasks.length})`}
            </TabsTrigger>
            <TabsTrigger value="notes">Notizen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Kontaktdaten
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Vorname</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name || ''}
                    onChange={e => handleChange('first_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nachname</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name || ''}
                    onChange={e => handleChange('last_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    E-Mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={e => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={e => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Unternehmen
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Firma</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={e => handleChange('company', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Website
                  </Label>
                  <Input
                    id="website_url"
                    value={formData.website_url || ''}
                    onChange={e => handleChange('website_url', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Branche
                  </Label>
                  <Input
                    id="industry"
                    value={formData.industry || ''}
                    onChange={e => handleChange('industry', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Standort
                  </Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={e => handleChange('location', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Scoring & Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Scoring & Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ICP Score</Label>
                  <div className="flex items-center gap-3">
                    <Progress value={formData.icp_fit_score || 0} className="flex-1" />
                    <span className="text-sm font-medium w-10 text-right">
                      {formData.icp_fit_score || 0}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Priority Score</Label>
                  <div className="flex items-center gap-3">
                    <Progress value={priorityScore} className="flex-1" />
                    <span className="text-sm font-medium w-10 text-right">
                      {priorityScore}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Pipeline Stage</Label>
                  <Select value={currentStage} onValueChange={handleStageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PIPELINE_STAGE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status || 'new'} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calls" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setScheduleCallOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Call planen
                </Button>
              </div>
              <CallList
                calls={calls}
                loading={callsLoading}
                onViewCall={handleViewCall}
                compact
                emptyMessage="Keine Calls für diesen Lead"
              />
            </div>
          </TabsContent>

          <TabsContent value="activities" className="mt-4">
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Keine Aktivitäten für diesen Lead
                </p>
              ) : (
                tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleTaskComplete}
                    onReopen={handleTaskReopen}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Notizen zum Lead..."
                className="min-h-[200px]"
                value={formData.notes || ''}
                onChange={e => handleChange('notes', e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Änderungen speichern
              </>
            )}
          </Button>
        </DialogFooter>

        <ScheduleCallDialog
          open={scheduleCallOpen}
          onOpenChange={setScheduleCallOpen}
          leadId={lead.id}
          leadName={`${lead.first_name} ${lead.last_name || ''}`}
          onSchedule={handleScheduleCall}
        />
      </DialogContent>
    </Dialog>
  );
}
