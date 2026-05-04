import { PipelineStage } from '@/types/crm';

const STORAGE_KEY = 'crm:stage-dialog:suppressed';
const SKIP_STORAGE_KEY = 'crm:stage-dialog:skip-suppressed';

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

/**
 * Speicher-Format: `{ [stage]: timestampMs }`.
 * Für Rückwärtskompatibilität wird ein altes `boolean`-Format als „jetzt gesetzt"
 * interpretiert, sodass es nach 30 Tagen ebenfalls verfällt.
 */
type Store = Record<string, number>;

const now = () => Date.now();

const read = (key: string): Store => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Store = {};
    let migrated = false;
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'number') out[k] = v;
      else if (v === true) { out[k] = now(); migrated = true; }
    }
    if (migrated) write(key, out);
    return out;
  } catch {
    return {};
  }
};

const write = (key: string, data: Store) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

/** Entfernt abgelaufene Einträge und schreibt zurück, falls nötig. */
const prune = (key: string): Store => {
  const data = read(key);
  const cutoff = now() - TTL_MS;
  let changed = false;
  for (const [k, ts] of Object.entries(data)) {
    if (ts < cutoff) { delete data[k]; changed = true; }
  }
  if (changed) write(key, data);
  return data;
};

// --- Server sync hook --------------------------------------------------------
type Syncer = (snapshot: { transition: PipelineStage[]; skip: PipelineStage[] }) => void;
let registeredSyncer: Syncer | null = null;

export const registerCrmDialogPrefsSyncer = (fn: Syncer | null) => {
  registeredSyncer = fn;
};

const snapshot = () => ({
  transition: Object.keys(prune(STORAGE_KEY)) as PipelineStage[],
  skip: Object.keys(prune(SKIP_STORAGE_KEY)) as PipelineStage[],
});

const pushToServer = () => {
  if (registeredSyncer) {
    try { registeredSyncer(snapshot()); } catch { /* ignore */ }
  }
};

/**
 * Server-Snapshot in den lokalen Speicher übernehmen. Akzeptiert sowohl
 * eine reine Liste (ohne Timestamps – wird als „jetzt" gesetzt) als auch
 * ein Map-Format `{ stage: timestampMs }`.
 */
export const applyServerStageDialogPrefs = (server: {
  transition?: PipelineStage[] | Record<string, number>;
  skip?: PipelineStage[] | Record<string, number>;
} | null | undefined) => {
  if (!server) return;
  const cutoff = now() - TTL_MS;
  const toStore = (input: PipelineStage[] | Record<string, number> | undefined): Store => {
    const out: Store = {};
    if (!input) return out;
    if (Array.isArray(input)) {
      input.forEach((s) => { out[s] = now(); });
    } else {
      for (const [k, v] of Object.entries(input)) {
        const ts = typeof v === 'number' ? v : now();
        if (ts >= cutoff) out[k] = ts;
      }
    }
    return out;
  };
  write(STORAGE_KEY, toStore(server.transition));
  write(SKIP_STORAGE_KEY, toStore(server.skip));
};

// --- Public API --------------------------------------------------------------

export const isStageDialogSuppressed = (stage: PipelineStage): boolean => {
  return !!prune(STORAGE_KEY)[stage];
};

export const suppressStageDialog = (stage: PipelineStage) => {
  const data = prune(STORAGE_KEY);
  data[stage] = now();
  write(STORAGE_KEY, data);
  pushToServer();
};

export const resetStageDialogSuppressions = () => {
  write(STORAGE_KEY, {});
  write(SKIP_STORAGE_KEY, {});
  pushToServer();
};

export const isSkipDialogSuppressed = (toStage: PipelineStage): boolean => {
  return !!prune(SKIP_STORAGE_KEY)[toStage];
};

export const suppressSkipDialog = (toStage: PipelineStage) => {
  const data = prune(SKIP_STORAGE_KEY);
  data[toStage] = now();
  write(SKIP_STORAGE_KEY, data);
  pushToServer();
};

export const listSuppressedStageDialogs = (): PipelineStage[] => {
  return Object.keys(prune(STORAGE_KEY)) as PipelineStage[];
};

export const listSuppressedSkipDialogs = (): PipelineStage[] => {
  return Object.keys(prune(SKIP_STORAGE_KEY)) as PipelineStage[];
};

export const clearStageDialogSuppression = (stage: PipelineStage) => {
  const data = prune(STORAGE_KEY);
  delete data[stage];
  write(STORAGE_KEY, data);
  pushToServer();
};

export const clearSkipDialogSuppression = (toStage: PipelineStage) => {
  const data = prune(SKIP_STORAGE_KEY);
  delete data[toStage];
  write(SKIP_STORAGE_KEY, data);
  pushToServer();
};

/**
 * Liefert das Verfallsdatum (ms epoch) für eine stillgestellte Stage,
 * oder `null` falls nicht stillgestellt. Praktisch für UI-Hinweise
 * („läuft in 5 Tagen ab").
 */
export const getSkipDialogExpiry = (toStage: PipelineStage): number | null => {
  const ts = prune(SKIP_STORAGE_KEY)[toStage];
  return ts ? ts + TTL_MS : null;
};

export const getStageDialogExpiry = (stage: PipelineStage): number | null => {
  const ts = prune(STORAGE_KEY)[stage];
  return ts ? ts + TTL_MS : null;
};

export const SKIP_DIALOG_TTL_MS = TTL_MS;
