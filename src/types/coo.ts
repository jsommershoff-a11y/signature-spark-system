// COO Cockpit types — manual interfaces since tables aren't in generated types yet

export interface CooInvoice {
  id: string;
  invoice_id: string;
  datum: string;
  faelligkeit: string | null;
  betrag_brutto: number;
  betrag_netto: number;
  ust: number;
  status: string;
  gegenpartei: string | null;
  crm_id: string | null;
  objekt: string | null;
  kostenstelle: string | null;
  bereich: string | null;
  bezahlt_am: string | null;
  cash_flag: boolean | null;
  erstattungsfaehig: boolean | null;
}

export interface CooContact {
  id: string;
  crm_id: string | null;
  name: string;
  typ: string | null;
  email: string | null;
  telefon: string | null;
  ust_id: string | null;
  zahlungsziel: number | null;
  standard_konto: string | null;
  kostenstelle: string | null;
  erstellt_am: string | null;
  hubspot_id: string | null;
}

export interface CooOffer {
  id: string;
  deal_id: string | null;
  name: string;
  stage: string | null;
  betrag: number | null;
  weighted_value: number | null;
  close_date: string | null;
  pipeline: string | null;
  kontakt_id: string | null;
  objekt: string | null;
  kostenstelle: string | null;
  status: string | null;
  erstellt_am: string | null;
}

export interface CooOpenItem {
  id: string;
  typ: string | null;
  gegenpartei: string | null;
  betrag: number;
  faelligkeit: string | null;
  tage_ueberfaellig: number | null;
  status: string | null;
  risiko: string | null;
  objekt: string | null;
  kostenstelle: string | null;
  quelle: string | null;
}

export interface CooRevenueSummary {
  id: string;
  monat: string;
  bereich: string | null;
  objekt: string | null;
  ist_umsatz: number;
  plan_umsatz: number | null;
  delta: number | null;
  quelle: string | null;
}

export interface CooSyncLog {
  id: string;
  timestamp: string;
  workflow: string | null;
  status: string | null;
  entity: string | null;
  message: string | null;
  records_processed: number | null;
}

export interface CooSyncError {
  id: string;
  timestamp: string;
  workflow: string | null;
  node_name: string | null;
  entity: string | null;
  error_message: string | null;
  raw_payload: any | null;
}
