
-- Update calls to be conducted by test user
UPDATE calls 
SET conducted_by = '188e52c9-3b6a-4340-9ca7-949cc4bb05e1'
WHERE id IN (
  '5028696c-9ccf-455e-9104-4b6ce6a2b295',
  '0dc7a1ab-d75c-47ed-a1fb-6a3cda396cab',
  '8a2f1188-c22f-43b1-bb38-3228810a775f'
);

-- Update leads to be owned by test user
UPDATE crm_leads 
SET owner_user_id = '188e52c9-3b6a-4340-9ca7-949cc4bb05e1'
WHERE id IN (
  '1a1134e0-4be8-4433-9d2a-d242d95ce482',
  '56de6996-f58f-4959-90e0-c7f83dd84ebb',
  'b73b9a6c-c7e7-49d8-b95d-43ec65e573b9'
);
