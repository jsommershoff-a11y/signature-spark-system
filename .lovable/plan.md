

## Pipeline automatisch aktualisieren bei neuen Leads

### Problem

Der Datenbank-Trigger `create_pipeline_item_for_lead` erstellt bereits automatisch ein `pipeline_item` mit Stage `new_lead`, wenn ein neuer `crm_lead` eingefuegt wird. Die Pipeline-UI zeigt diese neuen Eintraege aber erst nach manuellem Seitenreload an, weil `usePipeline` keine Realtime-Subscription hat.

### Loesung

**Step 01 — Realtime-Subscription in usePipeline hinzufuegen**

Datei: `src/hooks/usePipeline.ts`

Ein zweiter `useEffect` wird hinzugefuegt, der eine Supabase Realtime-Subscription auf die Tabelle `pipeline_items` erstellt. Bei jeder Aenderung (INSERT, UPDATE, DELETE) wird `fetchPipeline()` erneut aufgerufen.

```typescript
useEffect(() => {
  const channel = supabase
    .channel('pipeline-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pipeline_items' },
      () => {
        fetchPipeline();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [fetchPipeline]);
```

### Ergebnis

- Neue Leads erscheinen sofort in der Pipeline-Spalte "Neuer Lead"
- Verschiebungen durch andere Nutzer werden ebenfalls live angezeigt
- Automatische Stage-Aenderungen (z.B. durch Analyse-Trigger) erscheinen sofort
- Keine Datenbankaenderungen noetig — nur eine Codeaenderung in einer Datei

### Voraussetzung

Supabase Realtime muss fuer die Tabelle `pipeline_items` aktiviert sein. Falls nicht, wird eine kurze Migration zum Aktivieren benoetigt (`ALTER PUBLICATION supabase_realtime ADD TABLE pipeline_items`).
