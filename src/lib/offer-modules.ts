// Offer Modules, Templates & Pricing Configuration

import type { OfferMode, CompanyInfo } from '@/types/offers';

// =============================================
// PROGRAM PRICING
// =============================================

export const PROGRAM_MIN_PRICES: Record<OfferMode, number> = {
  performance: 300000,
  rocket_performance: 700000,
  variable: 0,
};

export const PROGRAM_LABELS: Record<OfferMode, string> = {
  performance: 'Performance',
  rocket_performance: 'Rocket Performance',
  variable: 'Variables Angebot',
};

export const PROGRAM_DESCRIPTIONS: Record<OfferMode, string> = {
  performance: 'Strukturierter Systemaufbau – wir bauen gemeinsam mit Ihnen.',
  rocket_performance: 'Premium-Betreuung – vollständiger Aufbau mit maximaler Unterstützung.',
  variable: 'Flexibles Kurzangebot für einzelne Aufgaben und Projekte.',
};

// =============================================
// MODULE DEFINITIONS
// =============================================

export interface ModuleDefinition {
  id: string;
  label: string;
  description: string;
  deliverables: {
    performance: string[];
    rocket_performance: string[];
  };
}

export const OFFER_MODULES: ModuleDefinition[] = [
  {
    id: 'diagnose',
    label: 'Diagnose & Strukturplan',
    description: 'Rolle, Engpass, Zielbild und Entscheidungslogik analysieren.',
    deliverables: {
      performance: ['Strukturplan-Dokument', 'Engpass-Analyse'],
      rocket_performance: ['Tiefenanalyse mit Handlungsempfehlung', 'Strukturplan inkl. Umsetzungsfahrplan'],
    },
  },
  {
    id: 'vertriebsstruktur',
    label: 'Vertriebsstruktur + Skripte',
    description: 'Lead → Gespräch → Entscheidung → Abschluss inkl. Gesprächsleitfäden.',
    deliverables: {
      performance: ['Vertriebsprozess-Blueprint', 'Gesprächsskripte'],
      rocket_performance: ['Fertige Vertriebsskripte', 'Follow-up-Sequenzen', 'Closing-Leitfäden'],
    },
  },
  {
    id: 'crm_setup',
    label: 'CRM Setup / Blueprint',
    description: 'Pipeline, Felder, Score, Automationen und Reporting.',
    deliverables: {
      performance: ['CRM-Blueprint (Felder, Pipeline)', 'Automations-Bauplan'],
      rocket_performance: ['Fertig konfiguriertes CRM', 'Pipeline + Automationen', 'Reporting-Dashboard'],
    },
  },
  {
    id: 'landingpage',
    label: 'Landingpage / Offer-Flow',
    description: 'Funnel-Logik und Copy-Framework für Ihre Angebotsseite.',
    deliverables: {
      performance: ['Funnel-Blueprint', 'Copy-Vorlagen'],
      rocket_performance: ['Fertige Landingpage', 'Offer-Flow mit Conversion-Optimierung'],
    },
  },
  {
    id: 'followup',
    label: 'Follow-up- & Prozesslogik',
    description: 'Nachfass-Vorlagen und Prozessautomatisierung.',
    deliverables: {
      performance: ['Follow-up-Vorlagen', 'Prozesslogik-Dokumentation'],
      rocket_performance: ['Automatisierte Follow-up-Sequenzen', 'Prozess-Implementierung im System'],
    },
  },
  {
    id: 'ki_automationen',
    label: 'KI-Automationen',
    description: 'Automationen für Effizienz, Analyse und Kontrolle.',
    deliverables: {
      performance: ['KI-Playbook (Prompts, Automationen)'],
      rocket_performance: ['Implementierte KI-Automationen', 'Analyse-Dashboards', 'Kontrollmechanismen'],
    },
  },
  {
    id: 'structogram',
    label: 'Structogram (ROT/GRÜN/BLAU)',
    description: 'Kommunikations- und Entscheidungsstruktur als Führungs- und Umsetzungshebel.',
    deliverables: {
      performance: ['Structogram-Analyse', 'Kommunikationsleitfaden'],
      rocket_performance: ['Individuelle Structogram-Auswertung', 'Teamführungs-Integration', 'Verkaufsoptimierung nach Typ'],
    },
  },
  {
    id: 'kpi_dashboard',
    label: 'KPI-Dashboard (Owner View)',
    description: 'Kennzahlen-Übersicht für die Geschäftsführung.',
    deliverables: {
      performance: ['KPI-Definition + Reporting-Rhythmus'],
      rocket_performance: ['Fertig konfiguriertes KPI-Dashboard', 'Automatische Reports'],
    },
  },
  {
    id: 'team_enablement',
    label: 'Team-Enablement',
    description: 'Onboarding und Training für Ihr internes Team.',
    deliverables: {
      performance: ['Onboarding-Checklisten', 'Schulungsmaterialien'],
      rocket_performance: ['Vollständiges Team-Onboarding', 'Individuelle Trainings', 'Coaching-Sessions'],
    },
  },
  {
    id: 'support_reviews',
    label: 'Support & Reviews',
    description: 'Regelmäßige Review-Calls und Support-Rhythmus.',
    deliverables: {
      performance: ['Review-Rhythmus-Definition', 'Checklisten'],
      rocket_performance: ['Wöchentliche Review-Calls', 'Dedizierter Ansprechpartner', 'Priorisierter Support'],
    },
  },
];

// =============================================
// COMBINATION RULES
// =============================================

export const REQUIRED_MODULES: Record<OfferMode, string[]> = {
  performance: ['vertriebsstruktur', 'crm_setup', 'followup', 'kpi_dashboard'],
  rocket_performance: ['diagnose', 'vertriebsstruktur', 'crm_setup', 'kpi_dashboard'],
  variable: [],
};

export const MODULE_DEPENDENCIES: Record<string, string[]> = {
  ki_automationen: ['crm_setup'], // KI nur wenn CRM vorhanden
};

// =============================================
// COMPANY INFO
// =============================================

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'KRS Immobilien GmbH',
  address: 'Westerwaldstr. 146, 53773 Hennef',
  ust_id: 'DE224477392',
  hrb: 'HRB 18532',
  geschaeftsfuehrer: 'Jan Niklas Sommershoff, Yannick Müller',
};

// =============================================
// HELPER FUNCTIONS
// =============================================

export function validateOfferPrice(mode: OfferMode, totalCents: number): { valid: boolean; message?: string } {
  const minPrice = PROGRAM_MIN_PRICES[mode];
  if (totalCents < minPrice) {
    return {
      valid: false,
      message: `Der Mindestpreis für ${PROGRAM_LABELS[mode]} beträgt ${(minPrice / 100).toLocaleString('de-DE')} € netto.`,
    };
  }
  return { valid: true };
}

export function validateModuleSelection(mode: OfferMode, selectedModules: string[]): { valid: boolean; missing: string[] } {
  const required = REQUIRED_MODULES[mode];
  const missing = required.filter(id => !selectedModules.includes(id));
  return { valid: missing.length === 0, missing };
}

export function checkModuleDependencies(moduleId: string, selectedModules: string[]): { satisfied: boolean; requires: string[] } {
  const deps = MODULE_DEPENDENCIES[moduleId];
  if (!deps) return { satisfied: true, requires: [] };
  const missing = deps.filter(id => !selectedModules.includes(id));
  return { satisfied: missing.length === 0, requires: missing };
}

export function getDeliverablesForMode(mode: OfferMode, selectedModules: string[]): string[] {
  if (mode === 'variable') return [];
  return OFFER_MODULES
    .filter(m => selectedModules.includes(m.id))
    .flatMap(m => m.deliverables[mode as 'performance' | 'rocket_performance']);
}

export function getModuleById(id: string): ModuleDefinition | undefined {
  return OFFER_MODULES.find(m => m.id === id);
}

export function getDefaultModulesForMode(mode: OfferMode): string[] {
  return REQUIRED_MODULES[mode];
}

// =============================================
// PAIN-POINT TO MODULE MAPPING
// =============================================

export const PAIN_POINT_LABELS: Record<string, string> = {
  vertrieb: 'Vertrieb / Lead-Generierung',
  closing: 'Abschlussquote / Closing',
  prozesse: 'Prozesse / Workflows',
  fuehrung: 'Führung / Delegation',
  sichtbarkeit: 'Sichtbarkeit / Marketing',
  kundenbindung: 'Kundenbindung / Retention',
};

export const PAIN_POINT_MODULE_MAP: Record<string, string[]> = {
  vertrieb: ['vertriebsstruktur', 'landingpage'],
  closing: ['vertriebsstruktur', 'structogram'],
  prozesse: ['crm_setup', 'followup', 'ki_automationen'],
  fuehrung: ['team_enablement', 'kpi_dashboard', 'structogram'],
  sichtbarkeit: ['landingpage'],
  kundenbindung: ['followup', 'support_reviews'],
};

export const PAIN_POINT_SOLUTION_TEXTS: Record<string, string> = {
  vertrieb: 'Strukturierter Vertriebsprozess mit klarer Pipeline und Landingpage-Funnel.',
  closing: 'Gesprächsleitfäden und Structogram-basierte Closing-Strategien.',
  prozesse: 'CRM-Automatisierungen, Follow-up-Sequenzen und KI-gestützte Prozesse.',
  fuehrung: 'KPI-Dashboard, Team-Enablement und Führungsstrukturen nach Structogram.',
  sichtbarkeit: 'Professionelle Landingpage mit Conversion-optimiertem Offer-Flow.',
  kundenbindung: 'Automatisierte Follow-up-Logik und regelmäßige Review-Zyklen.',
};

export function generateIntroText(mode: OfferMode, customerName: string): string {
  if (mode === 'variable') {
    return `Sehr geehrte/r ${customerName},\n\nanbei erhalten Sie unser Angebot für die nachfolgend beschriebene Leistung.`;
  }
  if (mode === 'performance') {
    return `Sehr geehrte/r ${customerName},\n\nwie besprochen erhalten Sie hier unser Angebot für KI-Automationen – Performance. Ein strukturierter Eingriff in Ihr Unternehmen zur Herstellung von Kontrolle, Planbarkeit und Entlastung.`;
  }
  return `Sehr geehrte/r ${customerName},\n\nwie besprochen erhalten Sie hier unser Angebot für KI-Automationen – Rocket Performance. Die Premium-Betreuung mit vollständigem Systemaufbau und maximaler Unterstützung für Ihr Unternehmen.`;
}
