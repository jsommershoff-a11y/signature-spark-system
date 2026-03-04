

# Plan: Password Reset, Registration Cleanup, Profile Completion & Privacy

## Overview

Four sequential changes to the auth flow, processed step by step.

---

## Step 01 — Password Reset Flow

**What:** Add "Passwort vergessen?" link on login form + create `/reset-password` page.

- **Auth.tsx**: Add a "Passwort vergessen?" button below the login form that triggers `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- **New file `src/pages/ResetPassword.tsx`**: Page that detects `type=recovery` in URL hash, shows a "new password" form, calls `supabase.auth.updateUser({ password })`. Shows success toast and redirects to `/auth`.
- **App.tsx**: Add public route `/reset-password` pointing to the new page.

---

## Step 02 — Registration: Add Phone, Remove Unnecessary Fields

**What:** Add phone number field to registration. Keep only: Vorname, Nachname, E-Mail, Telefon, Passwort. Add privacy checkbox.

- **Auth.tsx**: Add phone state, add phone input field, add Datenschutz checkbox with link to external privacy policy (krsimmobilien.de). Pass phone to signUp metadata.
- **AuthContext.tsx**: Extend `signUp` metadata to include `phone`. Update `handle_new_user` trigger if needed (phone is already on profiles table and populated from metadata — need to verify trigger).
- **Database migration**: Update `handle_new_user()` trigger to also save phone from `raw_user_meta_data->>'phone'`.

---

## Step 03 — Profile Completion Popup After Login

**What:** After login, if profile is missing key fields (company, etc.), show a dialog prompting the user to complete their data.

- **New file `src/components/app/ProfileCompletionDialog.tsx`**: A dialog that checks if `profile.company` is null/empty. If so, shows a form asking for: Firma/Unternehmen, Branche, Position/Rolle, Standort. On submit, updates the profiles table.
- **Database migration**: Add columns `position` and `location` to profiles table (if not already present — `company` already exists).
- **AppLayout.tsx**: Import and render `<ProfileCompletionDialog />` so it appears on first app load when profile is incomplete.

---

## Step 04 — Privacy Policy Integration

**What:** Ensure registration requires explicit privacy consent.

- Already handled in Step 02 (Datenschutz checkbox). The checkbox links to the external privacy policy at krsimmobilien.de (per existing project convention). Registration button is disabled until checkbox is checked.

---

## Technical Details

- Password reset uses Supabase built-in `resetPasswordForEmail` — no edge function needed.
- The profile completion dialog only shows once per session (track via sessionStorage or check profile fields).
- All new profile fields use nullable columns to avoid breaking existing users.
- The `handle_new_user` trigger update requires a database migration.

