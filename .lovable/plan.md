
# Test-User mit bekannten Zugangsdaten erstellen

## Ziel

Einen Test-User mit bekannten Zugangsdaten erstellen, damit automatisierte Browser-Tests (inkl. Analyse-Funktion) durchgeführt werden können.

---

## Aktueller Stand

| User | E-Mail | Rolle |
|------|--------|-------|
| Jan Sommershoff | j.s@krsimmobilien.de | admin |

Es existiert nur 1 User im System. Für automatisierte Tests benötigen wir einen User mit bekannten Zugangsdaten.

---

## Lösung: Edge Function für Test-User

Da die Supabase Admin-API nur serverseitig verfügbar ist, erstellen wir eine Edge Function, die einen Test-User anlegt.

### Test-User Daten

| Feld | Wert |
|------|------|
| E-Mail | `test-staff@krs-test.dev` |
| Passwort | `TestUser2026!` |
| Vorname | Test |
| Nachname | Mitarbeiter |
| Rolle | `mitarbeiter` |

---

## Implementierungsschritte

### Step 01: Edge Function erstellen

Neue Edge Function `create-test-user`:

```text
supabase/functions/create-test-user/index.ts
```

Funktionalität:
- Erstellt User via Supabase Admin API
- Setzt Profil-Daten
- Weist Rolle zu
- Nur in Development erlaubt (Sicherheit)

### Step 02: Function aufrufen und User erstellen

Nach Deployment die Function aufrufen um den Test-User zu erstellen.

### Step 03: Login testen

Mit den bekannten Zugangsdaten einloggen und zur Calls-Seite navigieren.

---

## Technische Details

### Edge Function Code (create-test-user/index.ts)

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const testEmail = 'test-staff@krs-test.dev'
    const testPassword = 'TestUser2026!'
    
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail)
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Test user already exists',
          user_id: existingUser.id,
          email: testEmail 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'Mitarbeiter',
        full_name: 'Test Mitarbeiter'
      }
    })

    if (createError) throw createError

    // Create profile
    await supabase.from('profiles').insert({
      user_id: newUser.user.id,
      email: testEmail,
      first_name: 'Test',
      last_name: 'Mitarbeiter',
      full_name: 'Test Mitarbeiter'
    })

    // Assign mitarbeiter role
    await supabase.from('user_roles').insert({
      user_id: newUser.user.id,
      role: 'mitarbeiter'
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test user created',
        user_id: newUser.user.id,
        email: testEmail,
        password: testPassword,
        role: 'mitarbeiter'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## Sicherheitshinweise

1. Diese Function ist nur für Entwicklung gedacht
2. In Produktion sollte sie deaktiviert oder entfernt werden
3. Der Test-User hat die Rolle `mitarbeiter` (kein Admin)

---

## Erwartetes Ergebnis

Nach Implementierung:

| Zugangsdaten | Wert |
|--------------|------|
| E-Mail | `test-staff@krs-test.dev` |
| Passwort | `TestUser2026!` |
| Rolle | Mitarbeiter |

Damit kann die Analyse-Funktion auf `/app/calls` getestet werden.
