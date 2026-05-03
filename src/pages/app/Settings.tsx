import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings as SettingsIcon, User, Loader2, Lock, Bell, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import GoogleCalendarStatusCard from '@/components/settings/GoogleCalendarStatusCard';
import PushNotificationsCard from '@/components/settings/PushNotificationsCard';
import CrmDialogPrefsCard from '@/components/settings/CrmDialogPrefsCard';

export default function Settings() {
  const { profile, user, refreshProfile } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [company, setCompany] = useState(profile?.company || '');

  // Password state
  const [pwLoading, setPwLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Notification prefs (local state — persisted to profile meta)
  const meta = (profile as any)?.meta || {};
  const [notifChannel, setNotifChannel] = useState<'in_app' | 'email' | 'both'>(
    (meta.notif_channel as 'in_app' | 'email' | 'both') ?? 'both'
  );
  const [notifEmail, setNotifEmail] = useState<boolean>(meta.notif_email ?? true);
  const [notifTasks, setNotifTasks] = useState<boolean>(meta.notif_tasks ?? true);
  const [notifLeads, setNotifLeads] = useState<boolean>(meta.notif_leads ?? true);
  const [notifReports, setNotifReports] = useState<boolean>(meta.notif_reports ?? false);
  const [notifLoading, setNotifLoading] = useState(false);

  // Privacy
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [showActivity, setShowActivity] = useState<boolean>(meta.show_activity ?? true);
  const [showPhone, setShowPhone] = useState<boolean>(meta.show_phone ?? true);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone,
        company,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Fehler beim Speichern', description: error.message });
    } else {
      await refreshProfile();
      toast({ title: 'Profil aktualisiert', description: 'Deine Änderungen wurden gespeichert.' });
    }
    setIsLoading(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Passwort zu kurz', description: 'Mindestens 8 Zeichen erforderlich.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwörter stimmen nicht überein' });
      return;
    }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    } else {
      toast({ title: 'Passwort geändert', description: 'Dein neues Passwort ist aktiv.' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setPwLoading(false);
  };

  const saveNotifPrefs = async () => {
    if (!user) return;
    setNotifLoading(true);
    const currentMeta = (profile as any)?.meta || {};
    const { error } = await supabase
      .from('profiles')
      .update({
        meta: { ...currentMeta, notif_channel: notifChannel, notif_email: notifEmail, notif_tasks: notifTasks, notif_leads: notifLeads, notif_reports: notifReports },
      } as any)
      .eq('user_id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    } else {
      await refreshProfile();
      toast({ title: 'Benachrichtigungen aktualisiert' });
    }
    setNotifLoading(false);
  };

  const savePrivacy = async () => {
    if (!user) return;
    setPrivacyLoading(true);
    const currentMeta = (profile as any)?.meta || {};
    const { error } = await supabase
      .from('profiles')
      .update({
        meta: { ...currentMeta, show_activity: showActivity, show_phone: showPhone },
      } as any)
      .eq('user_id', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    } else {
      await refreshProfile();
      toast({ title: 'Datenschutz aktualisiert' });
    }
    setPrivacyLoading(false);
  };

  const getInitials = () => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (profile?.full_name) {
      const parts = profile.full_name.split(' ');
      return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalte dein Profil und Kontoeinstellungen</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profil</CardTitle>
            <CardDescription>Deine persönlichen Informationen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-muted-foreground">
                  Mitglied seit {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('de-DE') : '-'}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Max" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mustermann" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+49 123 456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Unternehmen</Label>
                <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Firma GmbH" />
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</> : 'Änderungen speichern'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Passwort ändern</CardTitle>
            <CardDescription>Aktualisiere dein Passwort (min. 8 Zeichen)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPw">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="newPw"
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPw">Passwort bestätigen</Label>
              <Input
                id="confirmPw"
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwörter stimmen nicht überein</p>
            )}
            <Button onClick={handlePasswordChange} disabled={pwLoading || !newPassword || !confirmPassword}>
              {pwLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird geändert...</> : 'Passwort ändern'}
            </Button>

            <Separator className="my-4" />

            <div>
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4" /> Zwei-Faktor-Authentifizierung
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                2FA erhöht die Sicherheit deines Kontos erheblich. Aktiviere es über deine Authenticator-App.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({ title: '2FA', description: 'Zwei-Faktor-Authentifizierung wird über das Supabase Dashboard konfiguriert. Kontaktiere den Admin.' })}
              >
                2FA konfigurieren
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Benachrichtigungen</CardTitle>
            <CardDescription>Wähle, worüber du informiert werden möchtest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
              <p className="text-sm font-medium">Benachrichtigungs-Kanal</p>
              <p className="text-xs text-muted-foreground">
                Wo möchtest du Warnungen und Updates erhalten?
              </p>
              <RadioGroup
                value={notifChannel}
                onValueChange={(v) => setNotifChannel(v as 'in_app' | 'email' | 'both')}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2"
              >
                <Label
                  htmlFor="ch-in-app"
                  className="flex items-center gap-2 rounded-md border p-2.5 cursor-pointer hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem value="in_app" id="ch-in-app" />
                  <span className="text-sm">Nur in-App</span>
                </Label>
                <Label
                  htmlFor="ch-email"
                  className="flex items-center gap-2 rounded-md border p-2.5 cursor-pointer hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem value="email" id="ch-email" />
                  <span className="text-sm">Nur E-Mail</span>
                </Label>
                <Label
                  htmlFor="ch-both"
                  className="flex items-center gap-2 rounded-md border p-2.5 cursor-pointer hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem value="both" id="ch-both" />
                  <span className="text-sm">Beides</span>
                </Label>
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">E-Mail-Benachrichtigungen</p>
                <p className="text-xs text-muted-foreground">Allgemeine System-E-Mails (zusätzlich zum Kanal)</p>
              </div>
              <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Aufgaben-Erinnerungen</p>
                <p className="text-xs text-muted-foreground">Benachrichtigung bei fälligen Aufgaben</p>
              </div>
              <Switch checked={notifTasks} onCheckedChange={setNotifTasks} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Neue Leads</p>
                <p className="text-xs text-muted-foreground">Info bei neuen Lead-Zuweisungen</p>
              </div>
              <Switch checked={notifLeads} onCheckedChange={setNotifLeads} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Wöchentliche Reports</p>
                <p className="text-xs text-muted-foreground">Zusammenfassung per E-Mail</p>
              </div>
              <Switch checked={notifReports} onCheckedChange={setNotifReports} />
            </div>
            <Button onClick={saveNotifPrefs} disabled={notifLoading} className="w-full">
              {notifLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</> : 'Benachrichtigungen speichern'}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" /> Datenschutz</CardTitle>
            <CardDescription>Kontrolliere die Sichtbarkeit deiner Daten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Aktivitäts-Status anzeigen</p>
                <p className="text-xs text-muted-foreground">Andere sehen, wann du zuletzt aktiv warst</p>
              </div>
              <Switch checked={showActivity} onCheckedChange={setShowActivity} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Telefonnummer sichtbar</p>
                <p className="text-xs text-muted-foreground">Team-Mitglieder können deine Nummer sehen</p>
              </div>
              <Switch checked={showPhone} onCheckedChange={setShowPhone} />
            </div>
            <Button onClick={savePrivacy} disabled={privacyLoading} className="w-full">
              {privacyLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichern...</> : 'Datenschutz speichern'}
            </Button>
          </CardContent>
        </Card>

        {/* CRM Dialog Preferences */}
        <CrmDialogPrefsCard />

        {/* Push Notifications */}
        <PushNotificationsCard />

        {/* Google Calendar Status */}
        <GoogleCalendarStatusCard />
      </div>
    </div>
  );
}
