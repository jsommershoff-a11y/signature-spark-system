import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(['member_basic', 'member_starter', 'member_pro']).default('member_basic'),
  name: z.string().max(255).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    // Auth check — only admin/gruppenbetreuer
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Role check
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);

    const roles = (roleData || []).map((r: { role: string }) => r.role);
    const isAuthorized = roles.some((r: string) => ['admin', 'gruppenbetreuer'].includes(r));
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Parse body
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { email, role, name } = parsed.data;

    // Generate token
    const token_str = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get inviter profile
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userData.user.id)
      .single();

    // Create invitation record
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .insert({
        email,
        role,
        token: token_str,
        invited_by: inviterProfile?.id || userData.user.id,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (invError) {
      console.error('Invitation insert error:', invError);
      return new Response(JSON.stringify({ error: invError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Build invitation link
    const appUrl = 'https://signature-spark-system.lovable.app';
    const inviteLink = `${appUrl}/auth?token=${token_str}`;

    // Send email via Resend
    if (resendKey && lovableKey) {
      const greeting = name ? `Hallo ${name}` : 'Hallo';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #1a1a2e; font-size: 24px;">Einladung zum KRS Signature Mitgliederbereich</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            ${greeting},<br><br>
            Du wurdest zum KRS Signature Mitgliederbereich eingeladen. Klicke auf den folgenden Link, um dein Konto zu erstellen und loszulegen:
          </p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #F6711F; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 16px 0;">
            Einladung annehmen
          </a>
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 24px;">
            Dieser Link ist 7 Tage gültig.<br>
            Falls du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">KRS Signature – Automatisierung für Unternehmen</p>
        </div>
      `;

      try {
        const emailRes = await fetch(`${GATEWAY_URL}/emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lovableKey}`,
            'X-Connection-Api-Key': resendKey,
          },
          body: JSON.stringify({
            from: 'KRS Signature <info@krs-signature.de>',
            to: [email],
            subject: 'Deine Einladung zum KRS Signature Mitgliederbereich',
            html: emailHtml,
          }),
        });

        if (!emailRes.ok) {
          console.error('Email send failed:', await emailRes.text());
        } else {
          console.log('Invitation email sent to:', email);
        }
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }
    } else {
      console.warn('RESEND_API_KEY or LOVABLE_API_KEY not set, skipping email');
    }

    return new Response(
      JSON.stringify({ success: true, invitation_id: invitation.id, invite_link: inviteLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('invite-member error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
