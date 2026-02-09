-- Step 05: Add qualification scoring columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS jahresumsatz text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS entscheider_status text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS motivation text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS entscheidungsstil text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_score integer DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_qualified boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS branche text;