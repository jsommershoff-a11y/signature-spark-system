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

// --- Server sync hook ---------------------------------------------------------
// A registered syncer pushes the current local prefs to the server (profiles.meta).
// Set by `useCrmDialogPrefsSync()` once the user is authenticated.
type Syncer = (snapshot: { transition: PipelineStage[]; skip: PipelineStage[] }) => void;
let registeredSyncer: Syncer | null = null;

export const registerCrmDialogPrefsSyncer = (fn: Syncer | null) => {
  registeredSyncer = fn;
};

const snapshot = () => ({
  transition: Object.entries(read(STORAGE_KEY))
    .filter(([, v]) => !!v)
    .map(([k]) => k as PipelineStage),
  skip: Object.entries(read(SKIP_STORAGE_KEY))
    .filter(([, v]) => !!v)
    .map(([k]) => k as PipelineStage),
});

const pushToServer = () => {
  if (registeredSyncer) {
    try {
      registeredSyncer(snapshot());
    } catch {
      /* ignore */
    }
  }
};

/**
 * Apply a server-side snapshot to local storage (called once after login).
 * Server is treated as the source of truth on first load to enable
 * device-übergreifende Stillstellungen.
 */
export const applyServerStageDialogPrefs = (server: {
  transition?: PipelineStage[];
  skip?: PipelineStage[];
} | null | undefined) => {
  if (!server) return;
  const transition: Record<string, boolean> = {};
  (server.transition ?? []).forEach((s) => { transition[s] = true; });
  const skip: Record<string, boolean> = {};
  (server.skip ?? []).forEach((s) => { skip[s] = true; });
  write(STORAGE_KEY, transition);
  write(SKIP_STORAGE_KEY, skip);
};

// --- Public API --------------------------------------------------------------

export const isStageDialogSuppressed = (stage: PipelineStage): boolean => {
  return !!read(STORAGE_KEY)[stage];
};

export const suppressStageDialog = (stage: PipelineStage) => {
  const data = read(STORAGE_KEY);
  data[stage] = true;
  write(STORAGE_KEY, data);
  pushToServer();
};

export const resetStageDialogSuppressions = () => {
  write(STORAGE_KEY, {});
  write(SKIP_STORAGE_KEY, {});
  pushToServer();
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
  pushToServer();
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
  pushToServer();
};

export const clearSkipDialogSuppression = (toStage: PipelineStage) => {
  const data = read(SKIP_STORAGE_KEY);
  delete data[toStage];
  write(SKIP_STORAGE_KEY, data);
  pushToServer();
};
