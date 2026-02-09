-- Step 01.3: Fix leads_source_check Constraint
-- Drop existing constraint and add new one with all valid source values

-- Step 1: Drop the existing constraint
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_source_check;

-- Step 2: Add new constraint with all valid source values
ALTER TABLE public.leads 
ADD CONSTRAINT leads_source_check 
CHECK (source = ANY (ARRAY[
  'start'::text, 
  'growth'::text, 
  'handwerk'::text, 
  'praxen'::text, 
  'dienstleister'::text, 
  'immobilien'::text, 
  'kurzzeitvermietung'::text, 
  'qualifizierung'::text
]));