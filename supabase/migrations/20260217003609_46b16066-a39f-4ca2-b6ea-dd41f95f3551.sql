
-- Demo-Daten loeschen (FK-Reihenfolge beachten)
-- Benutzerkonten (profiles, user_roles) und LMS-Inhalte (courses, modules, lessons) bleiben erhalten

DELETE FROM call_queue_items;
DELETE FROM call_queues;
DELETE FROM transcripts;
DELETE FROM ai_analyses;
DELETE FROM offers;
DELETE FROM crm_tasks;
DELETE FROM pipeline_items;
DELETE FROM calls;
DELETE FROM crm_leads;
DELETE FROM leads;
