import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// sevDesk REST API. Auth uses raw API key (no "Bearer" prefix).
// Docs: https://api.sevdesk.de/
const SEVDESK_API = "https://my.sevdesk.de/api/v1";

type SevHeaders = Record<string, string>;

async function sevFetch(path: string, init: RequestInit, headers: SevHeaders) {
  const res = await fetch(`${SEVDESK_API}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as SevHeaders | undefined) },
  });
  const text = await res.text();
  let body: unknown;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    throw new Error(`sevDesk ${init.method ?? "GET"} ${path} failed [${res.status}]: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
  return body as { objects?: unknown[]; total?: number } & Record<string, unknown>;
}

function splitName(full: string | null | undefined): { first: string; last: string } {
  const s = (full ?? "").trim();
  if (!s) return { first: "", last: "" };
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { first: "", last: parts[0] };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- Authentication & Authorization ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: hasRole } = await supabase.rpc("has_min_role", {
      _user_id: userData.user.id,
      _min_role: "teamleiter",
    });
    if (!hasRole) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- sevDesk credentials ---
    const SEVDESK_API_KEY = Deno.env.get("SEVDESK_API_KEY");
    if (!SEVDESK_API_KEY) throw new Error("SEVDESK_API_KEY not configured");

    const SEVDESK_CONTACT_PERSON_ID = Deno.env.get("SEVDESK_CONTACT_PERSON_ID"); // numeric SevUser id used as invoice owner
    const SEVDESK_TAX_RATE = Number(Deno.env.get("SEVDESK_TAX_RATE") ?? "19");
    const SEVDESK_TAX_TYPE = Deno.env.get("SEVDESK_TAX_TYPE") ?? "default"; // default | eu | noteu | custom

    const sevHeaders: SevHeaders = {
      Authorization: SEVDESK_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const { action, data } = await req.json();
    let result: unknown;

    switch (action) {
      // ========================================
      // PUSH: CRM Lead → sevDesk Contact
      // (category 3 = Kunde / customer)
      // ========================================
      case "push_lead": {
        const { lead_id } = data;
        const { data: lead, error } = await supabase
          .from("crm_leads")
          .select("*")
          .eq("id", lead_id)
          .single();
        if (error || !lead) throw new Error("Lead not found");

        const isOrg = !!lead.company;
        const orgName = lead.company || `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim();
        const { first, last } = splitName(`${lead.first_name ?? ""} ${lead.last_name ?? ""}`);

        const payload: Record<string, unknown> = {
          name: orgName,
          status: 100, // 100 = lead, 500 = pending, 1000 = active
          customerNumber: `crm-${String(lead.id).slice(0, 8)}`,
          category: { id: 3, objectName: "Category" },
        };
        if (!isOrg) {
          payload.surename = first;
          payload.familyname = last;
          payload.name = ""; // person, not organisation
          payload.name2 = null;
        }

        let contactId = lead.sevdesk_id as string | null;

        if (contactId) {
          const upd = await sevFetch(`/Contact/${contactId}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          }, sevHeaders);
          result = { action: "updated", sevdesk_id: contactId, raw: upd };
        } else {
          const created = await sevFetch(`/Contact`, {
            method: "POST",
            body: JSON.stringify(payload),
          }, sevHeaders);
          contactId = String((created as any)?.objects?.id ?? (created as any)?.id ?? "");
          if (!contactId) throw new Error("sevDesk contact creation returned no id");

          await supabase.from("crm_leads").update({ sevdesk_id: contactId }).eq("id", lead_id);
          result = { action: "created", sevdesk_id: contactId };
        }

        // Attach email + phone as separate communication ways (best-effort, ignore errors)
        if (lead.email) {
          try {
            await sevFetch(`/CommunicationWay`, {
              method: "POST",
              body: JSON.stringify({
                contact: { id: contactId, objectName: "Contact" },
                type: "EMAIL",
                value: lead.email,
                key: { id: 2, objectName: "CommunicationWayKey" }, // 2 = work
                main: true,
              }),
            }, sevHeaders);
          } catch (e) { console.warn("sevDesk email attach failed:", e); }
        }
        if (lead.phone) {
          try {
            await sevFetch(`/CommunicationWay`, {
              method: "POST",
              body: JSON.stringify({
                contact: { id: contactId, objectName: "Contact" },
                type: "PHONE",
                value: lead.phone,
                key: { id: 2, objectName: "CommunicationWayKey" },
              }),
            }, sevHeaders);
          } catch (e) { console.warn("sevDesk phone attach failed:", e); }
        }
        break;
      }

      // ========================================
      // PULL: sevDesk Contacts → public.contacts
      // ========================================
      case "pull_contacts": {
        const limit = data?.limit ?? 100;
        const offset = data?.offset ?? 0;
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
          depth: "1",
        });
        const list = await sevFetch(`/Contact?${params}`, { method: "GET" }, sevHeaders);
        const items = (list?.objects as any[]) ?? [];

        let imported = 0;
        let skipped = 0;
        for (const c of items) {
          const sevId = String(c.id);
          const isOrg = !!c.name && !c.surename && !c.familyname;
          const displayName = isOrg
            ? c.name
            : [c.surename, c.familyname].filter(Boolean).join(" ").trim() || c.name || "Unbekannt";

          const { error: upsertErr } = await supabase
            .from("contacts")
            .upsert({
              name: displayName,
              typ: isOrg ? "organisation" : "person",
              ust_id: c.vatNumber ?? null,
              zahlungsziel: c.defaultTimeToPay ?? null,
              crm_id: c.customerNumber ?? null,
              sevdesk_id: sevId,
            }, { onConflict: "sevdesk_id" });

          if (upsertErr) {
            console.error("contacts upsert error:", upsertErr);
            skipped++;
          } else {
            imported++;
          }
        }

        await supabase.from("sync_logs").insert({
          workflow: "sevdesk_pull_contacts",
          entity: "contacts",
          status: "success",
          records_processed: imported,
          message: `imported=${imported} skipped=${skipped}`,
        });

        result = { imported, skipped, total: items.length };
        break;
      }

      // ========================================
      // PUSH: Offer → sevDesk Invoice
      // (Factory/saveInvoice creates invoice + positions atomically)
      // ========================================
      case "push_invoice": {
        const { offer_id } = data;
        const { data: offer, error } = await supabase
          .from("offers")
          .select("*, crm_leads!offers_lead_id_fkey(first_name, last_name, email, company, sevdesk_id, id)")
          .eq("id", offer_id)
          .single();
        if (error || !offer) throw new Error("Offer not found");

        const lead = (offer as any).crm_leads;
        let sevContactId = lead?.sevdesk_id as string | null;

        // Auto-push lead to sevDesk if it has no sevdesk_id yet
        if (!sevContactId && lead?.id) {
          const ownUrl = req.url;
          const pushRes = await fetch(ownUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: authHeader },
            body: JSON.stringify({ action: "push_lead", data: { lead_id: lead.id } }),
          });
          const pushed = await pushRes.json();
          sevContactId = pushed?.result?.sevdesk_id ?? null;
        }
        if (!sevContactId) throw new Error("Cannot create invoice without sevDesk contact");
        if (!SEVDESK_CONTACT_PERSON_ID) throw new Error("SEVDESK_CONTACT_PERSON_ID not configured");

        const offerJson = (offer.offer_json as any) ?? {};
        const positions: any[] = Array.isArray(offerJson.line_items)
          ? offerJson.line_items.map((li: any, idx: number) => ({
              objectName: "InvoicePos",
              mapAll: true,
              quantity: Number(li.quantity ?? 1),
              price: Number(li.unit_price_cents ?? li.unit_price ?? 0) / (li.unit_price_cents ? 100 : 1),
              name: li.name ?? li.description ?? `Position ${idx + 1}`,
              text: li.description ?? "",
              taxRate: Number(li.tax_rate ?? SEVDESK_TAX_RATE),
              unity: { id: 1, objectName: "Unity" }, // 1 = piece
            }))
          : [{
              objectName: "InvoicePos",
              mapAll: true,
              quantity: 1,
              price: Number(offerJson.total_price_cents ?? 0) / 100,
              name: offerJson.title ?? `Angebot ${offer.version}`,
              text: offerJson.description ?? "",
              taxRate: SEVDESK_TAX_RATE,
              unity: { id: 1, objectName: "Unity" },
            }];

        const invoicePayload = {
          invoice: {
            objectName: "Invoice",
            mapAll: true,
            invoiceDate: new Date().toISOString().slice(0, 10),
            status: 100, // 100 = draft, 200 = open, 1000 = paid
            contact: { id: sevContactId, objectName: "Contact" },
            contactPerson: { id: SEVDESK_CONTACT_PERSON_ID, objectName: "SevUser" },
            taxRate: SEVDESK_TAX_RATE,
            taxType: SEVDESK_TAX_TYPE,
            currency: offerJson.currency ?? "EUR",
            invoiceType: "RE", // RE = Rechnung
            header: offerJson.title ?? `Angebot ${offer.version}`,
            headText: offerJson.intro ?? null,
            footText: offerJson.outro ?? null,
          },
          invoicePosSave: positions,
          invoicePosDelete: null,
        };

        const created = await sevFetch(`/Invoice/Factory/saveInvoice`, {
          method: "POST",
          body: JSON.stringify(invoicePayload),
        }, sevHeaders);

        const sevInvoiceId = String((created as any)?.objects?.invoice?.id ?? "");
        if (!sevInvoiceId) throw new Error("sevDesk invoice creation returned no id");

        await supabase.from("offers").update({ sevdesk_invoice_id: sevInvoiceId }).eq("id", offer_id);

        result = { action: "invoice_created", sevdesk_invoice_id: sevInvoiceId };
        break;
      }

      // ========================================
      // PULL: sevDesk Invoices → public.invoices
      // ========================================
      case "pull_invoices": {
        const limit = data?.limit ?? 100;
        const offset = data?.offset ?? 0;
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
          embed: "contact",
        });
        const list = await sevFetch(`/Invoice?${params}`, { method: "GET" }, sevHeaders);
        const items = (list?.objects as any[]) ?? [];

        const statusMap: Record<string, string> = {
          "100": "entwurf",
          "200": "offen",
          "750": "teilbezahlt",
          "1000": "bezahlt",
        };

        let imported = 0;
        for (const inv of items) {
          const sevId = String(inv.id);
          const brutto = Number(inv.sumGross ?? 0);
          const netto = Number(inv.sumNet ?? 0);
          const ust = Number(inv.sumTax ?? brutto - netto);

          const { error: upErr } = await supabase
            .from("invoices")
            .upsert({
              sevdesk_id: sevId,
              invoice_id: inv.invoiceNumber ?? null,
              datum: inv.invoiceDate ? String(inv.invoiceDate).slice(0, 10) : null,
              faelligkeit: inv.payDate ? String(inv.payDate).slice(0, 10) : null,
              betrag_brutto: brutto,
              betrag_netto: netto,
              ust,
              status: statusMap[String(inv.status)] ?? "offen",
              gegenpartei: inv.contact?.name ?? null,
            }, { onConflict: "sevdesk_id" });
          if (!upErr) imported++;
        }

        await supabase.from("sync_logs").insert({
          workflow: "sevdesk_pull_invoices",
          entity: "invoices",
          status: "success",
          records_processed: imported,
        });

        result = { imported, total: items.length };
        break;
      }

      // ========================================
      // PULL: sevDesk Vouchers (incoming receipts) → public.invoices typ=eingang
      // ========================================
      case "pull_vouchers": {
        const limit = data?.limit ?? 100;
        const offset = data?.offset ?? 0;
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
          embed: "supplier",
        });
        const list = await sevFetch(`/Voucher?${params}`, { method: "GET" }, sevHeaders);
        const items = (list?.objects as any[]) ?? [];

        let imported = 0;
        for (const v of items) {
          const sevId = `voucher_${v.id}`;
          const brutto = Number(v.sumGross ?? 0);
          const netto = Number(v.sumNet ?? 0);
          const ust = Number(v.sumTax ?? brutto - netto);

          const { error: upErr } = await supabase
            .from("invoices")
            .upsert({
              sevdesk_id: sevId,
              invoice_id: v.voucherNumber ?? null,
              datum: v.voucherDate ? String(v.voucherDate).slice(0, 10) : null,
              faelligkeit: v.payDate ? String(v.payDate).slice(0, 10) : null,
              betrag_brutto: brutto,
              betrag_netto: netto,
              ust,
              status: v.status === "1000" ? "bezahlt" : "offen",
              gegenpartei: v.supplier?.name ?? v.supplierName ?? null,
            }, { onConflict: "sevdesk_id" });
          if (!upErr) imported++;
        }

        await supabase.from("sync_logs").insert({
          workflow: "sevdesk_pull_vouchers",
          entity: "vouchers",
          status: "success",
          records_processed: imported,
        });

        result = { imported, total: items.length };
        break;
      }

      // ========================================
      // SYNC: Pull contacts + invoices + vouchers in one call
      // ========================================
      case "full_sync": {
        const ownUrl = req.url;
        const callSelf = (a: string, d: unknown) => fetch(ownUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authHeader },
          body: JSON.stringify({ action: a, data: d }),
        }).then((r) => r.json());

        const [contacts, invoices, vouchers] = await Promise.all([
          callSelf("pull_contacts", { limit: 100 }),
          callSelf("pull_invoices", { limit: 100 }),
          callSelf("pull_vouchers", { limit: 100 }),
        ]);

        result = { contacts, invoices, vouchers };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}. Available: push_lead, pull_contacts, push_invoice, pull_invoices, pull_vouchers, full_sync`);
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sevdesk-sync error:", e);
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (supabaseUrl && supabaseKey) {
        const sb = createClient(supabaseUrl, supabaseKey);
        await sb.from("sync_errors").insert({
          workflow: "sevdesk_sync",
          node_name: "edge_function",
          entity: "sevdesk",
          error_message: e instanceof Error ? e.message : String(e),
        });
      }
    } catch (logErr) {
      console.error("failed to log sync error:", logErr);
    }
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
