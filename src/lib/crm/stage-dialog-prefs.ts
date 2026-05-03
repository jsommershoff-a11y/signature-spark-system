import { PipelineStage } from '@/types/crm';

const STORAGE_KEY = 'crm:stage-dialog:suppressed';

const read = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const write = (data: Record<string, boolean>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
};

export const isStageDialogSuppressed = (stage: PipelineStage): boolean => {
  return !!read()[stage];
};

export const suppressStageDialog = (stage: PipelineStage) => {
  const data = read();
  data[stage] = true;
  write(data);
};

export const resetStageDialogSuppressions = () => {
  write({});
};
