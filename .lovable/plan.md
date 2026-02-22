

## Refaktorierung: useState+useCallback Hooks zu React Query

### Zusammenfassung

Die vier manuellen Daten-Hooks (`useLeads`, `useTasks`, `usePipeline`, `useCalls`/`useCallDetail`) werden auf `@tanstack/react-query` (`useQuery` + `useMutation`) migriert. Das eliminiert manuelles State-Management, bietet automatisches Caching, Background-Refetching, und verhindert die toast-Endlosschleifen-Problematik dauerhaft.

`useAnalysis` wird NICHT migriert -- es ist kein Daten-Lade-Hook sondern bietet imperative Funktionen (fetchAnalysis, regenerateAnalysis).

### Vorteile der Migration

- Automatisches Caching und Deduplication (gleiche Query wird nur einmal gefeuert)
- Background Refetching bei Window-Focus
- Stale-While-Revalidate Pattern
- Kein manuelles useState/useEffect/useCallback mehr
- Cache-Invalidierung nach Mutationen statt manuellem State-Update
- Konsistenz mit bestehenden react-query Hooks (useCustomers, useOffers, useCourses)

### API-Kompatibilitaet

Die Return-Signatur jedes Hooks bleibt identisch, damit keine Consumer-Dateien geaendert werden muessen:

- `loading` bleibt `loading` (gemappt von `isLoading`)
- `error` bleibt `Error | null`
- `refetch` bleibt verfuegbar
- Mutations-Funktionen (create, update, delete) behalten ihre Signatur
- Exportierte Interfaces (`PipelineItemWithLead`, `PipelineData`) bleiben identisch

### Betroffene Dateien (nur Hooks, keine Consumer-Aenderungen)

---

#### Step 01 -- src/hooks/useLeads.ts

**Aenderung:** Komplett auf `useQuery` + `useMutation` umschreiben.

- `useQuery` mit `queryKey: ['leads', filters]` fuer die Datenladung
- Filter-Logik bleibt in `queryFn`
- `createLead`, `updateLead`, `deleteLead`, `assignLead`, `updatePipelineStage` werden zu lokalen async Funktionen die nach Erfolg `queryClient.invalidateQueries({ queryKey: ['leads'] })` aufrufen
- Toast-Aufrufe bleiben in den Mutations-Funktionen (try/catch)
- Return-Objekt: `{ leads, loading, error, refetch, createLead, updateLead, deleteLead, assignLead, updatePipelineStage }`

---

#### Step 02 -- src/hooks/useTasks.ts

**Aenderung:** Komplett auf `useQuery` + lokale Mutations-Funktionen umschreiben.

- `useQuery` mit `queryKey: ['tasks', filters]`
- `openTasks`, `doneTasks`, `blockedTasks` werden mit `useMemo` aus `data` abgeleitet
- `createTask`, `updateTask`, `completeTask`, `reopenTask`, `deleteTask` invalidieren den Cache nach Erfolg
- Return-Objekt bleibt identisch

---

#### Step 03 -- src/hooks/usePipeline.ts

**Aenderung:** Komplett auf `useQuery` umschreiben.

- `useQuery` mit `queryKey: ['pipeline']`
- `pipelineByStage` wird mit `useMemo` aus den rohen Items abgeleitet (Gruppierung nach Stage)
- Realtime-Subscription bleibt bestehen, ruft `queryClient.invalidateQueries({ queryKey: ['pipeline'] })` auf statt `fetchPipeline()`
- `moveToStage` und `updatePriority` invalidieren den Cache nach Erfolg
- Exportierte Interfaces bleiben identisch
- `getStageCount` und `getTotalValue` bleiben als Hilfsfunktionen

---

#### Step 04 -- src/hooks/useCalls.ts (useCalls + useCallDetail)

**Aenderung:** Beide Hooks auf `useQuery` umschreiben.

**useCalls:**
- `useQuery` mit `queryKey: ['calls', filters]`, enabled wenn `profile` vorhanden
- `createCall`, `updateCall`, `startCall`, `endCall`, `deleteCall` bleiben als async Funktionen mit Cache-Invalidierung
- Return-Objekt bleibt identisch

**useCallDetail:**
- `useQuery` mit `queryKey: ['call-detail', callId]`, enabled wenn `callId` definiert
- Laedt Call, Transcript und Analysis in einer queryFn (3 parallele Requests)
- Return: `{ call, transcript, analysis, loading, refetch }`

---

### Technisches Muster (fuer alle Hooks gleich)

```text
import { useQuery, useQueryClient } from '@tanstack/react-query';

function useXxx(filters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['xxx', filters],
    queryFn: async () => {
      // Supabase fetch logic (unchanged)
    },
  });

  const createXxx = async (input) => {
    try {
      // Supabase insert
      queryClient.invalidateQueries({ queryKey: ['xxx'] });
      toast({ title: 'Erfolg' });
    } catch (err) {
      toast({ title: 'Fehler', variant: 'destructive' });
    }
  };

  return {
    items: data ?? [],
    loading: isLoading,
    error: error as Error | null,
    refetch,
    createXxx,
  };
}
```

### Was NICHT geaendert wird

- Keine Consumer-Dateien (Pages, Components) -- die Return-API bleibt stabil
- `useAnalysis.ts` -- kein Daten-Lade-Hook
- `useCustomers.ts`, `useOffers.ts`, `useCourses.ts` -- nutzen bereits react-query
- Keine neuen Dependencies -- `@tanstack/react-query` ist bereits installiert

### Reihenfolge und Validierung

Jeder Step wird einzeln implementiert und validiert:
- Build muss fehlerfrei sein
- TypeScript-Kompilierung muss sauber sein
- Bestehende Funktionalitaet darf nicht brechen
