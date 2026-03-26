INSERT INTO public.prompt_categories (name, slug, description, icon, sort_order) VALUES
  ('Vertrieb & Akquise', 'vertrieb', 'Prompts für Kaltakquise, Erstgespräche und Abschluss', 'Phone', 1),
  ('Marketing & Content', 'marketing', 'Social Media Posts, Ad-Texte, Newsletter', 'Megaphone', 2),
  ('Prozesse & Automatisierung', 'prozesse', 'Workflows, SOPs und Automatisierungen', 'Workflow', 3),
  ('Kundenservice', 'kundenservice', 'Support-Antworten, FAQ, Onboarding-Texte', 'Headphones', 4),
  ('Strategie & Planung', 'strategie', 'Business-Pläne, Zieldefinition, Quartalsplanung', 'Target', 5);

INSERT INTO public.prompts (category_id, title, description, prompt_text, min_tier, sort_order)
SELECT c.id, v.title, v.description, v.prompt_text, v.min_tier, v.sort_order
FROM (VALUES
  ('vertrieb', 'Kaltakquise E-Mail', 'Erstansprache per E-Mail für B2B-Leads', 'Schreibe eine professionelle Kaltakquise-E-Mail für [Branche]. Der Empfänger ist [Position] bei [Unternehmen]. Fokus auf [Schmerzpunkt]. Halte die Mail unter 150 Wörtern.', 'basic', 1),
  ('marketing', 'Social Media Post', 'Aufmerksamkeitsstarker LinkedIn-Post', 'Erstelle einen LinkedIn-Post zum Thema [Thema]. Zielgruppe: [Zielgruppe]. Tonalität: professionell aber nahbar. Inkludiere einen Call-to-Action. Max 200 Wörter.', 'basic', 1),
  ('prozesse', 'SOP erstellen', 'Standard Operating Procedure für wiederkehrende Aufgaben', 'Erstelle eine SOP für den Prozess [Prozessname]. Schritte klar nummerieren. Verantwortliche benennen. Zeitrahmen pro Schritt angeben. Format: Checkliste.', 'basic', 1),
  ('kundenservice', 'Willkommensnachricht', 'Onboarding-Nachricht für neue Kunden', 'Schreibe eine Willkommensnachricht für einen neuen Kunden von [Unternehmen]. Erwähne die nächsten Schritte, den Ansprechpartner und wie der Kunde Support erreicht.', 'basic', 1),
  ('strategie', 'Quartalsziele definieren', 'Strukturierte Zieldefinition', 'Hilf mir, 3 messbare Quartalsziele für [Bereich] zu definieren. Nutze das OKR-Framework. Jedes Ziel braucht 2-3 Key Results mit konkreten Zahlen.', 'basic', 1),
  ('vertrieb', 'Einwandbehandlung Skript', 'Gesprächsleitfaden für typische Einwände', 'Erstelle ein Einwandbehandlungs-Skript für [Produkt/Dienstleistung]. Die häufigsten 5 Einwände sind: [Liste]. Für jeden Einwand: Verständnis zeigen, umrahmen, Lösung bieten.', 'starter', 2),
  ('marketing', 'Content-Kalender', 'Monatlicher Content-Plan', 'Erstelle einen 4-Wochen Content-Kalender für [Plattform]. Branche: [Branche]. Mix aus: Expertise-Posts (40pct), Behind-the-Scenes (20pct), Kundenstimmen (20pct), CTA-Posts (20pct).', 'starter', 2),
  ('prozesse', 'Automatisierungs-Audit', 'Prozesse identifizieren die automatisiert werden können', 'Analysiere folgende Geschäftsprozesse und identifiziere Automatisierungspotenzial: [Prozessliste]. Für jeden Prozess: aktueller Zeitaufwand, Automatisierungstool, erwartete Zeitersparnis.', 'starter', 2),
  ('kundenservice', 'FAQ-Generator', 'Automatisierte FAQ-Erstellung', 'Erstelle 10 häufig gestellte Fragen mit Antworten für [Produkt/Dienstleistung]. Kategorisiere nach: Vor dem Kauf, Während der Nutzung, Support. Tonalität: hilfreich und klar.', 'starter', 2),
  ('strategie', 'Wettbewerbsanalyse', 'Systematische Konkurrenzanalyse', 'Erstelle eine strukturierte Wettbewerbsanalyse für [Branche/Markt]. Vergleiche [Unternehmen] mit [Wettbewerber 1-3]. Kriterien: Preismodell, USP, Zielgruppe, Online-Präsenz, Schwächen.', 'starter', 2)
) AS v(cat_slug, title, description, prompt_text, min_tier, sort_order)
JOIN public.prompt_categories c ON c.slug = v.cat_slug;

INSERT INTO public.tools (name, description, category, url, min_tier, is_featured, sort_order) VALUES
  ('ChatGPT', 'KI-Assistent für Text, Ideen und Analyse', 'KI & Text', 'https://chat.openai.com', 'basic', true, 1),
  ('Make.com', 'No-Code Automatisierungsplattform', 'Automatisierung', 'https://www.make.com', 'basic', true, 2),
  ('Canva', 'Design-Tool für Social Media und Marketing', 'Design', 'https://www.canva.com', 'basic', false, 3),
  ('Notion', 'Projektmanagement und Wissensdatenbank', 'Organisation', 'https://www.notion.so', 'basic', false, 4),
  ('Instantly.ai', 'Cold-Email Automatisierung im großen Stil', 'Vertrieb', 'https://instantly.ai', 'starter', true, 5),
  ('Phantombuster', 'LinkedIn und Social Media Scraping', 'Lead-Generierung', 'https://phantombuster.com', 'starter', false, 6);