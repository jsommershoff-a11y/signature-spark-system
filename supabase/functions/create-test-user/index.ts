import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
    
    console.log('Checking if test user already exists...')
    
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      throw listError
    }
    
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail)
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.id)
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

    console.log('Creating new test user...')
    
    // Create user via Admin API
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

    if (createError) {
      console.error('Error creating user:', createError)
      throw createError
    }

    console.log('User created:', newUser.user.id)

    // Profile should be auto-created by handle_new_user trigger
    // But we'll ensure it exists with correct data
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: newUser.user.id,
        email: testEmail,
        first_name: 'Test',
        last_name: 'Mitarbeiter',
        full_name: 'Test Mitarbeiter'
      }, { onConflict: 'user_id' })

    if (profileError) {
      console.error('Error upserting profile:', profileError)
      // Don't throw - profile might be created by trigger
    }

    console.log('Profile ensured')

    // Assign mitarbeiter role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'mitarbeiter'
      })

    if (roleError) {
      console.error('Error assigning role:', roleError)
      throw roleError
    }

    console.log('Role assigned: mitarbeiter')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test user created successfully',
        user_id: newUser.user.id,
        email: testEmail,
        password: testPassword,
        role: 'mitarbeiter'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in create-test-user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
