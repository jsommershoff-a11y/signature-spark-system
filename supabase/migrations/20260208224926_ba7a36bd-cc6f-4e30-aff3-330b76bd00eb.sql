-- Step 1: Insert 3 test calls
INSERT INTO calls (lead_id, conducted_by, provider, call_type, status, scheduled_at, started_at, ended_at, duration_seconds, notes)
VALUES 
  -- Call 1: Max Mustermann - transcribed
  ('b73b9a6c-c7e7-49d8-b95d-43ec65e573b9', '2824ab54-05a2-4358-8a98-4ec7ae1262f9', 
   'manual', 'phone', 'transcribed', 
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', 
   NOW() - INTERVAL '2 days' + INTERVAL '1 hour 45 minutes', 2700,
   'Erstes Verkaufsgespräch - Interesse an Premium-Paket'),
   
  -- Call 2: Anna Schmidt - transcribed  
  ('1a1134e0-4be8-4433-9d2a-d242d95ce482', '2824ab54-05a2-4358-8a98-4ec7ae1262f9',
   'zoom', 'zoom', 'transcribed',
   NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 hours',
   NOW() - INTERVAL '1 day' + INTERVAL '2 hours 30 minutes', 1800,
   'Follow-up Call nach Demo'),
   
  -- Call 3: Thomas Weber - completed (kein Transkript)
  ('56de6996-f58f-4959-90e0-c7f83dd84ebb', '2824ab54-05a2-4358-8a98-4ec7ae1262f9',
   'twilio', 'phone', 'completed',
   NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 30 minutes',
   NOW() - INTERVAL '2 hours', 1800,
   'Discovery Call');

-- Step 2: Insert transcript for Call 1 (Max Mustermann)
INSERT INTO transcripts (call_id, provider, language, status, text, word_count, confidence_score, segments)
SELECT 
  id, 'whisper', 'de', 'done',
  'Verkäufer: Guten Tag Herr Mustermann, vielen Dank dass Sie sich die Zeit nehmen. 
Kunde: Ja, gerne. Ich habe mir Ihre Lösung angeschaut und finde das Konzept interessant.
Verkäufer: Das freut mich zu hören. Was genau hat Sie angesprochen?
Kunde: Vor allem die Automatisierung der Prozesse. Wir verlieren aktuell viel Zeit mit manuellen Aufgaben.
Verkäufer: Das verstehe ich. Wie viele Stunden pro Woche verbringen Sie damit?
Kunde: Ich würde sagen mindestens 15-20 Stunden pro Woche, nur für Reporting.
Verkäufer: Das ist erheblich. Mit unserer Lösung könnten Sie das auf 2-3 Stunden reduzieren.
Kunde: Das klingt gut, aber was kostet das?
Verkäufer: Das Premium-Paket liegt bei 499€ pro Monat. Dafür bekommen Sie alle Features.
Kunde: Das ist schon eine Investition. Gibt es eine Testphase?
Verkäufer: Ja, wir bieten 14 Tage kostenlos an. Ohne Risiko.
Kunde: Okay, das klingt fair. Ich würde das gerne mit meinem Partner besprechen.
Verkäufer: Natürlich. Wann kann ich mich wieder melden?
Kunde: Nächste Woche Mittwoch wäre gut.
Verkäufer: Perfekt, ich trage das ein. Vielen Dank für das Gespräch!',
  280, 0.94,
  '[{"start": 0, "end": 8, "speaker": "Verkäufer", "text": "Guten Tag Herr Mustermann, vielen Dank dass Sie sich die Zeit nehmen.", "confidence": 0.95},
    {"start": 8, "end": 15, "speaker": "Kunde", "text": "Ja, gerne. Ich habe mir Ihre Lösung angeschaut und finde das Konzept interessant.", "confidence": 0.93},
    {"start": 15, "end": 22, "speaker": "Verkäufer", "text": "Das freut mich zu hören. Was genau hat Sie angesprochen?", "confidence": 0.96},
    {"start": 22, "end": 35, "speaker": "Kunde", "text": "Vor allem die Automatisierung der Prozesse. Wir verlieren aktuell viel Zeit mit manuellen Aufgaben.", "confidence": 0.92}]'::jsonb
FROM calls 
WHERE lead_id = 'b73b9a6c-c7e7-49d8-b95d-43ec65e573b9'
LIMIT 1;

-- Step 3: Insert transcript for Call 2 (Anna Schmidt)
INSERT INTO transcripts (call_id, provider, language, status, text, word_count, confidence_score, segments)
SELECT 
  id, 'whisper', 'de', 'done',
  'Verkäufer: Hallo Frau Schmidt, schön Sie wiederzusehen. Wie war die Demo letzte Woche?
Kunde: Sehr beeindruckend. Mein Team war begeistert von der Benutzeroberfläche.
Verkäufer: Das freut mich. Gab es noch offene Fragen?
Kunde: Ja, zur Integration. Funktioniert das mit unserem SAP-System?
Verkäufer: Absolut, wir haben eine zertifizierte SAP-Schnittstelle. Die Einrichtung dauert etwa 2 Tage.
Kunde: Und was ist mit dem Support? Wir brauchen schnelle Reaktionszeiten.
Verkäufer: Im Business-Paket haben Sie 4-Stunden-Reaktionszeit, im Enterprise-Paket sogar 1 Stunde.
Kunde: Das Enterprise-Paket wäre dann das richtige für uns. Was kostet das genau?
Verkäufer: 1.499€ pro Monat bei jährlicher Zahlung. Bei monatlicher Zahlung 1.699€.
Kunde: Das muss ich mit der Geschäftsführung abstimmen. Wann brauchen Sie eine Entscheidung?
Verkäufer: Unser aktuelles Angebot gilt noch bis Ende des Monats.
Kunde: Verstanden. Ich melde mich bis Freitag.
Verkäufer: Perfekt. Soll ich Ihnen nochmal alle Details per E-Mail schicken?
Kunde: Ja, das wäre hilfreich. Danke!',
  245, 0.91,
  '[{"start": 0, "end": 10, "speaker": "Verkäufer", "text": "Hallo Frau Schmidt, schön Sie wiederzusehen. Wie war die Demo letzte Woche?", "confidence": 0.94},
    {"start": 10, "end": 20, "speaker": "Kunde", "text": "Sehr beeindruckend. Mein Team war begeistert von der Benutzeroberfläche.", "confidence": 0.89},
    {"start": 20, "end": 28, "speaker": "Verkäufer", "text": "Das freut mich. Gab es noch offene Fragen?", "confidence": 0.95},
    {"start": 28, "end": 40, "speaker": "Kunde", "text": "Ja, zur Integration. Funktioniert das mit unserem SAP-System?", "confidence": 0.92}]'::jsonb
FROM calls
WHERE lead_id = '1a1134e0-4be8-4433-9d2a-d242d95ce482'
LIMIT 1;