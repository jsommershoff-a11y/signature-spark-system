
-- Fill ALL remaining lessons with empty meta using a generic KI content template
UPDATE lessons SET
  meta = '{"content_html": "<h2>Lerninhalt</h2><h3>Kernkonzepte</h3><ul><li>Grundlegende Prinzipien und Best Practices</li><li>Die richtigen KI-Prompts für diesen Anwendungsfall</li><li>Praxisbeispiele aus echten Unternehmen</li><li>Häufige Fehler vermeiden</li></ul><h3>Dein Action-Prompt</h3><pre>Du bist KI-Experte für Business-Anwendungen.\n\nHilf mir als [meine Rolle] in der Branche [X]:\n1. Die wichtigsten Konzepte zu verstehen\n2. Einen sofort umsetzbaren Aktionsplan zu erstellen\n3. Die 3 größten Fehler zu vermeiden\n4. Meinen ersten Quick Win zu erzielen\n\nFormat: Nummerierte Liste mit konkreten Beispielen.</pre><h3>Nächste Schritte</h3><ol><li>Prompt testen und anpassen</li><li>Ergebnis dokumentieren</li><li>Als Template speichern</li><li>Im Team teilen</li></ol>"}'::jsonb,
  description = COALESCE(NULLIF(description, ''), 'KI-Wissen und praktische Anwendung für deinen Business-Alltag.')
WHERE meta IS NULL OR meta::text = '{}';
