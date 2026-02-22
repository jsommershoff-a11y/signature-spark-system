
## Endlos-Fehlerschleife beheben: `toast` aus useCallback-Dependencies entfernen

### Problem

Der `useToast`-Hook erzeugt bei jedem State-Update eine neue Referenz fuer `toast`. Da `toast` in der Dependency-Liste von `useCallback` steht (z.B. in `fetchTasks`, `fetchPipeline`, etc.), wird die Fetch-Funktion bei jedem Render neu erstellt. Das loest den zugehoerigen `useEffect` erneut aus, was einen neuen Fetch startet, der wiederum den State aendert -- eine Endlosschleife.

Wenn der Fetch fehlschlaegt (z.B. durch Netzwerk-Timeout), erscheint die rote Fehlermeldung "Fehler beim Laden der Aufgaben" hunderte Male pro Minute.

### Loesung

`toast` aus den `useCallback`-Dependency-Arrays entfernen. `toast` ist eine stabile Funktion (Modul-Level-Singleton), die nicht in Dependencies gehoert. Der ESLint-Kommentar `// eslint-disable-next-line react-hooks/exhaustive-deps` wird hinzugefuegt, um die Warnung zu unterdruecken.

### Betroffene Dateien

**Step 01 -- src/hooks/useTasks.ts (Zeile 60)**
- Aendern: `}, [filters, toast]);`
- Zu: `}, [filters]); // eslint-disable-line react-hooks/exhaustive-deps`

**Step 02 -- src/hooks/useLeads.ts (Zeile 77)**
- Aendern: `}, [filters, toast]);`
- Zu: `}, [filters]); // eslint-disable-line react-hooks/exhaustive-deps`

**Step 03 -- src/hooks/usePipeline.ts (Zeile 73)**
- Aendern: `}, [toast]);`
- Zu: `}, []); // eslint-disable-line react-hooks/exhaustive-deps`

**Step 04 -- src/hooks/useCalls.ts (Zeile 265)**
- Aendern: `}, [callId, toast]);`
- Zu: `}, [callId]); // eslint-disable-line react-hooks/exhaustive-deps`

**Step 05 -- src/hooks/useAnalysis.ts (Zeile 89)**
- Aendern: `}, [fetchAnalysis, toast]);`
- Zu: `}, [fetchAnalysis]); // eslint-disable-line react-hooks/exhaustive-deps`

### Ergebnis

- Keine Endlosschleifen mehr bei Fetch-Fehlern
- Keine wiederholten roten Fehlermeldungen
- Daten werden nur einmal beim Mount geladen (bzw. wenn sich echte Filter aendern)
- Keine funktionalen Aenderungen -- nur Stabilisierung der Render-Zyklen
