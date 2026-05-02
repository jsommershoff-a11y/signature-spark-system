import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminMembers } from '@/hooks/useAdminMembers';
import { PIPELINE_STAGE_LABELS } from '@/types/crm';
import {
  Users, BookOpen, GraduationCap, AlertTriangle, TrendingUp, Plus, UserPlus,
  Pencil, Trash2, Loader2, Search, Eye, ChevronRight, BarChart3,
  FolderOpen, FileText, Play, CheckSquare, HelpCircle, ArrowUpDown,
  Save, X, LayoutGrid, List, Handshake, CheckCircle2, AlertCircle, Mail, Copy, Check
} from 'lucide-react';
import {
  MEMBER_STATUS_LABELS, MEMBER_STATUS_COLORS,
  PRODUCT_LABELS, LESSON_TYPE_LABELS,
  type MemberStatus, type Member
} from '@/types/members';

// ──────────────────────────────────────────────
// Sub-Tab: Mitglieder-Übersicht
// ──────────────────────────────────────────────
interface LeadOption {
  id: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  company?: string | null;
  pipeline_item?: { stage: string }[];
}

export function InviteMemberDialog({ open, onOpenChange, prefillEmail, prefillName, prefillLeadId }: { open: boolean; onOpenChange: (o: boolean) => void; prefillEmail?: string; prefillName?: string; prefillLeadId?: string }) {
  const [email, setEmail] = useState(prefillEmail || '');
  const [name, setName] = useState(prefillName || '');
  const [role, setRole] = useState<string>('member_basic');
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<'new' | 'lead'>(prefillLeadId ? 'new' : 'lead');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadResults, setLeadResults] = useState<LeadOption[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    emailSent: boolean;
    provider: 'gmail' | 'resend' | 'outlook' | null;
    triedProviders?: string[];
    inviteLink?: string;
    recipient: string;
    timestamp: number;
  } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      sonnerToast.success('Einladungslink kopiert');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      sonnerToast.error('Kopieren fehlgeschlagen – Link bitte manuell markieren.');
    }
  };

  // Sync prefill when dialog re-opens with new lead
  useEffect(() => {
    if (open) {
      setEmail(prefillEmail || '');
      setName(prefillName || '');
      setLastResult(null);
      setLinkCopied(false);
    }
  }, [open, prefillEmail, prefillName]);

  // Debounced lead search
  useEffect(() => {
    if (mode !== 'lead' || leadSearch.length < 2) {
      setLeadResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const term = `%${leadSearch}%`;
      const { data } = await supabase
        .from('crm_leads')
        .select('id, first_name, last_name, email, company, pipeline_item:pipeline_items(stage)')
        .or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},company.ilike.${term}`)
        .limit(10);
      setLeadResults((data as unknown as LeadOption[]) || []);
      setSearchLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [leadSearch, mode]);

  const selectLead = (lead: LeadOption) => {
    setSelectedLead(lead);
    setEmail(lead.email);
    setName([lead.first_name, lead.last_name].filter(Boolean).join(' '));
    setLeadSearch('');
    setLeadResults([]);
  };

  const clearLead = () => {
    setSelectedLead(null);
    setEmail('');
    setName('');
  };

  const handleInvite = async () => {
    if (!email) return;
    setSending(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: {
          email,
          role,
          name: name || undefined,
          lead_id: selectedLead?.id || prefillLeadId || undefined,
        },
      });
      if (error) throw error;

      const inviteLink: string | undefined = data?.invite_link;
      const emailSent: boolean = !!data?.email_sent;
      const provider = (data?.email_provider || null) as 'gmail' | 'resend' | 'outlook' | null;
      const triedProviders: string[] = Array.isArray(data?.tried_providers) ? data.tried_providers : [];

      // Always copy link as a fallback
      if (inviteLink) {
        try { await navigator.clipboard.writeText(inviteLink); } catch { /* ignore */ }
      }

      setLastResult({
        success: true,
        emailSent,
        provider,
        triedProviders,
        inviteLink,
        recipient: email,
        timestamp: Date.now(),
      });

      if (emailSent) {
        const usedFallback = provider && provider !== 'gmail';
        toast({
          title: usedFallback ? `Versendet via ${provider} (Fallback)` : 'Einladung via Gmail versendet',
          description: `Mail an ${email} verschickt. Link in Zwischenablage kopiert.${selectedLead || prefillLeadId ? ' Lead konvertiert.' : ''}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Mail nicht versendet',
          description: `Kein Mail-Provider verfügbar. Link wurde in die Zwischenablage kopiert und steht im Dialog bereit.`,
        });
        // Persistenter Sonner-Toast mit Copy-Action, damit Admin den Link auch nach Dialog-Schließen hat
        if (inviteLink) {
          sonnerToast.error('Einladungs-Mail nicht zugestellt', {
            description: `Empfänger: ${email}. Bitte den Link manuell weiterleiten.`,
            duration: 30000,
            action: {
              label: 'Link kopieren',
              onClick: () => { navigator.clipboard.writeText(inviteLink).catch(() => {}); },
            },
          });
        }
      }
    } catch (err: any) {
      setLastResult({
        success: false,
        emailSent: false,
        provider: null,
        recipient: email,
        timestamp: Date.now(),
      });
      toast({ variant: 'destructive', title: 'Fehler', description: err.message || 'Einladung konnte nicht versendet werden.' });
    } finally {
      setSending(false);
    }
  };

  const stageLabel = (stage?: string) => {
    const map: Record<string, string> = {
      new_lead: 'Neuer Lead', setter_call_scheduled: 'Call geplant', setter_call_done: 'Call erledigt',
      analysis_ready: 'Analyse fertig', offer_draft: 'Angebot Entwurf', offer_sent: 'Angebot gesendet',
      payment_unlocked: 'Zahlung freigeschaltet', won: 'Gewonnen', lost: 'Verloren',
    };
    return stage ? map[stage] || stage : '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mitglied einladen</DialogTitle>
          <DialogDescription>Aus Lead-Datenbank auswählen oder manuell einladen.</DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 border rounded-md p-1 bg-muted/30">
          <Button variant={mode === 'lead' ? 'default' : 'ghost'} size="sm" className="flex-1 gap-1.5" onClick={() => { setMode('lead'); clearLead(); }}>
            <Search className="h-3.5 w-3.5" /> Aus Leads
          </Button>
          <Button variant={mode === 'new' ? 'default' : 'ghost'} size="sm" className="flex-1 gap-1.5" onClick={() => { setMode('new'); clearLead(); }}>
            <UserPlus className="h-3.5 w-3.5" /> Neues Mitglied
          </Button>
        </div>

        <div className="space-y-3 py-1">
          {/* Lead search */}
          {mode === 'lead' && !selectedLead && (
            <div className="space-y-2">
              <Label>Lead suchen</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Name, E-Mail oder Firma..." value={leadSearch} onChange={e => setLeadSearch(e.target.value)} className="pl-9" />
              </div>
              {searchLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Suche...</div>}
              {leadResults.length > 0 && (
                <div className="border rounded-md max-h-48 overflow-y-auto divide-y">
                  {leadResults.map(lead => {
                    const stage = lead.pipeline_item?.[0]?.stage;
                    return (
                      <button key={lead.id} className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors" onClick={() => selectLead(lead)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{lead.first_name} {lead.last_name || ''}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}{lead.company ? ` · ${lead.company}` : ''}</p>
                          </div>
                          {stage && <Badge variant="outline" className="text-[10px]">{stageLabel(stage)}</Badge>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {leadSearch.length >= 2 && !searchLoading && leadResults.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Keine Leads gefunden</p>
              )}
            </div>
          )}

          {/* Selected lead chip */}
          {selectedLead && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
              <div>
                <p className="text-sm font-medium">{selectedLead.first_name} {selectedLead.last_name || ''}</p>
                <p className="text-xs text-muted-foreground">{selectedLead.email}{selectedLead.company ? ` · ${selectedLead.company}` : ''}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearLead}><X className="h-3.5 w-3.5" /></Button>
            </div>
          )}

          <div>
            <Label>E-Mail *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@firma.de" readOnly={!!selectedLead} className={selectedLead ? 'bg-muted' : ''} />
          </div>
          <div>
            <Label>Name (optional)</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Vor- und Nachname" readOnly={!!selectedLead} className={selectedLead ? 'bg-muted' : ''} />
          </div>
          <div>
            <Label>Mitgliedschafts-Stufe</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member_basic">Basic</SelectItem>
                <SelectItem value="member_starter">Starter</SelectItem>
                <SelectItem value="member_pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Versand-Statusanzeige */}
        {lastResult && (
          <div
            className={`rounded-md border p-3 text-sm ${
              lastResult.emailSent
                ? lastResult.provider === 'gmail'
                  ? 'border-green-500/40 bg-green-500/10'
                  : 'border-amber-500/40 bg-amber-500/10'
                : 'border-destructive/40 bg-destructive/10'
            }`}
          >
            <div className="flex items-start gap-2">
              {lastResult.emailSent ? (
                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${lastResult.provider === 'gmail' ? 'text-green-600' : 'text-amber-600'}`} />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">
                    {lastResult.emailSent ? 'Einladung versendet' : 'Mail nicht versendet'}
                  </span>
                  {lastResult.provider && (
                    <Badge
                      variant="outline"
                      className={`gap-1 ${
                        lastResult.provider === 'gmail'
                          ? 'border-green-500/50 text-green-700 dark:text-green-500'
                          : 'border-amber-500/50 text-amber-700 dark:text-amber-500'
                      }`}
                    >
                      <Mail className="h-3 w-3" />
                      {lastResult.provider === 'gmail' && 'Gmail'}
                      {lastResult.provider === 'resend' && 'Resend (Fallback)'}
                      {lastResult.provider === 'outlook' && 'Outlook (Fallback)'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  Empfänger: {lastResult.recipient}
                </p>
                {lastResult.provider && lastResult.provider !== 'gmail' && (
                  <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                    Gmail war nicht verfügbar – {lastResult.provider === 'resend' ? 'Resend' : 'Outlook'} wurde als Fallback verwendet.
                  </p>
                )}
                {lastResult.inviteLink && (
                  <div className="mt-3 space-y-1">
                    <Label className="text-xs">
                      {lastResult.emailSent ? 'Einladungslink (zur Sicherheit)' : 'Einladungslink – bitte manuell weiterleiten'}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={lastResult.inviteLink}
                        onFocus={(e) => e.currentTarget.select()}
                        className="text-xs font-mono bg-background"
                      />
                      <Button
                        type="button"
                        variant={linkCopied ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => copyLink(lastResult.inviteLink!)}
                        className="gap-1.5 shrink-0"
                      >
                        {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {linkCopied ? 'Kopiert' : 'Kopieren'}
                      </Button>
                    </div>
                    {!lastResult.emailSent && (
                      <p className="text-[11px] text-muted-foreground">
                        Link ist 7 Tage gültig. Versende ihn z. B. via WhatsApp, SMS oder persönlich.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {lastResult?.emailSent ? 'Schließen' : 'Abbrechen'}
          </Button>
          <Button onClick={handleInvite} disabled={!email || sending} className="gap-1.5">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {lastResult?.emailSent ? 'Erneut einladen' : selectedLead ? 'Einladen & Konvertieren' : 'Einladen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MembersListSection() {
  const { members, atRiskMembers, topPerformers, isLoading, updateStatus } = useAdminMembers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const { toast } = useToast();

  const filtered = members.filter((m) => {
    const name = m.profile?.full_name || m.profile?.email || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    paused: members.filter(m => m.status === 'paused').length,
    churned: members.filter(m => m.status === 'churned').length,
    atRisk: atRiskMembers.length,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Gesamt" value={stats.total} icon={Users} />
        <StatCard label="Aktiv" value={stats.active} icon={TrendingUp} color="text-emerald-600" />
        <StatCard label="Pausiert" value={stats.paused} icon={BarChart3} color="text-amber-600" />
        <StatCard label="Gekündigt" value={stats.churned} icon={AlertTriangle} color="text-destructive" />
        <StatCard label="At-Risk" value={stats.atRisk} icon={AlertTriangle} color="text-orange-600" />
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topPerformers.map((kpi: any) => (
                <Badge key={kpi.id} variant="secondary" className="gap-1">
                  {(kpi.member as any)?.profile?.full_name || 'Unbekannt'}
                  <span className="text-emerald-600 font-bold ml-1">{kpi.activity_score}%</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Name oder E-Mail suchen..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="paused">Pausiert</SelectItem>
            <SelectItem value="churned">Gekündigt</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" /> Mitglied einladen
        </Button>
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitglied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead className="hidden md:table-cell">Letzte Aktivität</TableHead>
                <TableHead className="hidden md:table-cell">Onboarded</TableHead>
                <TableHead>Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Keine Mitglieder gefunden</TableCell></TableRow>
              ) : filtered.map(member => {
                const activeMembership = member.memberships?.find((ms: any) => ms.status === 'active');
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{member.profile?.full_name || 'Unbekannt'}</p>
                        <p className="text-xs text-muted-foreground">{member.profile?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={MEMBER_STATUS_COLORS[member.status]}>{MEMBER_STATUS_LABELS[member.status]}</Badge>
                    </TableCell>
                    <TableCell>
                      {activeMembership
                        ? <Badge variant="outline">{PRODUCT_LABELS[activeMembership.product as keyof typeof PRODUCT_LABELS] || activeMembership.product}</Badge>
                        : <span className="text-xs text-muted-foreground">–</span>
                      }
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {member.last_active_at ? new Date(member.last_active_at).toLocaleDateString('de-DE') : '–'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {member.onboarded_at ? new Date(member.onboarded_at).toLocaleDateString('de-DE') : '–'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={member.status}
                          onValueChange={(val) => {
                            updateStatus({ memberId: member.id, status: val as MemberStatus });
                            toast({ title: 'Status aktualisiert' });
                          }}
                        >
                          <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Aktiv</SelectItem>
                            <SelectItem value="paused">Pausiert</SelectItem>
                            <SelectItem value="churned">Gekündigt</SelectItem>
                          </SelectContent>
                        </Select>
                        <ReinviteButton email={member.profile?.email} name={member.profile?.full_name} />
                        <InviteAffiliateButton profileId={member.profile_id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`h-5 w-5 ${color || 'text-muted-foreground'}`} />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InviteAffiliateButton({ profileId }: { profileId?: string | null }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!profileId) return null;

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('affiliate-invite', {
        body: { profile_id: profileId },
      });
      if (error) throw error;
      toast({
        title: 'Affiliate eingeladen',
        description: `Code: ${data?.referral_code ?? '—'}. Onboarding-Link wurde generiert.`,
      });
      if (data?.onboarding_url) {
        navigator.clipboard?.writeText(data.onboarding_url).catch(() => {});
      }
    } catch (e) {
      toast({
        title: 'Fehler',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8"
      title="Als Affiliate einladen"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Handshake className="h-4 w-4" />}
    </Button>
  );
}

function ReinviteButton({ email, name }: { email?: string | null; name?: string | null }) {
  const [open, setOpen] = useState(false);
  if (!email) return null;
  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        title="Portal-Einladung erneut senden"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4" />
      </Button>
      <InviteMemberDialog
        open={open}
        onOpenChange={setOpen}
        prefillEmail={email}
        prefillName={name || undefined}
      />
    </>
  );
}
// ──────────────────────────────────────────────
// Sub-Tab: Lernpfade verwalten
// ──────────────────────────────────────────────
function LearningPathsManagement() {
  const [paths, setPaths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editPath, setEditPath] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPaths = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*, courses(id, name, published, path_level, sort_order)')
      .order('sort_order');
    if (error) { toast({ variant: 'destructive', title: 'Fehler', description: error.message }); }
    setPaths(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchPaths(); }, []);

  const savePath = async (form: any) => {
    const payload = { name: form.name, description: form.description, icon: form.icon, color: form.color, sort_order: parseInt(form.sort_order) || 0 };
    if (form.id) {
      const { error } = await supabase.from('learning_paths').update(payload).eq('id', form.id);
      if (error) { toast({ variant: 'destructive', title: 'Fehler', description: error.message }); return; }
    } else {
      const { error } = await supabase.from('learning_paths').insert(payload);
      if (error) { toast({ variant: 'destructive', title: 'Fehler', description: error.message }); return; }
    }
    toast({ title: form.id ? 'Pfad aktualisiert' : 'Pfad erstellt' });
    setDialogOpen(false);
    setEditPath(null);
    fetchPaths();
  };

  const deletePath = async (id: string) => {
    const { error } = await supabase.from('learning_paths').delete().eq('id', id);
    if (error) { toast({ variant: 'destructive', title: 'Fehler', description: error.message }); return; }
    toast({ title: 'Pfad gelöscht' });
    fetchPaths();
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Lernpfade ({paths.length})</h3>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditPath(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Neuer Pfad</Button>
          </DialogTrigger>
          <DialogContent>
            <PathForm initial={editPath} onSave={savePath} onCancel={() => { setDialogOpen(false); setEditPath(null); }} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {paths.map(path => (
          <Card key={path.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <p className="font-medium truncate">{path.name}</p>
                  <Badge variant="outline" className="text-xs">{(path.courses || []).length} Kurse</Badge>
                </div>
                {path.description && <p className="text-xs text-muted-foreground mt-1 truncate">{path.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditPath(path); setDialogOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePath(path.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {paths.length === 0 && <p className="text-center text-muted-foreground py-8">Keine Lernpfade vorhanden</p>}
      </div>
    </div>
  );
}

function PathForm({ initial, onSave, onCancel }: { initial?: any; onSave: (f: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id || '',
    name: initial?.name || '',
    description: initial?.description || '',
    icon: initial?.icon || 'BookOpen',
    color: initial?.color || 'orange',
    sort_order: initial?.sort_order?.toString() || '0',
  });
  return (
    <>
      <DialogHeader>
        <DialogTitle>{form.id ? 'Pfad bearbeiten' : 'Neuer Lernpfad'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div><Label>Beschreibung</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Icon</Label><Input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} /></div>
          <div><Label>Farbe</Label>
            <Select value={form.color} onValueChange={v => setForm(p => ({ ...p, color: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="blue">Blau</SelectItem>
                <SelectItem value="green">Grün</SelectItem>
                <SelectItem value="purple">Lila</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Reihenfolge</Label><Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} /></div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name}><Save className="h-4 w-4 mr-1" /> Speichern</Button>
      </DialogFooter>
    </>
  );
}

// ──────────────────────────────────────────────
// Sub-Tab: Kurse verwalten
// ──────────────────────────────────────────────
function CoursesManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editCourse, setEditCourse] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    const [coursesRes, pathsRes] = await Promise.all([
      supabase.from('courses').select('*, modules(id, name, lessons(id))').order('sort_order'),
      supabase.from('learning_paths').select('id, name').order('sort_order'),
    ]);
    setCourses(coursesRes.data || []);
    setPaths(pathsRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const saveCourse = async (form: any) => {
    const payload: any = {
      name: form.name,
      description: form.description,
      learning_path_id: form.learning_path_id || null,
      path_level: form.path_level || 'starter',
      price_tier: form.price_tier || 'freebie',
      price_cents: parseInt(form.price_cents) || 0,
      published: form.published,
      sort_order: parseInt(form.sort_order) || 0,
      includes_done_for_you: form.includes_done_for_you,
    };
    if (form.id) {
      const { error } = await supabase.from('courses').update(payload).eq('id', form.id);
      if (error) { toast({ variant: 'destructive', title: 'Fehler', description: error.message }); return; }
    } else {
      const { error } = await supabase.from('courses').insert(payload);
      if (error) { toast({ variant: 'destructive', title: 'Fehler', description: error.message }); return; }
    }
    toast({ title: form.id ? 'Kurs aktualisiert' : 'Kurs erstellt' });
    setDialogOpen(false);
    setEditCourse(null);
    fetchData();
  };

  const togglePublished = async (id: string, published: boolean) => {
    await supabase.from('courses').update({ published: !published, published_at: !published ? new Date().toISOString() : null }).eq('id', id);
    toast({ title: !published ? 'Kurs veröffentlicht' : 'Kurs als Entwurf gesetzt' });
    fetchData();
  };

  const deleteCourse = async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) { toast({ variant: 'destructive', title: 'Fehler', description: error.message }); return; }
    toast({ title: 'Kurs gelöscht' });
    fetchData();
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Kurse ({courses.length})</h3>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditCourse(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Neuer Kurs</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <CourseForm initial={editCourse} paths={paths} onSave={saveCourse} onCancel={() => { setDialogOpen(false); setEditCourse(null); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kurs</TableHead>
                <TableHead>Pfad</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="hidden md:table-cell">Module / Lektionen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map(course => {
                const totalModules = (course.modules || []).length;
                const totalLessons = (course.modules || []).reduce((s: number, m: any) => s + (m.lessons || []).length, 0);
                const pathName = paths.find((p: any) => p.id === course.learning_path_id)?.name;
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <p className="font-medium">{course.name}</p>
                      {course.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{course.description}</p>}
                    </TableCell>
                    <TableCell><span className="text-sm">{pathName || '–'}</span></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{course.path_level}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{totalModules} / {totalLessons}</TableCell>
                    <TableCell>
                      <Badge variant={course.published ? 'default' : 'secondary'}>
                        {course.published ? 'Live' : 'Entwurf'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublished(course.id, course.published)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditCourse(course); setDialogOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCourse(course.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {courses.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Keine Kurse vorhanden</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseForm({ initial, paths, onSave, onCancel }: { initial?: any; paths: any[]; onSave: (f: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id || '',
    name: initial?.name || '',
    description: initial?.description || '',
    learning_path_id: initial?.learning_path_id || '',
    path_level: initial?.path_level || 'starter',
    price_tier: initial?.price_tier || 'freebie',
    price_cents: initial?.price_cents?.toString() || '0',
    published: initial?.published || false,
    sort_order: initial?.sort_order?.toString() || '0',
    includes_done_for_you: initial?.includes_done_for_you || false,
  });
  return (
    <>
      <DialogHeader><DialogTitle>{form.id ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle></DialogHeader>
      <div className="space-y-3 py-2">
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div><Label>Beschreibung</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Lernpfad</Label>
            <Select value={form.learning_path_id || 'none'} onValueChange={v => setForm(p => ({ ...p, learning_path_id: v === 'none' ? '' : v }))}>
              <SelectTrigger><SelectValue placeholder="Kein Pfad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Pfad</SelectItem>
                {paths.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Level</Label>
            <Select value={form.path_level} onValueChange={v => setForm(p => ({ ...p, path_level: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="fortgeschritten">Fortgeschritten</SelectItem>
                <SelectItem value="experte">Experte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>Preisstufe</Label>
            <Select value={form.price_tier} onValueChange={v => setForm(p => ({ ...p, price_tier: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="freebie">Freebie</SelectItem>
                <SelectItem value="low_budget">Starter</SelectItem>
                <SelectItem value="mid_range">Professional</SelectItem>
                <SelectItem value="high_class">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Preis (Cent)</Label><Input type="number" value={form.price_cents} onChange={e => setForm(p => ({ ...p, price_cents: e.target.value }))} /></div>
          <div><Label>Reihenfolge</Label><Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} /></div>
        </div>
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <Switch checked={form.published} onCheckedChange={v => setForm(p => ({ ...p, published: v }))} />
            <Label>Veröffentlicht</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.includes_done_for_you} onCheckedChange={v => setForm(p => ({ ...p, includes_done_for_you: v }))} />
            <Label>Done-for-You</Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name}><Save className="h-4 w-4 mr-1" /> Speichern</Button>
      </DialogFooter>
    </>
  );
}

// ──────────────────────────────────────────────
// Sub-Tab: Module & Lektionen
// ──────────────────────────────────────────────
function ModulesLessonsManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModule, setEditModule] = useState<any | null>(null);
  const [editLesson, setEditLesson] = useState<any | null>(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string>('');
  const { toast } = useToast();

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('id, name').order('sort_order');
    setCourses(data || []);
    setIsLoading(false);
  };

  const fetchModules = async (courseId: string) => {
    if (!courseId) { setModules([]); return; }
    const { data } = await supabase
      .from('modules')
      .select('*, lessons(*)')
      .eq('course_id', courseId)
      .order('sort_order');
    setModules((data || []).map((m: any) => ({
      ...m,
      lessons: (m.lessons || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    })));
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchModules(selectedCourse); }, [selectedCourse]);

  const saveModule = async (form: any) => {
    const payload = { name: form.name, description: form.description, course_id: selectedCourse, sort_order: parseInt(form.sort_order) || 0 };
    if (form.id) {
      await supabase.from('modules').update(payload).eq('id', form.id);
    } else {
      await supabase.from('modules').insert(payload);
    }
    toast({ title: form.id ? 'Modul aktualisiert' : 'Modul erstellt' });
    setModuleDialogOpen(false);
    setEditModule(null);
    fetchModules(selectedCourse);
  };

  const deleteModule = async (id: string) => {
    await supabase.from('modules').delete().eq('id', id);
    toast({ title: 'Modul gelöscht' });
    fetchModules(selectedCourse);
  };

  const saveLesson = async (form: any) => {
    const payload = {
      name: form.name, description: form.description, module_id: form.module_id,
      lesson_type: form.lesson_type, content_ref: form.content_ref,
      duration_seconds: parseInt(form.duration_seconds) || null,
      sort_order: parseInt(form.sort_order) || 0,
    };
    if (form.id) {
      await supabase.from('lessons').update(payload).eq('id', form.id);
    } else {
      await supabase.from('lessons').insert(payload);
    }
    toast({ title: form.id ? 'Lektion aktualisiert' : 'Lektion erstellt' });
    setLessonDialogOpen(false);
    setEditLesson(null);
    fetchModules(selectedCourse);
  };

  const deleteLesson = async (id: string) => {
    await supabase.from('lessons').delete().eq('id', id);
    toast({ title: 'Lektion gelöscht' });
    fetchModules(selectedCourse);
  };

  const lessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-3.5 w-3.5 text-blue-500" />;
      case 'task': return <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />;
      case 'worksheet': return <FileText className="h-3.5 w-3.5 text-amber-500" />;
      case 'quiz': return <HelpCircle className="h-3.5 w-3.5 text-purple-500" />;
      default: return <FileText className="h-3.5 w-3.5" />;
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label className="whitespace-nowrap">Kurs wählen:</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[300px]"><SelectValue placeholder="Kurs auswählen..." /></SelectTrigger>
          <SelectContent>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Module ({modules.length})</h3>
            <Dialog open={moduleDialogOpen} onOpenChange={(o) => { setModuleDialogOpen(o); if (!o) setEditModule(null); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Neues Modul</Button>
              </DialogTrigger>
              <DialogContent>
                <ModuleForm initial={editModule} onSave={saveModule} onCancel={() => { setModuleDialogOpen(false); setEditModule(null); }} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {modules.map(mod => (
              <Card key={mod.id}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">{mod.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">{(mod.lessons || []).length} Lektionen</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setLessonModuleId(mod.id); setEditLesson(null); setLessonDialogOpen(true); }}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditModule(mod); setModuleDialogOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteModule(mod.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {(mod.lessons || []).length > 0 && (
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="space-y-1">
                      {mod.lessons.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 group">
                          <div className="flex items-center gap-2 min-w-0">
                            {lessonIcon(lesson.lesson_type)}
                            <span className="text-sm truncate">{lesson.name}</span>
                            <Badge variant="secondary" className="text-[10px] h-4">{LESSON_TYPE_LABELS[lesson.lesson_type as keyof typeof LESSON_TYPE_LABELS]}</Badge>
                            {lesson.duration_seconds && (
                              <span className="text-[10px] text-muted-foreground">{Math.round(lesson.duration_seconds / 60)} Min</span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6"
                              onClick={() => { setLessonModuleId(mod.id); setEditLesson(lesson); setLessonDialogOpen(true); }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteLesson(lesson.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
            {modules.length === 0 && <p className="text-center text-muted-foreground py-8">Keine Module. Erstelle das erste Modul.</p>}
          </div>

          <Dialog open={lessonDialogOpen} onOpenChange={(o) => { setLessonDialogOpen(o); if (!o) setEditLesson(null); }}>
            <DialogContent>
              <LessonForm initial={editLesson} moduleId={lessonModuleId} onSave={saveLesson} onCancel={() => { setLessonDialogOpen(false); setEditLesson(null); }} />
            </DialogContent>
          </Dialog>
        </>
      )}

      {!selectedCourse && <p className="text-center text-muted-foreground py-12">Wähle einen Kurs aus um Module und Lektionen zu verwalten.</p>}
    </div>
  );
}

function ModuleForm({ initial, onSave, onCancel }: { initial?: any; onSave: (f: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id || '', name: initial?.name || '',
    description: initial?.description || '', sort_order: initial?.sort_order?.toString() || '0',
  });
  return (
    <>
      <DialogHeader><DialogTitle>{form.id ? 'Modul bearbeiten' : 'Neues Modul'}</DialogTitle></DialogHeader>
      <div className="space-y-3 py-2">
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div><Label>Beschreibung</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
        <div><Label>Reihenfolge</Label><Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name}><Save className="h-4 w-4 mr-1" /> Speichern</Button>
      </DialogFooter>
    </>
  );
}

function LessonForm({ initial, moduleId, onSave, onCancel }: { initial?: any; moduleId: string; onSave: (f: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    id: initial?.id || '', name: initial?.name || '', description: initial?.description || '',
    module_id: initial?.module_id || moduleId,
    lesson_type: initial?.lesson_type || 'video', content_ref: initial?.content_ref || '',
    duration_seconds: initial?.duration_seconds?.toString() || '',
    sort_order: initial?.sort_order?.toString() || '0',
  });
  return (
    <>
      <DialogHeader><DialogTitle>{form.id ? 'Lektion bearbeiten' : 'Neue Lektion'}</DialogTitle></DialogHeader>
      <div className="space-y-3 py-2">
        <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div><Label>Beschreibung</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Typ</Label>
            <Select value={form.lesson_type} onValueChange={v => setForm(p => ({ ...p, lesson_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="task">Aufgabe</SelectItem>
                <SelectItem value="worksheet">Arbeitsblatt</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Dauer (Sekunden)</Label><Input type="number" value={form.duration_seconds} onChange={e => setForm(p => ({ ...p, duration_seconds: e.target.value }))} /></div>
        </div>
        <div><Label>Content-Referenz (URL/Key)</Label><Input value={form.content_ref} onChange={e => setForm(p => ({ ...p, content_ref: e.target.value }))} placeholder="z.B. https://vimeo.com/..." /></div>
        <div><Label>Reihenfolge</Label><Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))} /></div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
        <Button onClick={() => onSave(form)} disabled={!form.name}><Save className="h-4 w-4 mr-1" /> Speichern</Button>
      </DialogFooter>
    </>
  );
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export default function AdminMembersOverview() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="members">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="members" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Mitglieder</TabsTrigger>
          <TabsTrigger value="paths" className="gap-1.5"><FolderOpen className="h-3.5 w-3.5" /> Lernpfade</TabsTrigger>
          <TabsTrigger value="courses" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Kurse</TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Module & Lektionen</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <MembersListSection />
        </TabsContent>
        <TabsContent value="paths" className="mt-4">
          <LearningPathsManagement />
        </TabsContent>
        <TabsContent value="courses" className="mt-4">
          <CoursesManagement />
        </TabsContent>
        <TabsContent value="content" className="mt-4">
          <ModulesLessonsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
