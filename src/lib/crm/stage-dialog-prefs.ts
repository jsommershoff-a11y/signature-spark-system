import { PipelineStage } from '@/types/crm';

const STORAGE_KEY = 'crm:stage-dialog:suppressed';
const SKIP_STORAGE_KEY = 'crm:stage-dialog:skip-suppressed';

const read = (key: string): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const write = (key: string, data: Record<string, boolean>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
};

export const isStageDialogSuppressed = (stage: PipelineStage): boolean => {
  return !!read(STORAGE_KEY)[stage];
};

export const suppressStageDialog = (stage: PipelineStage) => {
  const data = read(STORAGE_KEY);
  data[stage] = true;
  write(STORAGE_KEY, data);
};

export const resetStageDialogSuppressions = () => {
  write(STORAGE_KEY, {});
  write(SKIP_STORAGE_KEY, {});
};

/**
 * Skip-Dialog-Suppression: Pro Ziel-Stage merkt sich die App, ob der
 * „X Stages überspringen?"-Dialog still gestellt wurde (für erfahrene Sales-Reps).
 */
export const isSkipDialogSuppressed = (toStage: PipelineStage): boolean => {
  return !!read(SKIP_STORAGE_KEY)[toStage];
};

export const suppressSkipDialog = (toStage: PipelineStage) => {
  const data = read(SKIP_STORAGE_KEY);
  data[toStage] = true;
  write(SKIP_STORAGE_KEY, data);
};

export const listSuppressedStageDialogs = (): PipelineStage[] => {
  return Object.entries(read(STORAGE_KEY))
    .filter(([, v]) => !!v)
    .map(([k]) => k as PipelineStage);
};

export const listSuppressedSkipDialogs = (): PipelineStage[] => {
  return Object.entries(read(SKIP_STORAGE_KEY))
    .filter(([, v]) => !!v)
    .map(([k]) => k as PipelineStage);
};

export const clearStageDialogSuppression = (stage: PipelineStage) => {
  const data = read(STORAGE_KEY);
  delete data[stage];
  write(STORAGE_KEY, data);
};

export const clearSkipDialogSuppression = (toStage: PipelineStage) => {
  const data = read(SKIP_STORAGE_KEY);
  delete data[toStage];
  write(SKIP_STORAGE_KEY, data);
};

