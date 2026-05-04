// Kosten-Nutzen-Rechnung (ROI) für Angebote
// Alle Werte in EURO (nicht Cent), damit die UI 1:1 ohne Umrechnung arbeitet.
// Speicherung erfolgt unter offer_json.roi_data — keine DB-Migration notwendig.

export interface RoiData {
  // 1. Aktueller Aufwand
  current_hours_per_week?: number;
  internal_hourly_rate_eur?: number;

  // 2. Aktuelle Kosten (zusätzlich zum Zeitverlust)
  manual_process_loss_eur_month?: number;
  lost_leads_eur_month?: number;
  error_costs_eur_month?: number;

  // 3. Investition
  one_time_price_eur?: number;
  monthly_price_eur?: number;
  duration_months?: number;

  // 4. Erwarteter Nutzen
  saved_hours_per_month?: number;
  expected_revenue_uplift_eur_month?: number;
  expected_cost_savings_eur_month?: number;
  qualitative_benefits?: string;
}

export interface RoiComputed {
  // Eingabe-Status
  hasAnyInput: boolean;
  hasInvestment: boolean;
  hasBenefit: boolean;

  // 1. Zeitverlust
  monthly_time_loss_eur: number; // hours/week * rate * 4.33

  // 2. Aktuelle Gesamtkosten (Zeit + Prozess + Leads + Fehler)
  current_monthly_pain_eur: number;

  // 3. Investition
  monthly_investment_eur: number; // one_time/duration + monthly
  total_investment_12m_eur: number;
  total_investment_3m_eur: number;

  // 4. Nutzen
  saved_time_value_eur_month: number; // saved_hours * rate
  total_monthly_benefit_eur: number;

  // 5. Break-even & Netto
  break_even_months: number | null; // null wenn nicht erreichbar
  net_benefit_3m_eur: number;
  net_benefit_12m_eur: number;
}

// Wochen pro Monat (Standardannahme)
export const WEEKS_PER_MONTH = 4.33;

const num = (v: number | undefined | null): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0;

export function computeRoi(d: RoiData | undefined | null): RoiComputed {
  const data = d || {};
  const hours = num(data.current_hours_per_week);
  const rate = num(data.internal_hourly_rate_eur);

  const monthly_time_loss_eur = hours * rate * WEEKS_PER_MONTH;

  const current_monthly_pain_eur =
    monthly_time_loss_eur +
    num(data.manual_process_loss_eur_month) +
    num(data.lost_leads_eur_month) +
    num(data.error_costs_eur_month);

  const oneTime = num(data.one_time_price_eur);
  const monthly = num(data.monthly_price_eur);
  const duration = Math.max(1, num(data.duration_months) || 12);

  const monthly_investment_eur = oneTime / duration + monthly;
  const total_investment_3m_eur = oneTime + monthly * 3;
  const total_investment_12m_eur = oneTime + monthly * 12;

  const saved_time_value_eur_month = num(data.saved_hours_per_month) * rate;
  const total_monthly_benefit_eur =
    saved_time_value_eur_month +
    num(data.expected_revenue_uplift_eur_month) +
    num(data.expected_cost_savings_eur_month);

  const net_monthly = total_monthly_benefit_eur - monthly_investment_eur;
  const break_even_months =
    total_monthly_benefit_eur > 0 && monthly_investment_eur >= 0
      ? (() => {
          // Vereinfachte Break-even-Berechnung:
          // Investition / monatlicher Nutzen
          const invForBE = oneTime + monthly; // erste Investition + 1 Monatsrate
          if (total_monthly_benefit_eur <= 0) return null;
          const months = invForBE / total_monthly_benefit_eur;
          return Number.isFinite(months) && months > 0 ? months : null;
        })()
      : null;

  const net_benefit_3m_eur = total_monthly_benefit_eur * 3 - total_investment_3m_eur;
  const net_benefit_12m_eur = total_monthly_benefit_eur * 12 - total_investment_12m_eur;

  const hasInvestment = oneTime > 0 || monthly > 0;
  const hasBenefit = total_monthly_benefit_eur > 0;
  const hasAnyInput =
    hours > 0 || rate > 0 || hasInvestment || hasBenefit ||
    num(data.manual_process_loss_eur_month) > 0 ||
    num(data.lost_leads_eur_month) > 0 ||
    num(data.error_costs_eur_month) > 0 ||
    !!data.qualitative_benefits;

  return {
    hasAnyInput,
    hasInvestment,
    hasBenefit,
    monthly_time_loss_eur,
    current_monthly_pain_eur,
    monthly_investment_eur,
    total_investment_3m_eur,
    total_investment_12m_eur,
    saved_time_value_eur_month,
    total_monthly_benefit_eur,
    break_even_months,
    net_benefit_3m_eur,
    net_benefit_12m_eur,
  };
}

export function formatEur(v: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatMonths(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return '—';
  if (v < 1) return '< 1 Monat';
  if (v > 60) return '> 60 Monate';
  return `${v.toFixed(1)} Monate`;
}
