import type { SprintDay, MarketingChannel, ContentDay, FunnelStage, ScalingMonth, ProductTier } from './types';

export const PRODUCT_TIERS: ProductTier[] = [
  { name: 'Done-with-you System', priceBrutto: 9990, monthlyTarget: 4 },
  { name: 'Coaching-Retainer', priceBrutto: 1990, monthlyTarget: 10 },
  { name: 'Website-Pakete', priceBrutto: 999, monthlyTarget: 5 },
];

export const FUNNEL_STAGES: FunnelStage[] = [
  { stage: 'Leads (Kontakte)', targetCount: 500, conversionRate: 100 },
  { stage: 'Triage-Calls', targetCount: 250, conversionRate: 50 },
  { stage: 'Strategy Sessions', targetCount: 150, conversionRate: 60 },
  { stage: 'Angebote', targetCount: 100, conversionRate: 67 },
  { stage: 'Abschlüsse', targetCount: 40, conversionRate: 40 },
];

export const DAILY_ACTIVITIES = [
  { label: 'Outreach (DMs/E-Mails)', target: 30, icon: 'MessageSquare' },
  { label: 'Kaltanrufe', target: 30, icon: 'PhoneOutgoing' },
  { label: 'Triage-Calls', target: 10, icon: 'Phone' },
  { label: 'Strategy Sessions', target: 5, icon: 'Video' },
  { label: 'Follow-ups', target: 10, icon: 'MailCheck' },
  { label: 'Posts / Content', target: 1, icon: 'FileText' },
  { label: 'Stories / Reels', target: 3, icon: 'Film' },
];

export const SPRINT_PLAN: SprintDay[] = [
  {
    day: 'Montag',
    slots: [
      { time: '08:00–09:00', task: 'Content erstellen', details: '1 LinkedIn Post + 3 Stories', channel: 'LinkedIn/Instagram' },
      { time: '09:00–11:00', task: 'Kaltakquise', details: '30 Anrufe aus Liste', channel: 'Telefon' },
      { time: '11:00–12:00', task: 'Outreach DMs', details: '30 personalisierte Nachrichten', channel: 'LinkedIn/WhatsApp' },
      { time: '13:00–15:00', task: 'Triage-Calls', details: 'Qualifizierungsgespräche', channel: 'Zoom/Telefon' },
      { time: '15:00–17:00', task: 'Strategy Sessions', details: 'Beratungsgespräche', channel: 'Zoom' },
      { time: '17:00–18:00', task: 'Follow-ups', details: 'E-Mails + DMs nachfassen', channel: 'E-Mail/DM' },
    ],
  },
  {
    day: 'Dienstag',
    slots: [
      { time: '08:00–09:00', task: 'Content erstellen', details: '1 Reel + Carousel', channel: 'Instagram' },
      { time: '09:00–11:00', task: 'Kaltakquise', details: '30 Anrufe aus Liste', channel: 'Telefon' },
      { time: '11:00–12:00', task: 'Outreach DMs', details: '30 personalisierte Nachrichten', channel: 'LinkedIn/WhatsApp' },
      { time: '13:00–15:00', task: 'Triage-Calls', details: 'Qualifizierungsgespräche', channel: 'Zoom/Telefon' },
      { time: '15:00–17:00', task: 'Strategy Sessions', details: 'Beratungsgespräche', channel: 'Zoom' },
      { time: '17:00–18:00', task: 'Follow-ups', details: 'Angebote nachfassen', channel: 'E-Mail/DM' },
    ],
  },
  {
    day: 'Mittwoch',
    slots: [
      { time: '08:00–09:00', task: 'Content erstellen', details: '1 LinkedIn Post + Case Study', channel: 'LinkedIn' },
      { time: '09:00–11:00', task: 'Kaltakquise', details: '30 Anrufe aus Liste', channel: 'Telefon' },
      { time: '11:00–12:00', task: 'Outreach DMs', details: '30 personalisierte Nachrichten', channel: 'LinkedIn/WhatsApp' },
      { time: '13:00–15:00', task: 'Triage-Calls', details: 'Qualifizierungsgespräche', channel: 'Zoom/Telefon' },
      { time: '15:00–17:00', task: 'Strategy Sessions', details: 'Beratungsgespräche', channel: 'Zoom' },
      { time: '17:00–18:00', task: 'Follow-ups', details: 'Pipeline-Pflege', channel: 'CRM' },
    ],
  },
  {
    day: 'Donnerstag',
    slots: [
      { time: '08:00–09:00', task: 'Content erstellen', details: '1 Reel + Stories', channel: 'Instagram' },
      { time: '09:00–11:00', task: 'Kaltakquise', details: '30 Anrufe aus Liste', channel: 'Telefon' },
      { time: '11:00–12:00', task: 'Outreach DMs', details: '30 personalisierte Nachrichten', channel: 'LinkedIn/WhatsApp' },
      { time: '13:00–15:00', task: 'Triage-Calls', details: 'Qualifizierungsgespräche', channel: 'Zoom/Telefon' },
      { time: '15:00–17:00', task: 'Strategy Sessions', details: 'Beratungsgespräche', channel: 'Zoom' },
      { time: '17:00–18:00', task: 'Follow-ups', details: 'Abschlüsse nachfassen', channel: 'E-Mail/Telefon' },
    ],
  },
  {
    day: 'Freitag',
    slots: [
      { time: '08:00–09:00', task: 'Content erstellen', details: '1 LinkedIn Post + Wochenrückblick', channel: 'LinkedIn' },
      { time: '09:00–11:00', task: 'Kaltakquise', details: '20 Anrufe (kürzer)', channel: 'Telefon' },
      { time: '11:00–12:00', task: 'Wochenauswertung', details: 'KPIs prüfen, Pipeline-Review', channel: 'CRM' },
      { time: '13:00–15:00', task: 'Strategy Sessions', details: 'Letzte Sessions der Woche', channel: 'Zoom' },
      { time: '15:00–16:00', task: 'Content-Planung', details: 'Nächste Woche vorbereiten', channel: 'Intern' },
      { time: '16:00–17:00', task: 'Admin & Optimierung', details: 'Skripte anpassen, Learnings dokumentieren', channel: 'Intern' },
    ],
  },
];

export const MARKETING_CHANNELS: MarketingChannel[] = [
  { channel: 'LinkedIn', measure: 'Posts + DMs + Kommentare', frequency: '5x/Woche', targetLeads: 80 },
  { channel: 'Instagram', measure: 'Reels + Stories + DMs', frequency: 'Täglich', targetLeads: 50 },
  { channel: 'Kaltakquise', measure: 'Telefonanrufe', frequency: '30/Tag', targetLeads: 120 },
  { channel: 'E-Mail', measure: 'Sequenzen + Broadcasts', frequency: 'Wöchentlich', targetLeads: 60 },
  { channel: 'Lead-Magnet', measure: 'Prozess-Analyse Tool', frequency: 'Permanent', targetLeads: 100 },
  { channel: 'Empfehlungen', measure: 'Bestehende Kunden aktivieren', frequency: 'Monatlich', targetLeads: 30 },
  { channel: 'Events/Webinare', measure: 'Online-Workshops', frequency: '2x/Monat', targetLeads: 60 },
];

export const CONTENT_CALENDAR: ContentDay[] = [
  { day: 'Montag', platform: 'LinkedIn', type: 'Thought-Leadership Post', hook: 'Kontroverser Standpunkt / Mythos brechen', cta: 'Kommentar-Frage' },
  { day: 'Dienstag', platform: 'Instagram', type: 'Reel + Carousel', hook: 'Quick-Tip / Vorher-Nachher', cta: 'DM "SYSTEM"' },
  { day: 'Mittwoch', platform: 'LinkedIn', type: 'Case Study / Ergebnis', hook: 'Konkretes Kundenergebnis mit Zahlen', cta: 'Analyse-Link' },
  { day: 'Donnerstag', platform: 'Instagram', type: 'Reel + Stories', hook: 'Behind the Scenes / Prozess zeigen', cta: 'Story-Poll → DM' },
  { day: 'Freitag', platform: 'LinkedIn', type: 'Persönlicher Post', hook: 'Wochenrückblick / Learning / Founder-Story', cta: 'Vernetzung' },
];

export const MARKETING_KPIS = {
  postsPerMonth: 20,
  reelsPerMonth: 12,
  dmsPerMonth: 600,
  coldCallsPerMonth: 600,
  leadMagnetDownloads: 100,
  webinarsPerMonth: 2,
  referrals: 5,
};

export const SCALING_ROADMAP: ScalingMonth[] = [
  { month: 'Apr 2026', oneTime: 29970, recurring: 7960, total: 37930, milestone: 'System steht, erste Abschlüsse' },
  { month: 'Mai 2026', oneTime: 39960, recurring: 11940, total: 51900 },
  { month: 'Jun 2026', oneTime: 49950, recurring: 17910, total: 67860, milestone: 'Pipeline gefüllt' },
  { month: 'Jul 2026', oneTime: 49950, recurring: 23880, total: 73830 },
  { month: 'Aug 2026', oneTime: 49950, recurring: 29850, total: 79800, milestone: '80k-Marke' },
  { month: 'Sep 2026', oneTime: 59940, recurring: 33830, total: 93770, milestone: 'Nahe 100k' },
  { month: 'Okt 2026', oneTime: 59940, recurring: 39800, total: 99740, milestone: '100k erreicht' },
  { month: 'Nov 2026', oneTime: 59940, recurring: 43780, total: 103720 },
  { month: 'Dez 2026', oneTime: 69930, recurring: 47760, total: 117690 },
  { month: 'Jan 2027', oneTime: 69930, recurring: 51740, total: 121670 },
  { month: 'Feb 2027', oneTime: 79920, recurring: 55720, total: 135640 },
  { month: 'Mär 2027', oneTime: 79920, recurring: 59700, total: 139620, milestone: '140k/Monat = 1.2 Mio/Jahr' },
];

export const SALES_TARGETS = {
  monthly: {
    leads: 500,
    triageCalls: 250,
    strategySessions: 150,
    offers: 100,
    closes: 40,
    closeRate: 40,
    dailyOutreach: 30,
    dailyColdCalls: 30,
    dailyTriageCalls: 10,
    dailyStrategySessions: 5,
    dailyFollowups: 10,
  },
  mantra: 'Jeden Tag 30 Outreach. 30 Kaltanrufe. 10 Triage. 5 Strategy. 10 Follow-ups.',
};
