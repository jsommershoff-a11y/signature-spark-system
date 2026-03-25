export interface ScriptPhase {
  id: string;
  title: string;
  duration?: string;
  lines: string[];
  psychology?: string;
}

export interface ObjectionHandler {
  id: string;
  objection: string;
  emoji: string;
  reframe: string;
  response: string[];
  psychology: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
}

export interface SprintTimeSlot {
  time: string;
  task: string;
  details: string;
  channel: string;
}

export interface SprintDay {
  day: string;
  slots: SprintTimeSlot[];
}

export interface MarketingChannel {
  channel: string;
  measure: string;
  frequency: string;
  targetLeads: number;
}

export interface ContentDay {
  day: string;
  platform: string;
  type: string;
  hook: string;
  cta: string;
}

export interface FunnelStage {
  stage: string;
  targetCount: number;
  conversionRate: number;
}

export interface ScalingMonth {
  month: string;
  oneTime: number;
  recurring: number;
  total: number;
  milestone?: string;
}

export interface ProductTier {
  name: string;
  priceBrutto: number;
  monthlyTarget: number;
}
