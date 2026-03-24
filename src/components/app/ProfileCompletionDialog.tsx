import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, Building2, Target, User } from 'lucide-react';

const SESSION_KEY = 'profile_completion_dismissed';

const INDUSTRIES = [
  { value: 'handwerk', label: 'Handwerk' },
  { value: 'dienstleistung', label: 'Dienstleistung' },
  { value: 'praxis', label: 'Praxis / Gesundheit' },
  { value: 'immobilien', label: 'Immobilien' },
  { value: 'gastronomie', label: 'Gastronomie / Hotellerie' },
  { value: 'handel', label: 'Handel' },
  { value: 'agentur', label: 'Agentur / Beratung' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

const GOALS = [
  { value: 'weniger_chaos', label: 'Weniger operatives Chaos' },
  { value: 'mehr_zeit', label: 'Mehr Zeit fürs Kerngeschäft' },
  { value: 'bessere_prozesse', label: 'Bessere Prozesse und Übergaben' },
  { value: 'wachstum', label: 'Wachstum ohne mehr Arbeit' },
];

export function ProfileCompletionDialog() {
  const { profile, refreshProfile, isLoading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [industry, setIndustry] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [company, setCompany] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !profile) return;
    const isIncomplete = !profile.company || !profile.industry || !profile.primary_goal;
    const wasDismissed = sessionStorage.getItem(SESSION_KEY) === 'true';
    if (isIncomplete && !wasDismissed) {
      setOpen(true);
      // Start at the first missing step
      if (!profile.industry) setStep(1);
      else if (!profile.primary_goal) setStep(2);
      else setStep(3);
    }
  }, [profile, authLoading]);

  const handleNext = () => setStep((s) => s + 1);

  const handleSubmit = async () => {
    if (!profile) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        industry: industry || profile.industry || null,
        primary_goal: primaryGoal || profile.primary_goal || null,
        company: company || profile.company || null,
      })
      .eq('id', profile.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Fehler beim Speichern', description: error.message });
    } else {
      toast({ title: 'Willkommen!', description: 'Starte jetzt mit deinem ersten Kurs.' });
      await refreshProfile();
      setOpen(false);
      navigate('/app/academy');
    }
    setIsLoading(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setOpen(false);
  };

  const stepIcons = [Building2, Target, User];
  const StepIcon = stepIcons[step - 1];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
          <DialogTitle>
            {step === 1 && 'In welcher Branche bist du tätig?'}
            {step === 2 && 'Was ist dein größtes Ziel?'}
            {step === 3 && 'Fast geschafft – wie heißt dein Unternehmen?'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Damit wir dir die passenden Automatisierungen zeigen können.'}
            {step === 2 && 'So priorisieren wir die richtigen Inhalte für dich.'}
            {step === 3 && 'Dann starten wir direkt mit deinem ersten Kurs.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Branche auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleDismiss}>Später</Button>
              <Button className="flex-1" onClick={handleNext} disabled={!industry}>Weiter</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Ziel auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Zurück</Button>
              <Button className="flex-1" onClick={handleNext} disabled={!primaryGoal}>Weiter</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Firma / Unternehmen</Label>
              <Input
                id="company"
                placeholder="Muster GmbH"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)} disabled={isLoading}>Zurück</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isLoading || !company}>
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Speichern...</>
                ) : (
                  'Loslegen →'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
