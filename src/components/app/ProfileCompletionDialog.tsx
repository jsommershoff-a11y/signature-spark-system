import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const SESSION_KEY = 'profile_completion_dismissed';

export function ProfileCompletionDialog() {
  const { profile, refreshProfile, isLoading: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading || !profile) return;

    // Check if profile is incomplete
    const isIncomplete = !profile.company;
    const wasDismissed = sessionStorage.getItem(SESSION_KEY) === 'true';

    if (isIncomplete && !wasDismissed) {
      setOpen(true);
    }
  }, [profile, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        company: company || null,
        // position and location stored in existing nullable columns if available
      })
      .eq('id', profile.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Speichern',
        description: error.message,
      });
    } else {
      toast({
        title: 'Profil aktualisiert',
        description: 'Deine Daten wurden erfolgreich gespeichert.',
      });
      await refreshProfile();
      setOpen(false);
    }

    setIsLoading(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profil vervollständigen</DialogTitle>
          <DialogDescription>
            Bitte ergänze deine Daten, damit wir dir den bestmöglichen Service bieten können.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="position">Position / Rolle</Label>
            <Input
              id="position"
              placeholder="Geschäftsführer"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Standort</Label>
            <Input
              id="location"
              placeholder="Berlin"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handleDismiss} disabled={isLoading}>
              Später
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
