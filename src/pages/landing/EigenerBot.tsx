import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { AUTOMATIONS } from '@/data/automations';
import { SEOHead } from '@/components/landing/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Bot, Sparkles, ArrowRight, ArrowLeft, Check, Loader2, Plus,
  Calendar, Phone, Wrench, Rocket, Repeat, ShieldCheck, Clock,
} from 'lucide-react';
import { getStoredRefCode } from '@/components/affiliate/ReferralTracker';

// ============================================================
// Datenmodell für die 3 Wizard-Schritte
// ============================================================

interface BotChoice {
  type: 'catalog' | 'custom';
  code?: string;            // bei Katalog
  name: string;
  customDescription?: string; // bei Custom
}

interface BotOrderState {
  bot: BotChoice | null;
  systems: string[];        // ausgewählte Chips
  customSystems: string;    // Freitext zusätzliche Systeme
  description: string;      // was soll der Bot konkret tun
  goals: string;            // gewünschtes Ergebnis
  contact: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  callPreference: string;   // Wunsch-Zeitfenster Call 1
  privacyAccepted: boolean;
}

const SYSTEM_OPTIONS = [
  // CRM
  { id: 'hubspot', label: 'HubSpot', group: 'CRM' },
  { id: 'pipedrive', label: 'Pipedrive', group: 'CRM' },
  { id: 'salesforce', label: 'Salesforce', group: 'CRM' },
  { id: 'monday', label: 'monday.com', group: 'CRM' },
  // Automation
  { id: 'n8n', label: 'n8n', group: 'Automation' },
  { id: 'make', label: 'Make.com', group: 'Automation' },
  { id: 'zapier', label: 'Zapier', group: 'Automation' },
  // Kommunikation
  { id: 'slack', label: 'Slack', group: 'Kommunikation' },
  { id: 'teams', label: 'MS Teams', group: 'Kommunikation' },
  { id: 'whatsapp', label: 'WhatsApp Business', group: 'Kommunikation' },
  { id: 'sipgate', label: 'Sipgate', group: 'Kommunikation' },
  // Mail & Kalender
  { id: 'gmail', label: 'Gmail', group: 'Mail & Kalender' },
  { id: 'outlook', label: 'Outlook 365', group: 'Mail & Kalender' },
  { id: 'gcal', label: 'Google Kalender', group: 'Mail & Kalender' },
  { id: 'calcom', label: 'Cal.com', group: 'Mail & Kalender' },
  { id: 'calendly', label: 'Calendly', group: 'Mail & Kalender' },
  // Daten
  { id: 'notion', label: 'Notion', group: 'Daten' },
  { id: 'airtable', label: 'Airtable', group: 'Daten' },
  { id: 'sheets', label: 'Google Sheets', group: 'Daten' },
  // E-Commerce / Sonstiges
  { id: 'stripe', label: 'Stripe', group: 'Zahlung' },
  { id: 'shopify', label: 'Shopify', group: 'E-Commerce' },
  { id: 'wordpress', label: 'WordPress', group: 'Web' },
];

const CALL_PREFERENCES = [
  'Diese Woche, vormittags',
  'Diese Woche, nachmittags',
  'Nächste Woche, vormittags',
  'Nächste Woche, nachmittags',
  'So schnell wie möglich',
  'Termin per Mail abstimmen',
];

const ROADMAP = [
  { day: 0, icon: Rocket, title: 'Call 1 — Kickoff & Anbindung', desc: 'Wir legen Systeme, Zugänge und Use-Case fest. Bau startet sofort.' },
  { day: 7, icon: Phone, title: 'Call 2 — Delivery', desc: 'Bot ist live in deiner Umgebung. End-to-End getestet, einsatzbereit.' },
  { day: 10, icon: Repeat, title: 'Call 3 — Setup-Check', desc: 'Wir prüfen den Setup gemeinsam und passen Prompts, Regeln, Trigger an.' },
  { day: 20, icon: ShieldCheck, title: 'Call 4 — Optimierung', desc: 'Praxisdaten ausgewertet, finale Anpassungen, Dokumentation übergeben.' },
];

const STEPS = ['Bot wählen', 'Systeme & Aufgabe', 'Kontakt & Call'];

// ============================================================
// Validierung
// ============================================================
const finalSchema = z.object({
  name: z.string().trim().min(2, 'Bitte vollständigen Namen angeben').max(100),
  email: z.string().trim().email('Bitte gültige E-Mail').max(255),
  phone: z.string().trim().min(5, 'Bitte Telefonnummer').max(40),
  company: z.string().trim().max(150).optional(),
  description: z.string().trim().min(20, 'Bitte mindestens 20 Zeichen beschreiben').max(2000),
  goals: z.string().trim().max(1000).optional(),
  callPreference: z.string().min(3, 'Bitte Zeitfenster wählen'),
  systems: z.array(z.string()).min(1, 'Bitte mindestens 1 System wählen oder Freitext nutzen').optional(),
});

// ============================================================
// Page
// ============================================================
export default function EigenerBot() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<BotOrderState>({
    bot: null,
    systems: [],
    customSystems: '',
    description: '',
    goals: '',
    contact: { name: '', email: '', phone: '', company: '' },
    callPreference: '',
    privacyAccepted: false,
  });

  const automationBots = useMemo(
    () => AUTOMATIONS.filter(a => a.category === 'automation'),
    []
  );

  const update = <K extends keyof BotOrderState>(key: K, value: BotOrderState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const toggleSystem = (id: string) => {
    setState(prev => ({
      ...prev,
      systems: prev.systems.includes(id)
        ? prev.systems.filter(s => s !== id)
        : [...prev.systems, id],
    }));
  };

  const canAdvance = (): boolean => {
    if (step === 0) return state.bot !== null;
    if (step === 1) {
      const hasSystems = state.systems.length > 0 || state.customSystems.trim().length > 2;
      return hasSystems && state.description.trim().length >= 20;
    }
    return true;
  };

  const handleSubmit = async () => {
    const parsed = finalSchema.safeParse({
      name: state.contact.name,
      email: state.contact.email,
      phone: state.contact.phone,
      company: state.contact.company,
      description: state.description,
      goals: state.goals,
      callPreference: state.callPreference,
      systems: state.systems,
    });

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      toast.error(firstError || 'Bitte alle Pflichtfelder ausfüllen');
      return;
    }
    if (!state.privacyAccepted) {
      toast.error('Bitte Datenschutz akzeptieren');
      return;
    }
    if (!state.bot) {
      toast.error('Bot fehlt');
      return;
    }

    setSubmitting(true);
    try {
      const systemLabels = [
        ...state.systems.map(id => SYSTEM_OPTIONS.find(s => s.id === id)?.label).filter(Boolean),
        ...(state.customSystems.trim() ? [`Sonstige: ${state.customSystems.trim()}`] : []),
      ];

      // Strukturierte Bot-Bestellung als Markdown im message-Feld
      const message = [
        '🤖 EIGENER BOT — Bestellung',
        '',
        `**Bot:** ${state.bot.name}${state.bot.code ? ` (${state.bot.code})` : ''}`,
        state.bot.type === 'custom' && state.bot.customDescription
          ? `**Custom-Beschreibung:** ${state.bot.customDescription}`
          : '',
        '',
        `**Genutzte Systeme:** ${systemLabels.join(', ') || '—'}`,
        '',
        '**Was soll der Bot leisten:**',
        state.description,
        '',
        state.goals ? `**Ziel-Ergebnis:** ${state.goals}` : '',
        '',
        `**Wunsch-Zeitfenster Call 1:** ${state.callPreference}`,
        '',
        '— Roadmap (vom System auto-geplant): —',
        '• Call 1 (Tag 0): Kickoff & Anbindung',
        '• Call 2 (Tag 7): Delivery',
        '• Call 3 (Tag 10): Setup-Check',
        '• Call 4 (Tag 20): Optimierung',
        '• Bugfixes innerhalb der Termine inklusive',
        '',
        '<!-- BOT_ORDER_JSON',
        JSON.stringify({
          bot: state.bot,
          systems: state.systems,
          systemLabels,
          customSystems: state.customSystems,
          description: state.description,
          goals: state.goals,
          callPreference: state.callPreference,
          roadmap: ROADMAP.map(r => ({ day: r.day, title: r.title })),
        }),
        'BOT_ORDER_JSON -->',
      ].filter(Boolean).join('\n');

      const refCode = getStoredRefCode();

      const { error } = await supabase.from('leads').insert({
        name: state.contact.name,
        email: state.contact.email,
        phone: state.contact.phone || null,
        message,
        source: 'eigener-bot',
        ref_code: refCode,
      });

      if (error) throw error;

      // Fire-and-forget Notification
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      fetch(`${supabaseUrl}/functions/v1/notify-new-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.contact.name,
          email: state.contact.email,
          phone: state.contact.phone || null,
          message: `Eigener Bot: ${state.bot.name} — ${state.callPreference}`,
          source: 'eigener-bot',
        }),
      }).catch(err => console.error('Notify failed', err));

      toast.success('Bestellung gesendet — wir melden uns für Call 1.');
      navigate('/danke');
    } catch (err: any) {
      console.error('[EigenerBot]', err);
      toast.error(err?.message || 'Bestellung konnte nicht gesendet werden');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Eigenen Bot bestellen — KI Automationen"
        description="Wähle deinen KI-Bot, beschreibe deine Systeme und buche Call 1 zur Integration. 4-Call-Roadmap inklusive."
        canonical="/eigener-bot"
      />

      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight text-sm">KI-Automationen</Link>
          <Link to="/automatisierungen" className="text-xs text-muted-foreground hover:text-foreground">
            Alle Automationen
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <Badge variant="secondary" className="gap-1">
            <Bot className="h-3 w-3" /> Bot-Konfigurator
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Bestelle deinen eigenen KI-Bot
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            In 3 Schritten: Bot wählen, Systeme & Aufgabe beschreiben, ersten Integrations-Call buchen.
            Danach laufen 4 strukturierte Calls bis zur Abnahme.
          </p>
        </div>

        {/* Roadmap-Vorschau */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5 md:p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Deine 4-Call-Roadmap
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {ROADMAP.map((r, i) => (
                <div key={i} className="rounded-xl bg-card border border-border/60 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <r.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">Tag {r.day === 0 ? '0' : `+${r.day}`}</span>
                  </div>
                  <div className="text-sm font-semibold">{r.title.split('—')[1]?.trim()}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{r.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stepper */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Schritt {step + 1} von {STEPS.length}: {STEPS[step]}</span>
            <span>{Math.round(((step + 1) / STEPS.length) * 100)} %</span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
        </div>

        {/* STEP 0: Bot wählen */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Wähle einen Bot aus dem Katalog
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {automationBots.map(a => {
                  const selected = state.bot?.type === 'catalog' && state.bot?.code === a.code;
                  return (
                    <button
                      key={a.code}
                      type="button"
                      onClick={() =>
                        update('bot', { type: 'catalog', code: a.code, name: a.name })
                      }
                      className={cn(
                        'text-left rounded-xl border p-4 transition-all hover:border-primary/50 hover:shadow-sm',
                        selected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="text-[10px]">{a.code}</Badge>
                        {selected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="mt-2 font-semibold text-sm">{a.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.subtitle}</div>
                      <div className="flex items-center gap-1 mt-3 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> Lieferung ~{a.leadDays} Tage
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Bot */}
            <Card className={cn(
              'border-dashed',
              state.bot?.type === 'custom' && 'border-primary bg-primary/5'
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  Oder: eigenen Bot konfigurieren
                </CardTitle>
                <CardDescription className="text-xs">
                  Du brauchst etwas, das nicht im Katalog steht? Beschreibe in 1–2 Sätzen, was er können soll.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="z. B. WhatsApp-Reklamationsbot für E-Commerce"
                  value={state.bot?.type === 'custom' ? state.bot.name : ''}
                  onChange={e =>
                    update('bot', {
                      type: 'custom',
                      name: e.target.value,
                      customDescription: state.bot?.type === 'custom' ? state.bot.customDescription : '',
                    })
                  }
                  maxLength={150}
                />
                <Textarea
                  placeholder="Kurzbeschreibung: Was soll dieser Bot können? Welche Plattform?"
                  value={state.bot?.type === 'custom' ? state.bot.customDescription || '' : ''}
                  onChange={e =>
                    update('bot', {
                      type: 'custom',
                      name: state.bot?.type === 'custom' ? state.bot.name : e.target.value.slice(0, 50),
                      customDescription: e.target.value,
                    })
                  }
                  rows={2}
                  maxLength={500}
                  disabled={state.bot?.type !== 'custom' || !state.bot?.name}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 1: Systeme & Beschreibung */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Welche Systeme nutzt du aktuell?
                </CardTitle>
                <CardDescription className="text-xs">
                  Click auf alle, die wir anbinden sollen. Mehrfachauswahl möglich.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from(new Set(SYSTEM_OPTIONS.map(s => s.group))).map(group => (
                  <div key={group}>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {group}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SYSTEM_OPTIONS.filter(s => s.group === group).map(s => {
                        const active = state.systems.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSystem(s.id)}
                            className={cn(
                              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                              active
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:border-primary/40'
                            )}
                          >
                            {active && <Check className="inline h-3 w-3 mr-1" />}
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div>
                  <Label htmlFor="custom-systems" className="text-xs">Sonstige Systeme (Freitext)</Label>
                  <Input
                    id="custom-systems"
                    placeholder="z. B. SAP, DATEV, eigene API"
                    value={state.customSystems}
                    onChange={e => update('customSystems', e.target.value.slice(0, 300))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Was soll der Bot konkret leisten?</CardTitle>
                <CardDescription className="text-xs">
                  Je konkreter, desto besser können wir Call 1 vorbereiten.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-xs">
                    Aufgabe / Use-Case <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="z. B. Eingehende Anfragen aus Webformular qualifizieren, in HubSpot anlegen, hot-Leads sofort an Vertrieb in Slack pingen..."
                    value={state.description}
                    onChange={e => update('description', e.target.value.slice(0, 2000))}
                    rows={5}
                    className="mt-1"
                  />
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {state.description.length} / 2000 Zeichen — mind. 20
                  </div>
                </div>
                <div>
                  <Label htmlFor="goals" className="text-xs">
                    Gewünschtes messbares Ergebnis (optional)
                  </Label>
                  <Textarea
                    id="goals"
                    placeholder="z. B. Antwortzeit <5 Min, Conversion-Lift +20 %, 8h/Woche eingespart"
                    value={state.goals}
                    onChange={e => update('goals', e.target.value.slice(0, 1000))}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 2: Kontakt & Call */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kontaktdaten</CardTitle>
                <CardDescription className="text-xs">An diese Daten senden wir die Termin-Bestätigung.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-xs">Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      value={state.contact.name}
                      onChange={e => update('contact', { ...state.contact, name: e.target.value })}
                      maxLength={100}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-xs">Unternehmen</Label>
                    <Input
                      id="company"
                      value={state.contact.company}
                      onChange={e => update('contact', { ...state.contact, company: e.target.value })}
                      maxLength={150}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs">E-Mail <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={state.contact.email}
                      onChange={e => update('contact', { ...state.contact, email: e.target.value })}
                      maxLength={255}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs">Telefon <span className="text-destructive">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={state.contact.phone}
                      onChange={e => update('contact', { ...state.contact, phone: e.target.value })}
                      maxLength={40}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Wunsch-Zeitfenster für Call 1 (Integration)
                </CardTitle>
                <CardDescription className="text-xs">
                  Wir bestätigen einen konkreten Termin per E-Mail. Folgetermine (Call 2–4) planen wir am Ende von Call 1.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CALL_PREFERENCES.map(opt => {
                    const active = state.callPreference === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update('callPreference', opt)}
                        className={cn(
                          'rounded-lg border px-3 py-2.5 text-sm text-left transition-colors flex items-center gap-2',
                          active
                            ? 'bg-primary/10 border-primary text-foreground'
                            : 'bg-background border-border hover:border-primary/40'
                        )}
                      >
                        {active ? (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Zusammenfassung */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-sm">Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1.5">
                <div><span className="text-muted-foreground">Bot:</span> <span className="font-medium">{state.bot?.name}</span></div>
                <div>
                  <span className="text-muted-foreground">Systeme:</span>{' '}
                  <span className="font-medium">
                    {state.systems.map(id => SYSTEM_OPTIONS.find(s => s.id === id)?.label).filter(Boolean).join(', ')}
                    {state.customSystems && ` + ${state.customSystems}`}
                  </span>
                </div>
                <div className="line-clamp-2">
                  <span className="text-muted-foreground">Aufgabe:</span>{' '}
                  <span className="font-medium">{state.description}</span>
                </div>
              </CardContent>
            </Card>

            {/* DSGVO */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="privacy"
                checked={state.privacyAccepted}
                onCheckedChange={v => update('privacyAccepted', v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="privacy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Ich akzeptiere die <Link to="/agb" className="underline">AGB</Link> und die{' '}
                <a href="https://krs-immobilien.de/datenschutz" target="_blank" rel="noopener" className="underline">
                  Datenschutzerklärung
                </a>
                . Mit dem Absenden willige ich ein, dass mich KI-Automationen zur Bot-Bestellung kontaktiert.
              </Label>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Zurück
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
            >
              Weiter <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !state.privacyAccepted}
              size="lg"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Bestellung absenden & Call 1 anfragen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
