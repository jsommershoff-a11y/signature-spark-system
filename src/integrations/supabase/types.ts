export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          content: string
          created_at: string
          customer_id: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_id?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          activated_at: string | null
          charges_enabled: boolean
          commission_rate: number
          created_at: string
          details_submitted: boolean
          id: string
          invited_at: string
          invited_by: string | null
          meta: Json | null
          payouts_enabled: boolean
          profile_id: string
          referral_code: string
          status: Database["public"]["Enums"]["affiliate_status"]
          stripe_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          charges_enabled?: boolean
          commission_rate?: number
          created_at?: string
          details_submitted?: boolean
          id?: string
          invited_at?: string
          invited_by?: string | null
          meta?: Json | null
          payouts_enabled?: boolean
          profile_id: string
          referral_code: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          stripe_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          charges_enabled?: boolean
          commission_rate?: number
          created_at?: string
          details_submitted?: boolean
          id?: string
          invited_at?: string
          invited_by?: string | null
          meta?: Json | null
          payouts_enabled?: boolean
          profile_id?: string
          referral_code?: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          stripe_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analyses: {
        Row: {
          analysis_json: Json
          call_id: string
          created_at: string
          id: string
          lead_id: string | null
          model_version: string | null
          primary_type: Database["public"]["Enums"]["structogram_type"] | null
          purchase_readiness: number | null
          secondary_type: Database["public"]["Enums"]["structogram_type"] | null
          status: string | null
          success_probability: number | null
          updated_at: string
        }
        Insert: {
          analysis_json: Json
          call_id: string
          created_at?: string
          id?: string
          lead_id?: string | null
          model_version?: string | null
          primary_type?: Database["public"]["Enums"]["structogram_type"] | null
          purchase_readiness?: number | null
          secondary_type?:
            | Database["public"]["Enums"]["structogram_type"]
            | null
          status?: string | null
          success_probability?: number | null
          updated_at?: string
        }
        Update: {
          analysis_json?: Json
          call_id?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          model_version?: string | null
          primary_type?: Database["public"]["Enums"]["structogram_type"] | null
          purchase_readiness?: number | null
          secondary_type?:
            | Database["public"]["Enums"]["structogram_type"]
            | null
          status?: string | null
          success_probability?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analyses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          properties: Json
          url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          properties?: Json
          url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          properties?: Json
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          position: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          position: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          position?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          auto_classified: boolean
          conflict_reason: string | null
          created_at: string
          created_by: string | null
          end_at: string
          google_calendar_id: string | null
          google_event_id: string | null
          google_event_summary: string | null
          id: string
          matched_rule_id: string | null
          notes: string | null
          profile_id: string
          slot_category: Database["public"]["Enums"]["slot_category"] | null
          source: Database["public"]["Enums"]["slot_source"]
          start_at: string
          status: Database["public"]["Enums"]["slot_status"]
          updated_at: string
        }
        Insert: {
          auto_classified?: boolean
          conflict_reason?: string | null
          created_at?: string
          created_by?: string | null
          end_at: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          google_event_summary?: string | null
          id?: string
          matched_rule_id?: string | null
          notes?: string | null
          profile_id: string
          slot_category?: Database["public"]["Enums"]["slot_category"] | null
          source?: Database["public"]["Enums"]["slot_source"]
          start_at: string
          status?: Database["public"]["Enums"]["slot_status"]
          updated_at?: string
        }
        Update: {
          auto_classified?: boolean
          conflict_reason?: string | null
          created_at?: string
          created_by?: string | null
          end_at?: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          google_event_summary?: string | null
          id?: string
          matched_rule_id?: string | null
          notes?: string | null
          profile_id?: string
          slot_category?: Database["public"]["Enums"]["slot_category"] | null
          source?: Database["public"]["Enums"]["slot_source"]
          start_at?: string
          status?: Database["public"]["Enums"]["slot_status"]
          updated_at?: string
        }
        Relationships: []
      }
      call_queue_items: {
        Row: {
          completed_at: string | null
          context_json: Json | null
          created_at: string | null
          id: string
          lead_id: string
          outcome: string | null
          priority_rank: number
          queue_id: string
          reason: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          context_json?: Json | null
          created_at?: string | null
          id?: string
          lead_id: string
          outcome?: string | null
          priority_rank: number
          queue_id: string
          reason?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          context_json?: Json | null
          created_at?: string | null
          id?: string
          lead_id?: string
          outcome?: string | null
          priority_rank?: number
          queue_id?: string
          reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_queue_items_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_queue_items_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "call_queues"
            referencedColumns: ["id"]
          },
        ]
      }
      call_queues: {
        Row: {
          assigned_to: string
          created_at: string | null
          date: string
          generated_by: string | null
          id: string
          priority_weight: number | null
        }
        Insert: {
          assigned_to: string
          created_at?: string | null
          date: string
          generated_by?: string | null
          id?: string
          priority_weight?: number | null
        }
        Update: {
          assigned_to?: string
          created_at?: string | null
          date?: string
          generated_by?: string | null
          id?: string
          priority_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "call_queues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_type: Database["public"]["Enums"]["call_type"] | null
          conducted_by: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          external_id: string | null
          id: string
          lead_id: string | null
          meta: Json | null
          notes: string | null
          provider: Database["public"]["Enums"]["call_provider"] | null
          recording_url: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["call_status"] | null
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          call_type?: Database["public"]["Enums"]["call_type"] | null
          conducted_by?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          external_id?: string | null
          id?: string
          lead_id?: string | null
          meta?: Json | null
          notes?: string | null
          provider?: Database["public"]["Enums"]["call_provider"] | null
          recording_url?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          call_type?: Database["public"]["Enums"]["call_type"] | null
          conducted_by?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          external_id?: string | null
          id?: string
          lead_id?: string | null
          meta?: Json | null
          notes?: string | null
          provider?: Database["public"]["Enums"]["call_provider"] | null
          recording_url?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["catalog_category"]
          code: string
          created_at: string
          delivery_days: number
          description: string | null
          id: string
          mode: Database["public"]["Enums"]["catalog_mode"]
          name: string
          offer_prompt: string | null
          offer_template: string | null
          optional_connectors: string[]
          payment_link: string
          price_gross_cents: number
          price_net_cents: number
          price_period_label: string | null
          required_connectors: string[]
          sort_order: number
          stripe_price_id: string
          stripe_product_id: string
          subtitle: string
          term_label: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["catalog_category"]
          code: string
          created_at?: string
          delivery_days?: number
          description?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["catalog_mode"]
          name: string
          offer_prompt?: string | null
          offer_template?: string | null
          optional_connectors?: string[]
          payment_link: string
          price_gross_cents: number
          price_net_cents: number
          price_period_label?: string | null
          required_connectors?: string[]
          sort_order?: number
          stripe_price_id: string
          stripe_product_id: string
          subtitle?: string
          term_label?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["catalog_category"]
          code?: string
          created_at?: string
          delivery_days?: number
          description?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["catalog_mode"]
          name?: string
          offer_prompt?: string | null
          offer_template?: string | null
          optional_connectors?: string[]
          payment_link?: string
          price_gross_cents?: number
          price_net_cents?: number
          price_period_label?: string | null
          required_connectors?: string[]
          sort_order?: number
          stripe_price_id?: string
          stripe_product_id?: string
          subtitle?: string
          term_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      closed_customer_snapshots: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string
          member_id: string | null
          order_id: string
          snapshot_json: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id: string
          member_id?: string | null
          order_id: string
          snapshot_json: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string
          member_id?: string | null
          order_id?: string
          snapshot_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "closed_customer_snapshots_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closed_customer_snapshots_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closed_customer_snapshots_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          affiliate_id: string
          commission_cents: number
          commission_rate: number
          created_at: string
          currency: string
          customer_email: string | null
          failure_reason: string | null
          gross_amount_cents: number
          id: string
          meta: Json | null
          paid_at: string | null
          product_name: string | null
          referral_id: string | null
          status: Database["public"]["Enums"]["commission_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_cents: number
          commission_rate: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          failure_reason?: string | null
          gross_amount_cents: number
          id?: string
          meta?: Json | null
          paid_at?: string | null
          product_name?: string | null
          referral_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_cents?: number
          commission_rate?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          failure_reason?: string | null
          gross_amount_cents?: number
          id?: string
          meta?: Json | null
          paid_at?: string | null
          product_name?: string | null
          referral_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          crm_id: string | null
          email: string | null
          erstellt_am: string | null
          hubspot_id: string | null
          id: string
          kostenstelle: string | null
          name: string
          standard_konto: string | null
          telefon: string | null
          typ: string | null
          ust_id: string | null
          zahlungsziel: number | null
        }
        Insert: {
          crm_id?: string | null
          email?: string | null
          erstellt_am?: string | null
          hubspot_id?: string | null
          id?: string
          kostenstelle?: string | null
          name: string
          standard_konto?: string | null
          telefon?: string | null
          typ?: string | null
          ust_id?: string | null
          zahlungsziel?: number | null
        }
        Update: {
          crm_id?: string | null
          email?: string | null
          erstellt_am?: string | null
          hubspot_id?: string | null
          id?: string
          kostenstelle?: string | null
          name?: string
          standard_konto?: string | null
          telefon?: string | null
          typ?: string | null
          ust_id?: string | null
          zahlungsziel?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          includes_done_for_you: boolean | null
          learning_path_id: string | null
          name: string
          path_level: Database["public"]["Enums"]["learning_path_level"] | null
          price_cents: number | null
          price_tier: Database["public"]["Enums"]["course_price_tier"] | null
          published: boolean | null
          published_at: string | null
          required_product:
            | Database["public"]["Enums"]["membership_product"]
            | null
          sort_order: number | null
          thumbnail_url: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          includes_done_for_you?: boolean | null
          learning_path_id?: string | null
          name: string
          path_level?: Database["public"]["Enums"]["learning_path_level"] | null
          price_cents?: number | null
          price_tier?: Database["public"]["Enums"]["course_price_tier"] | null
          published?: boolean | null
          published_at?: string | null
          required_product?:
            | Database["public"]["Enums"]["membership_product"]
            | null
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          includes_done_for_you?: boolean | null
          learning_path_id?: string | null
          name?: string
          path_level?: Database["public"]["Enums"]["learning_path_level"] | null
          price_cents?: number | null
          price_tier?: Database["public"]["Enums"]["course_price_tier"] | null
          published?: boolean | null
          published_at?: string | null
          required_product?:
            | Database["public"]["Enums"]["membership_product"]
            | null
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          company: string | null
          created_at: string
          dedupe_key: string | null
          discovered_by:
            | Database["public"]["Enums"]["lead_discovered_by"]
            | null
          email: string
          enrichment_json: Json | null
          first_name: string
          icp_fit_reason: Json | null
          icp_fit_score: number | null
          id: string
          industry: string | null
          last_name: string | null
          location: string | null
          notes: string | null
          owner_user_id: string | null
          phone: string | null
          source_confidence_score: number | null
          source_detail: string | null
          source_priority_weight: number | null
          source_type: Database["public"]["Enums"]["lead_source_type"]
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          dedupe_key?: string | null
          discovered_by?:
            | Database["public"]["Enums"]["lead_discovered_by"]
            | null
          email: string
          enrichment_json?: Json | null
          first_name: string
          icp_fit_reason?: Json | null
          icp_fit_score?: number | null
          id?: string
          industry?: string | null
          last_name?: string | null
          location?: string | null
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
          source_confidence_score?: number | null
          source_detail?: string | null
          source_priority_weight?: number | null
          source_type: Database["public"]["Enums"]["lead_source_type"]
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          dedupe_key?: string | null
          discovered_by?:
            | Database["public"]["Enums"]["lead_discovered_by"]
            | null
          email?: string
          enrichment_json?: Json | null
          first_name?: string
          icp_fit_reason?: Json | null
          icp_fit_score?: number | null
          id?: string
          industry?: string | null
          last_name?: string | null
          location?: string | null
          notes?: string | null
          owner_user_id?: string | null
          phone?: string | null
          source_confidence_score?: number | null
          source_detail?: string | null
          source_priority_weight?: number | null
          source_type?: Database["public"]["Enums"]["lead_source_type"]
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_user_id: string
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          lead_id: string | null
          member_id: string | null
          meta: Json | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at: string
        }
        Insert: {
          assigned_user_id: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          member_id?: string | null
          meta?: Json | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          member_id?: string | null
          meta?: Json | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_avatar_models: {
        Row: {
          avatar_json: Json
          confidence_score: number | null
          created_at: string | null
          id: string
          model_date: string
          sample_size: number | null
          version: number
        }
        Insert: {
          avatar_json: Json
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          model_date: string
          sample_size?: number | null
          version: number
        }
        Update: {
          avatar_json?: Json
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          model_date?: string
          sample_size?: number | null
          version?: number
        }
        Relationships: []
      }
      drive_sync_runs: {
        Row: {
          errors: Json
          finished_at: string | null
          id: string
          inserted: number
          rows_total: number
          sheet_id: string
          skipped_dedupe: number
          skipped_invalid: number
          started_at: string
          status: string
          triggered_by: string
        }
        Insert: {
          errors?: Json
          finished_at?: string | null
          id?: string
          inserted?: number
          rows_total?: number
          sheet_id: string
          skipped_dedupe?: number
          skipped_invalid?: number
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Update: {
          errors?: Json
          finished_at?: string | null
          id?: string
          inserted?: number
          rows_total?: number
          sheet_id?: string
          skipped_dedupe?: number
          skipped_invalid?: number
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Relationships: []
      }
      drive_sync_state: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          last_error: string | null
          last_status: string | null
          last_sync_at: string | null
          sheet_id: string
          sheet_title: string | null
          tab_name: string
          total_inserted: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_error?: string | null
          last_status?: string | null
          last_sync_at?: string | null
          sheet_id: string
          sheet_title?: string | null
          tab_name?: string
          total_inserted?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_error?: string | null
          last_status?: string | null
          last_sync_at?: string | null
          sheet_id?: string
          sheet_title?: string | null
          tab_name?: string
          total_inserted?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_broadcasts: {
        Row: {
          body_html: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          scheduled_at: string | null
          segment_filter: Json | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          scheduled_at?: string | null
          segment_filter?: Json | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          scheduled_at?: string | null
          segment_filter?: Json | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_broadcasts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_broadcasts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_consents: {
        Row: {
          confirmation_token: string
          confirmed_at: string | null
          confirmed_ip: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          metadata: Json | null
          purpose: string
          requested_ip: string | null
          requested_user_agent: string | null
          revoked_at: string | null
          revoked_ip: string | null
          source: string | null
          status: Database["public"]["Enums"]["email_consent_status"]
          updated_at: string
        }
        Insert: {
          confirmation_token?: string
          confirmed_at?: string | null
          confirmed_ip?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          purpose?: string
          requested_ip?: string | null
          requested_user_agent?: string | null
          revoked_at?: string | null
          revoked_ip?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["email_consent_status"]
          updated_at?: string
        }
        Update: {
          confirmation_token?: string
          confirmed_at?: string | null
          confirmed_ip?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          metadata?: Json | null
          purpose?: string
          requested_ip?: string | null
          requested_user_agent?: string | null
          revoked_at?: string | null
          revoked_ip?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["email_consent_status"]
          updated_at?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message_id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message_id: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "email_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          body_html: string
          broadcast_id: string | null
          created_at: string
          enrollment_id: string | null
          id: string
          lead_id: string
          message_type: string
          resend_message_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
        }
        Insert: {
          body_html: string
          broadcast_id?: string | null
          created_at?: string
          enrollment_id?: string | null
          id?: string
          lead_id: string
          message_type?: string
          resend_message_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
        }
        Update: {
          body_html?: string
          broadcast_id?: string | null
          created_at?: string
          enrollment_id?: string | null
          id?: string
          lead_id?: string
          message_type?: string
          resend_message_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "lead_sequence_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string
          metadata: Json | null
          recipient_email: string
          status: string
          subject: string | null
          template_name: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id: string
          metadata?: Json | null
          recipient_email: string
          status?: string
          subject?: string | null
          template_name?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string
          metadata?: Json | null
          recipient_email?: string
          status?: string
          subject?: string | null
          template_name?: string | null
        }
        Relationships: []
      }
      email_sequence_steps: {
        Row: {
          conditions: Json | null
          created_at: string
          delay_minutes: number | null
          id: string
          sequence_id: string
          step_order: number
          subject_override: string | null
          template_id: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          delay_minutes?: number | null
          id?: string
          sequence_id: string
          step_order: number
          subject_override?: string | null
          template_id?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          delay_minutes?: number | null
          id?: string
          sequence_id?: string
          step_order?: number
          subject_override?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sequence_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_preset: boolean | null
          name: string
          status: string
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_preset?: boolean | null
          name: string
          status?: string
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_preset?: boolean | null
          name?: string
          status?: string
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          created_at: string
          created_by: string
          id: string
          name: string
          subject: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body_html?: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body_html?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "live_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_topic_submissions: {
        Row: {
          description: string | null
          event_id: string
          id: string
          status: string
          submitted_at: string
          topic: string
          user_id: string
          votes: number | null
        }
        Insert: {
          description?: string | null
          event_id: string
          id?: string
          status?: string
          submitted_at?: string
          topic: string
          user_id: string
          votes?: number | null
        }
        Update: {
          description?: string | null
          event_id?: string
          id?: string
          status?: string
          submitted_at?: string
          topic?: string
          user_id?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_topic_submissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "live_events"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          executed_at: string | null
          execution_result: Json | null
          id: string
          lead_id: string
          plan_json: Json
          status: string | null
          triggered_by: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          executed_at?: string | null
          execution_result?: Json | null
          id?: string
          lead_id: string
          plan_json?: Json
          status?: string | null
          triggered_by?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          executed_at?: string | null
          execution_result?: Json | null
          id?: string
          lead_id?: string
          plan_json?: Json
          status?: string | null
          triggered_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followup_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followup_plans_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_steps: {
        Row: {
          content_json: Json | null
          created_at: string | null
          executed_at: string | null
          id: string
          plan_id: string
          result_json: Json | null
          scheduled_at: string | null
          status: string | null
          step_order: number
          step_type: string
        }
        Insert: {
          content_json?: Json | null
          created_at?: string | null
          executed_at?: string | null
          id?: string
          plan_id: string
          result_json?: Json | null
          scheduled_at?: string | null
          status?: string | null
          step_order: number
          step_type: string
        }
        Update: {
          content_json?: Json | null
          created_at?: string | null
          executed_at?: string | null
          id?: string
          plan_id?: string
          result_json?: Json | null
          scheduled_at?: string | null
          status?: string | null
          step_order?: number
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "followup_steps_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "followup_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          goal_id: string
          id: string
          is_completed: boolean
          sort_order: number
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          goal_id: string
          id?: string
          is_completed?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          goal_id?: string
          id?: string
          is_completed?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress: {
        Row: {
          actual_amount_cents: number
          actual_value: number
          created_at: string | null
          goal_id: string
          id: string
          period_end: string
          period_start: string
          period_type: string
          updated_at: string | null
        }
        Insert: {
          actual_amount_cents?: number
          actual_value?: number
          created_at?: string | null
          goal_id: string
          id?: string
          period_end: string
          period_start: string
          period_type: string
          updated_at?: string | null
        }
        Update: {
          actual_amount_cents?: number
          actual_value?: number
          created_at?: string | null
          goal_id?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          created_by: string | null
          current_amount: number
          description: string | null
          end_date: string
          horizon: string
          id: string
          reward_amount_cents: number | null
          reward_image_url: string | null
          reward_title: string | null
          start_date: string
          status: string
          target_amount: number
          target_amount_cents: number | null
          target_value: number | null
          team_id: string | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_amount?: number
          description?: string | null
          end_date: string
          horizon?: string
          id?: string
          reward_amount_cents?: number | null
          reward_image_url?: string | null
          reward_title?: string | null
          start_date?: string
          status?: string
          target_amount?: number
          target_amount_cents?: number | null
          target_value?: number | null
          team_id?: string | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_amount?: number
          description?: string | null
          end_date?: string
          horizon?: string
          id?: string
          reward_amount_cents?: number | null
          reward_image_url?: string | null
          reward_title?: string | null
          start_date?: string
          status?: string
          target_amount?: number
          target_amount_cents?: number | null
          target_value?: number | null
          team_id?: string | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_accounts: {
        Row: {
          access_token: string
          created_at: string
          email: string
          google_sub: string | null
          id: string
          is_active: boolean
          last_sync_at: string | null
          last_sync_error: string | null
          primary_calendar_id: string
          profile_id: string
          refresh_token: string
          scope: string | null
          sync_token: string | null
          token_expires_at: string | null
          updated_at: string
          watch_channel_id: string | null
          watch_expires_at: string | null
          watch_resource_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          email: string
          google_sub?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_error?: string | null
          primary_calendar_id?: string
          profile_id: string
          refresh_token: string
          scope?: string | null
          sync_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          watch_channel_id?: string | null
          watch_expires_at?: string | null
          watch_resource_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          email?: string
          google_sub?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_error?: string | null
          primary_calendar_id?: string
          profile_id?: string
          refresh_token?: string
          scope?: string | null
          sync_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          watch_channel_id?: string | null
          watch_expires_at?: string | null
          watch_resource_id?: string | null
        }
        Relationships: []
      }
      google_calendar_sync_logs: {
        Row: {
          calendar_id: string | null
          cancelled_count: number
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          meta: Json | null
          profile_id: string
          status: string
          synced_count: number
          triggered_by: string | null
          window_from: string | null
          window_to: string | null
        }
        Insert: {
          calendar_id?: string | null
          cancelled_count?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          meta?: Json | null
          profile_id: string
          status?: string
          synced_count?: number
          triggered_by?: string | null
          window_from?: string | null
          window_to?: string | null
        }
        Update: {
          calendar_id?: string | null
          cancelled_count?: number
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          meta?: Json | null
          profile_id?: string
          status?: string
          synced_count?: number
          triggered_by?: string | null
          window_from?: string | null
          window_to?: string | null
        }
        Relationships: []
      }
      incoming_mail: {
        Row: {
          ai_summary: string | null
          category: string | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          lead_id: string | null
          meta: Json | null
          ocr_text: string | null
          priority: string
          processed_at: string | null
          received_date: string | null
          sender: string | null
          source_item_id: string | null
          source_provider: string | null
          status: string
          subject: string | null
          task_id: string | null
          ticket_id: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          ai_summary?: string | null
          category?: string | null
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          lead_id?: string | null
          meta?: Json | null
          ocr_text?: string | null
          priority?: string
          processed_at?: string | null
          received_date?: string | null
          sender?: string | null
          source_item_id?: string | null
          source_provider?: string | null
          status?: string
          subject?: string | null
          task_id?: string | null
          ticket_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          ai_summary?: string | null
          category?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          lead_id?: string | null
          meta?: Json | null
          ocr_text?: string | null
          priority?: string
          processed_at?: string | null
          received_date?: string | null
          sender?: string | null
          source_item_id?: string | null
          source_provider?: string | null
          status?: string
          subject?: string | null
          task_id?: string | null
          ticket_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incoming_mail_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incoming_mail_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "crm_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incoming_mail_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incoming_mail_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          email_error: string | null
          email_provider: string | null
          email_sent: boolean
          expires_at: string
          id: string
          invite_link: string | null
          invited_by: string
          last_attempt_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          token: string
          tried_providers: string[]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          email_error?: string | null
          email_provider?: string | null
          email_sent?: boolean
          expires_at?: string
          id?: string
          invite_link?: string | null
          invited_by: string
          last_attempt_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          tried_providers?: string[]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          email_error?: string | null
          email_provider?: string | null
          email_sent?: boolean
          expires_at?: string
          id?: string
          invite_link?: string | null
          invited_by?: string
          last_attempt_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          tried_providers?: string[]
        }
        Relationships: []
      }
      invoices: {
        Row: {
          bereich: string | null
          betrag_brutto: number
          betrag_netto: number
          bezahlt_am: string | null
          cash_flag: boolean | null
          created_at: string
          crm_id: string | null
          datum: string | null
          erstattungsfaehig: boolean | null
          faelligkeit: string | null
          gegenpartei: string | null
          id: string
          invoice_id: string | null
          kostenstelle: string | null
          objekt: string | null
          status: string
          ust: number
        }
        Insert: {
          bereich?: string | null
          betrag_brutto?: number
          betrag_netto?: number
          bezahlt_am?: string | null
          cash_flag?: boolean | null
          created_at?: string
          crm_id?: string | null
          datum?: string | null
          erstattungsfaehig?: boolean | null
          faelligkeit?: string | null
          gegenpartei?: string | null
          id?: string
          invoice_id?: string | null
          kostenstelle?: string | null
          objekt?: string | null
          status?: string
          ust?: number
        }
        Update: {
          bereich?: string | null
          betrag_brutto?: number
          betrag_netto?: number
          bezahlt_am?: string | null
          cash_flag?: boolean | null
          created_at?: string
          crm_id?: string | null
          datum?: string | null
          erstattungsfaehig?: boolean | null
          faelligkeit?: string | null
          gegenpartei?: string | null
          id?: string
          invoice_id?: string | null
          kostenstelle?: string | null
          objekt?: string | null
          status?: string
          ust?: number
        }
        Relationships: []
      }
      lead_sequence_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number | null
          enrolled_at: string | null
          id: string
          lead_id: string
          sequence_id: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          lead_id: string
          sequence_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          lead_id?: string
          sequence_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sequence_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          branche: string | null
          created_at: string
          email: string
          entscheider_status: string | null
          entscheidungsstil: string | null
          id: string
          is_qualified: boolean | null
          jahresumsatz: string | null
          message: string | null
          motivation: string | null
          name: string
          phone: string | null
          qualification_score: number | null
          ref_code: string | null
          source: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          branche?: string | null
          created_at?: string
          email: string
          entscheider_status?: string | null
          entscheidungsstil?: string | null
          id?: string
          is_qualified?: boolean | null
          jahresumsatz?: string | null
          message?: string | null
          motivation?: string | null
          name: string
          phone?: string | null
          qualification_score?: number | null
          ref_code?: string | null
          source: string
          status?: string
        }
        Update: {
          assigned_to?: string | null
          branche?: string | null
          created_at?: string
          email?: string
          entscheider_status?: string | null
          entscheidungsstil?: string | null
          id?: string
          is_qualified?: boolean | null
          jahresumsatz?: string | null
          message?: string | null
          motivation?: string | null
          name?: string
          phone?: string | null
          qualification_score?: number | null
          ref_code?: string | null
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          last_position_seconds: number | null
          last_seen_at: string | null
          lesson_id: string
          member_id: string
          progress_percent: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["progress_status"] | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          last_seen_at?: string | null
          lesson_id: string
          member_id: string
          progress_percent?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["progress_status"] | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_position_seconds?: number | null
          last_seen_at?: string | null
          lesson_id?: string
          member_id?: string
          progress_percent?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["progress_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_ref: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          lesson_type: Database["public"]["Enums"]["lesson_type"] | null
          meta: Json | null
          module_id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          content_ref?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          lesson_type?: Database["public"]["Enums"]["lesson_type"] | null
          meta?: Json | null
          module_id: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          content_ref?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          lesson_type?: Database["public"]["Enums"]["lesson_type"] | null
          meta?: Json | null
          module_id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          event_date: string
          external_calendar_id: string | null
          external_event_id: string | null
          id: string
          is_recurring: boolean | null
          last_synced_at: string | null
          max_participants: number | null
          meeting_provider: string | null
          meeting_url: string | null
          recurrence_rule: string | null
          status: string
          sync_source: string | null
          sync_status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          event_date: string
          external_calendar_id?: string | null
          external_event_id?: string | null
          id?: string
          is_recurring?: boolean | null
          last_synced_at?: string | null
          max_participants?: number | null
          meeting_provider?: string | null
          meeting_url?: string | null
          recurrence_rule?: string | null
          status?: string
          sync_source?: string | null
          sync_status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          event_date?: string
          external_calendar_id?: string | null
          external_event_id?: string | null
          id?: string
          is_recurring?: boolean | null
          last_synced_at?: string | null
          max_participants?: number | null
          meeting_provider?: string | null
          meeting_url?: string | null
          recurrence_rule?: string | null
          status?: string
          sync_source?: string | null
          sync_status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mail_sync_settings: {
        Row: {
          created_at: string
          id: string
          last_sync_at: string | null
          last_sync_count: number | null
          last_sync_error: string | null
          meta: Json | null
          processed_folder_path: string
          provider: string
          sort_by_category: boolean
          source_folder_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          last_sync_count?: number | null
          last_sync_error?: string | null
          meta?: Json | null
          processed_folder_path?: string
          provider?: string
          sort_by_category?: boolean
          source_folder_path?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          last_sync_count?: number | null
          last_sync_error?: string | null
          meta?: Json | null
          processed_folder_path?: string
          provider?: string
          sort_by_category?: boolean
          source_folder_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      member_kpis: {
        Row: {
          activity_score: number | null
          created_at: string | null
          id: string
          kpi_json: Json | null
          lesson_completion_rate: number | null
          member_id: string
          notes: string | null
          revenue_value: number | null
          risk_score: number | null
          tasks_completion_rate: number | null
          week_start_date: string
        }
        Insert: {
          activity_score?: number | null
          created_at?: string | null
          id?: string
          kpi_json?: Json | null
          lesson_completion_rate?: number | null
          member_id: string
          notes?: string | null
          revenue_value?: number | null
          risk_score?: number | null
          tasks_completion_rate?: number | null
          week_start_date: string
        }
        Update: {
          activity_score?: number | null
          created_at?: string | null
          id?: string
          kpi_json?: Json | null
          lesson_completion_rate?: number | null
          member_id?: string
          notes?: string | null
          revenue_value?: number | null
          risk_score?: number | null
          tasks_completion_rate?: number | null
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_kpis_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string | null
          id: string
          last_active_at: string | null
          lead_id: string | null
          meta: Json | null
          onboarded_at: string | null
          profile_id: string | null
          status: Database["public"]["Enums"]["member_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_active_at?: string | null
          lead_id?: string | null
          meta?: Json | null
          onboarded_at?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_active_at?: string | null
          lead_id?: string | null
          meta?: Json | null
          onboarded_at?: string | null
          profile_id?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          is_trial: boolean | null
          member_id: string
          order_id: string | null
          product: Database["public"]["Enums"]["membership_product"]
          starts_at: string | null
          status: Database["public"]["Enums"]["membership_status"] | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_trial?: boolean | null
          member_id: string
          order_id?: string | null
          product: Database["public"]["Enums"]["membership_product"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["membership_status"] | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_trial?: boolean | null
          member_id?: string
          order_id?: string | null
          product?: Database["public"]["Enums"]["membership_product"]
          starts_at?: string | null
          status?: Database["public"]["Enums"]["membership_status"] | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offer_drafts: {
        Row: {
          adjustments_subtotal_cents: number | null
          ai_model: string | null
          ai_tokens_used: number | null
          approved_at: string | null
          approved_by: string | null
          benefit_analysis: Json
          catalog_subtotal_cents: number | null
          client_inputs_required: Json
          converted_offer_id: string | null
          created_at: string
          custom_subtotal_cents: number | null
          generated_at: string
          id: string
          internal_cost_analysis: Json
          is_custom_solution: boolean
          lead_id: string
          margin_percent: number | null
          matched_catalog_product_ids: Json
          min_price_cents: number | null
          price_breakdown: Json | null
          pricing_strategy: Json
          problem_analysis: Json
          qa_checks: Json
          qa_passed: boolean
          required_connectors: Json
          reviewer_notes: string | null
          solution_concept: Json
          status: string
          suggested_price_cents: number | null
          updated_at: string
          zoom_summary_id: string | null
        }
        Insert: {
          adjustments_subtotal_cents?: number | null
          ai_model?: string | null
          ai_tokens_used?: number | null
          approved_at?: string | null
          approved_by?: string | null
          benefit_analysis?: Json
          catalog_subtotal_cents?: number | null
          client_inputs_required?: Json
          converted_offer_id?: string | null
          created_at?: string
          custom_subtotal_cents?: number | null
          generated_at?: string
          id?: string
          internal_cost_analysis?: Json
          is_custom_solution?: boolean
          lead_id: string
          margin_percent?: number | null
          matched_catalog_product_ids?: Json
          min_price_cents?: number | null
          price_breakdown?: Json | null
          pricing_strategy?: Json
          problem_analysis?: Json
          qa_checks?: Json
          qa_passed?: boolean
          required_connectors?: Json
          reviewer_notes?: string | null
          solution_concept?: Json
          status?: string
          suggested_price_cents?: number | null
          updated_at?: string
          zoom_summary_id?: string | null
        }
        Update: {
          adjustments_subtotal_cents?: number | null
          ai_model?: string | null
          ai_tokens_used?: number | null
          approved_at?: string | null
          approved_by?: string | null
          benefit_analysis?: Json
          catalog_subtotal_cents?: number | null
          client_inputs_required?: Json
          converted_offer_id?: string | null
          created_at?: string
          custom_subtotal_cents?: number | null
          generated_at?: string
          id?: string
          internal_cost_analysis?: Json
          is_custom_solution?: boolean
          lead_id?: string
          margin_percent?: number | null
          matched_catalog_product_ids?: Json
          min_price_cents?: number | null
          price_breakdown?: Json | null
          pricing_strategy?: Json
          problem_analysis?: Json
          qa_checks?: Json
          qa_passed?: boolean
          required_connectors?: Json
          reviewer_notes?: string | null
          solution_concept?: Json
          status?: string
          suggested_price_cents?: number | null
          updated_at?: string
          zoom_summary_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_drafts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_drafts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_drafts_zoom_summary_id_fkey"
            columns: ["zoom_summary_id"]
            isOneToOne: false
            referencedRelation: "zoom_summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          analysis_id: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          lead_id: string
          notes: string | null
          offer_json: Json
          payment_unlocked: boolean
          payment_unlocked_at: string | null
          payment_unlocked_by: string | null
          public_token: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["offer_status"]
          updated_at: string
          version: number
          viewed_at: string | null
        }
        Insert: {
          analysis_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          lead_id: string
          notes?: string | null
          offer_json?: Json
          payment_unlocked?: boolean
          payment_unlocked_at?: string | null
          payment_unlocked_by?: string | null
          public_token?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
          version?: number
          viewed_at?: string | null
        }
        Update: {
          analysis_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          lead_id?: string
          notes?: string | null
          offer_json?: Json
          payment_unlocked?: boolean
          payment_unlocked_at?: string | null
          payment_unlocked_by?: string | null
          public_token?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
          version?: number
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_payment_unlocked_by_fkey"
            columns: ["payment_unlocked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      open_items: {
        Row: {
          betrag: number
          created_at: string
          faelligkeit: string | null
          gegenpartei: string | null
          id: string
          kostenstelle: string | null
          objekt: string | null
          quelle: string | null
          risiko: string | null
          status: string | null
          tage_ueberfaellig: number | null
          typ: string | null
        }
        Insert: {
          betrag?: number
          created_at?: string
          faelligkeit?: string | null
          gegenpartei?: string | null
          id?: string
          kostenstelle?: string | null
          objekt?: string | null
          quelle?: string | null
          risiko?: string | null
          status?: string | null
          tage_ueberfaellig?: number | null
          typ?: string | null
        }
        Update: {
          betrag?: number
          created_at?: string
          faelligkeit?: string | null
          gegenpartei?: string | null
          id?: string
          kostenstelle?: string | null
          objekt?: string | null
          quelle?: string | null
          risiko?: string | null
          status?: string | null
          tage_ueberfaellig?: number | null
          typ?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          error_message: string | null
          failed_at: string | null
          id: string
          lead_id: string
          member_id: string | null
          metadata: Json | null
          offer_id: string | null
          paid_at: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id: string | null
          provider_order_id: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          lead_id: string
          member_id?: string | null
          metadata?: Json | null
          offer_id?: string | null
          paid_at?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id?: string | null
          provider_order_id?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          lead_id?: string
          member_id?: string | null
          metadata?: Json | null
          offer_id?: string | null
          paid_at?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id?: string | null
          provider_order_id?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_zoom_matches: {
        Row: {
          created_at: string
          id: string
          participants: Json
          reason: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolved_lead_id: string | null
          status: string
          suggested_lead_ids: Json
          zoom_summary_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          participants?: Json
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_lead_id?: string | null
          status?: string
          suggested_lead_ids?: Json
          zoom_summary_id: string
        }
        Update: {
          created_at?: string
          id?: string
          participants?: Json
          reason?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_lead_id?: string | null
          status?: string
          suggested_lead_ids?: Json
          zoom_summary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_zoom_matches_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_zoom_matches_resolved_lead_id_fkey"
            columns: ["resolved_lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_zoom_matches_zoom_summary_id_fkey"
            columns: ["zoom_summary_id"]
            isOneToOne: false
            referencedRelation: "zoom_summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_items: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          pipeline_priority_score: number | null
          purchase_readiness: number | null
          stage: Database["public"]["Enums"]["pipeline_stage"] | null
          stage_updated_at: string | null
          updated_at: string
          urgency: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          pipeline_priority_score?: number | null
          purchase_readiness?: number | null
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          stage_updated_at?: string | null
          updated_at?: string
          urgency?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          pipeline_priority_score?: number | null
          purchase_readiness?: number | null
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          stage_updated_at?: string | null
          updated_at?: string
          urgency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_items_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      product_pattern_suggestions: {
        Row: {
          description: string
          example_draft_ids: Json
          first_seen_at: string
          id: string
          last_seen_at: string
          occurrence_count: number
          pattern_signature: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          suggested_price_range: Json | null
          suggested_product_name: string | null
        }
        Insert: {
          description: string
          example_draft_ids?: Json
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          occurrence_count?: number
          pattern_signature: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_price_range?: Json | null
          suggested_product_name?: string | null
        }
        Update: {
          description?: string
          example_draft_ids?: Json
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          occurrence_count?: number
          pattern_signature?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          suggested_price_range?: Json | null
          suggested_product_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_pattern_suggestions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_to: string | null
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          industry: string | null
          last_name: string | null
          live_call_used_at: string | null
          phone: string | null
          primary_goal: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_cancel_at: string | null
          subscription_current_period_end: string | null
          subscription_status: string
          team_id: string | null
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          last_name?: string | null
          live_call_used_at?: string | null
          phone?: string | null
          primary_goal?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at?: string | null
          subscription_current_period_end?: string | null
          subscription_status?: string
          team_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          last_name?: string | null
          live_call_used_at?: string | null
          phone?: string | null
          primary_goal?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at?: string | null
          subscription_current_period_end?: string | null
          subscription_status?: string
          team_id?: string | null
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          is_customizable: boolean | null
          min_tier: string
          prompt_text: string
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_customizable?: boolean | null
          min_tier?: string
          prompt_text: string
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_customizable?: boolean | null
          min_tier?: string
          prompt_text?: string
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "prompt_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          affiliate_id: string
          clicked_at: string
          converted_at: string | null
          customer_email: string | null
          customer_user_id: string | null
          id: string
          ip_hash: string | null
          landing_path: string | null
          lead_id: string | null
          meta: Json | null
          referral_code: string
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          clicked_at?: string
          converted_at?: string | null
          customer_email?: string | null
          customer_user_id?: string | null
          id?: string
          ip_hash?: string | null
          landing_path?: string | null
          lead_id?: string | null
          meta?: Json | null
          referral_code: string
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          clicked_at?: string
          converted_at?: string | null
          customer_email?: string | null
          customer_user_id?: string | null
          id?: string
          ip_hash?: string | null
          landing_path?: string | null
          lead_id?: string | null
          meta?: Json | null
          referral_code?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_summary: {
        Row: {
          bereich: string | null
          created_at: string
          delta: number | null
          id: string
          ist_umsatz: number
          monat: string
          objekt: string | null
          plan_umsatz: number | null
          quelle: string | null
        }
        Insert: {
          bereich?: string | null
          created_at?: string
          delta?: number | null
          id?: string
          ist_umsatz?: number
          monat: string
          objekt?: string | null
          plan_umsatz?: number | null
          quelle?: string | null
        }
        Update: {
          bereich?: string | null
          created_at?: string
          delta?: number | null
          id?: string
          ist_umsatz?: number
          monat?: string
          objekt?: string | null
          plan_umsatz?: number | null
          quelle?: string | null
        }
        Relationships: []
      }
      slot_bookings: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          google_calendar_id: string | null
          google_event_id: string | null
          id: string
          lead_id: string | null
          meta: Json | null
          notification_sent_at: string | null
          profile_id: string
          slot_id: string
          status: Database["public"]["Enums"]["booking_status"]
          topic: string | null
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          meta?: Json | null
          notification_sent_at?: string | null
          profile_id: string
          slot_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          topic?: string | null
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          meta?: Json | null
          notification_sent_at?: string | null
          profile_id?: string
          slot_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slot_bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_classification_rules: {
        Row: {
          applies_to_source: string
          category: Database["public"]["Enums"]["slot_category"]
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          keywords: string[]
          name: string
          priority: number
          updated_at: string
        }
        Insert: {
          applies_to_source?: string
          category: Database["public"]["Enums"]["slot_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          name: string
          priority?: number
          updated_at?: string
        }
        Update: {
          applies_to_source?: string
          category?: Database["public"]["Enums"]["slot_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          name?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_library_items: {
        Row: {
          content: string | null
          created_at: string
          created_by: string
          id: string
          industry: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by: string
          id?: string
          industry?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string
          id?: string
          industry?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_library_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          assets: Json | null
          assigned_to: string | null
          caption: string | null
          content_type: string
          created_at: string
          created_by: string
          hook: string | null
          id: string
          metrics: Json | null
          notes: string | null
          platform: string
          scheduled_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assets?: Json | null
          assigned_to?: string | null
          caption?: string | null
          content_type: string
          created_at?: string
          created_by: string
          hook?: string | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          platform: string
          scheduled_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assets?: Json | null
          assigned_to?: string | null
          caption?: string | null
          content_type?: string
          created_at?: string
          created_by?: string
          hook?: string | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          platform?: string
          scheduled_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_strategy_settings: {
        Row: {
          content_pillars: Json | null
          created_at: string
          id: string
          kpi_targets: Json | null
          posting_frequency: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_pillars?: Json | null
          created_at?: string
          id?: string
          kpi_targets?: Json | null
          posting_frequency?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_pillars?: Json | null
          created_at?: string
          id?: string
          kpi_targets?: Json | null
          posting_frequency?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_strategy_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          ai_summary: string | null
          assigned_to: string | null
          body: string | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          email_message_id: string | null
          id: string
          internal_notes: string | null
          lead_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          sender_email: string | null
          sender_name: string | null
          source: Database["public"]["Enums"]["ticket_source"]
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          assigned_to?: string | null
          body?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          email_message_id?: string | null
          id?: string
          internal_notes?: string | null
          lead_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          sender_email?: string | null
          sender_name?: string | null
          source?: Database["public"]["Enums"]["ticket_source"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          assigned_to?: string | null
          body?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          email_message_id?: string | null
          id?: string
          internal_notes?: string | null
          lead_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          sender_email?: string | null
          sender_name?: string | null
          source?: Database["public"]["Enums"]["ticket_source"]
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_errors: {
        Row: {
          entity: string | null
          error_message: string | null
          id: string
          node_name: string | null
          raw_payload: Json | null
          timestamp: string
          workflow: string | null
        }
        Insert: {
          entity?: string | null
          error_message?: string | null
          id?: string
          node_name?: string | null
          raw_payload?: Json | null
          timestamp?: string
          workflow?: string | null
        }
        Update: {
          entity?: string | null
          error_message?: string | null
          id?: string
          node_name?: string | null
          raw_payload?: Json | null
          timestamp?: string
          workflow?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          entity: string | null
          id: string
          message: string | null
          records_processed: number | null
          status: string | null
          timestamp: string
          workflow: string | null
        }
        Insert: {
          entity?: string | null
          id?: string
          message?: string | null
          records_processed?: number | null
          status?: string | null
          timestamp?: string
          workflow?: string | null
        }
        Update: {
          entity?: string | null
          id?: string
          message?: string | null
          records_processed?: number | null
          status?: string | null
          timestamp?: string
          workflow?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          min_tier: string
          name: string
          sort_order: number | null
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          min_tier?: string
          name: string
          sort_order?: number | null
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          min_tier?: string
          name?: string
          sort_order?: number | null
          url?: string | null
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          call_id: string
          confidence_score: number | null
          created_at: string
          error_message: string | null
          id: string
          language: string | null
          provider: string | null
          segments: Json | null
          status: Database["public"]["Enums"]["transcript_status"] | null
          text: string | null
          updated_at: string
          word_count: number | null
        }
        Insert: {
          call_id: string
          confidence_score?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string | null
          provider?: string | null
          segments?: Json | null
          status?: Database["public"]["Enums"]["transcript_status"] | null
          text?: string | null
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          call_id?: string
          confidence_score?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          language?: string | null
          provider?: string | null
          segments?: Json | null
          status?: Database["public"]["Enums"]["transcript_status"] | null
          text?: string | null
          updated_at?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          error: string | null
          event_type: string | null
          headers: Json | null
          id: string
          payload: Json
          processed_at: string | null
          received_at: string
          replayed_at: string | null
          replayed_count: number
          signature: string | null
          signature_valid: boolean | null
          source: string
          status: string
        }
        Insert: {
          error?: string | null
          event_type?: string | null
          headers?: Json | null
          id?: string
          payload: Json
          processed_at?: string | null
          received_at?: string
          replayed_at?: string | null
          replayed_count?: number
          signature?: string | null
          signature_valid?: boolean | null
          source: string
          status?: string
        }
        Update: {
          error?: string | null
          event_type?: string | null
          headers?: Json | null
          id?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          replayed_at?: string | null
          replayed_count?: number
          signature?: string | null
          signature_valid?: boolean | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      zoom_summaries: {
        Row: {
          ai_extraction: Json
          calendar_event_id: string | null
          calendar_source: string | null
          created_at: string
          followup_task_id: string | null
          from_address: string | null
          gmail_message_id: string
          gmail_thread_id: string | null
          id: string
          intent: string | null
          match_confidence: number | null
          matched_lead_id: string | null
          matched_via: string | null
          meeting_date: string | null
          meeting_topic: string | null
          offer_draft_id: string | null
          participants: Json
          processed_at: string
          raw_summary: string | null
          received_at: string | null
          subject: string | null
        }
        Insert: {
          ai_extraction?: Json
          calendar_event_id?: string | null
          calendar_source?: string | null
          created_at?: string
          followup_task_id?: string | null
          from_address?: string | null
          gmail_message_id: string
          gmail_thread_id?: string | null
          id?: string
          intent?: string | null
          match_confidence?: number | null
          matched_lead_id?: string | null
          matched_via?: string | null
          meeting_date?: string | null
          meeting_topic?: string | null
          offer_draft_id?: string | null
          participants?: Json
          processed_at?: string
          raw_summary?: string | null
          received_at?: string | null
          subject?: string | null
        }
        Update: {
          ai_extraction?: Json
          calendar_event_id?: string | null
          calendar_source?: string | null
          created_at?: string
          followup_task_id?: string | null
          from_address?: string | null
          gmail_message_id?: string
          gmail_thread_id?: string | null
          id?: string
          intent?: string | null
          match_confidence?: number | null
          matched_lead_id?: string | null
          matched_via?: string | null
          meeting_date?: string | null
          meeting_topic?: string | null
          offer_draft_id?: string | null
          participants?: Json
          processed_at?: string
          raw_summary?: string | null
          received_at?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zoom_summaries_matched_lead_id_fkey"
            columns: ["matched_lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      zoom_summary_runs: {
        Row: {
          created_at: string
          emails_scanned: number
          errors: Json
          finished_at: string | null
          followups_created: number
          id: string
          leads_matched: number
          offers_drafted: number
          pending_matches: number
          started_at: string
          status: string
          summaries_parsed: number
          triggered_by: string
        }
        Insert: {
          created_at?: string
          emails_scanned?: number
          errors?: Json
          finished_at?: string | null
          followups_created?: number
          id?: string
          leads_matched?: number
          offers_drafted?: number
          pending_matches?: number
          started_at?: string
          status?: string
          summaries_parsed?: number
          triggered_by?: string
        }
        Update: {
          created_at?: string
          emails_scanned?: number
          errors?: Json
          finished_at?: string | null
          followups_created?: number
          id?: string
          leads_matched?: number
          offers_drafted?: number
          pending_matches?: number
          started_at?: string
          status?: string
          summaries_parsed?: number
          triggered_by?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_current_customer_avatar: {
        Row: {
          avatar_json: Json | null
          confidence_score: number | null
          created_at: string | null
          id: string | null
          model_date: string | null
          sample_size: number | null
          version: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_offer_by_token: {
        Args: { _signature_data: string; _signer_name: string; _token: string }
        Returns: string
      }
      book_slot_public: {
        Args: {
          _contact_email: string
          _contact_name: string
          _contact_phone?: string
          _lead_id?: string
          _slot_id: string
          _topic?: string
        }
        Returns: string
      }
      calculate_pipeline_priority: {
        Args: {
          _icp_score: number
          _purchase_readiness: number
          _source_weight: number
          _urgency: number
        }
        Returns: number
      }
      can_book_live_call: { Args: { _user_id: string }; Returns: boolean }
      can_view_profile: { Args: { _profile_id: string }; Returns: boolean }
      classify_slot_event: {
        Args: { _description: string; _source: string; _title: string }
        Returns: {
          category: Database["public"]["Enums"]["slot_category"]
          rule_id: string
        }[]
      }
      generate_referral_code: { Args: never; Returns: string }
      get_customers: {
        Args: never
        Returns: {
          assigned_staff_name: string
          assigned_to: string
          company: string
          created_at: string
          email: string
          first_name: string
          full_name: string
          id: string
          last_name: string
          phone: string
        }[]
      }
      get_live_call_eligibility: {
        Args: { _user_id?: string }
        Returns: {
          can_book: boolean
          live_call_used_at: string
          reason: string
          subscription_status: string
          trial_ends_at: string
          used_event_date: string
          used_event_id: string
          used_event_title: string
        }[]
      }
      get_offer_by_public_token: {
        Args: { _token: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          lead_company: string
          lead_email: string
          lead_first_name: string
          lead_id: string
          lead_last_name: string
          offer_json: Json
          payment_unlocked: boolean
          public_token: string
          status: string
          updated_at: string
          viewed_at: string
        }[]
      }
      get_team_member_ids: { Args: { _user_id: string }; Returns: string[] }
      get_trial_kpis: {
        Args: never
        Returns: {
          active_subs: number
          active_trials: number
          conversion_rate: number
          conversions_30d: number
          expired_trials: number
          total_trials: number
          trial_call_used: number
        }[]
      }
      get_trial_overview: {
        Args: never
        Returns: {
          converted_at: string
          created_at: string
          email: string
          full_name: string
          live_call_event_date: string
          live_call_event_id: string
          live_call_event_title: string
          live_call_used_at: string
          profile_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_status: string
          trial_days_remaining: number
          trial_ends_at: string
          trial_started_at: string
          user_id: string
        }[]
      }
      get_upgrade_funnel_stats: {
        Args: { _from?: string; _to?: string }
        Returns: {
          click_to_upgrade_rate: number
          cta_clicks: number
          module_type: string
          required_tier: string
          upgrades: number
          view_to_click_rate: number
          view_to_upgrade_rate: number
          views: number
        }[]
      }
      get_user_profile_id: { Args: { _user_id: string }; Returns: string }
      get_user_team_id: { Args: { _user_id: string }; Returns: string }
      has_email_consent: {
        Args: { _email: string; _purpose?: string }
        Returns: boolean
      }
      has_min_role: {
        Args: {
          _min_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_member: { Args: { _user_id: string }; Returns: boolean }
      list_free_slots_public: {
        Args: { _from?: string; _profile_id: string; _to?: string }
        Returns: {
          end_at: string
          id: string
          start_at: string
        }[]
      }
      mark_offer_viewed: { Args: { _token: string }; Returns: undefined }
      match_lead_by_phone: {
        Args: { search_suffix: string }
        Returns: {
          first_name: string
          id: string
          last_name: string
          owner_user_id: string
          phone: string
          status: string
        }[]
      }
      notify_user: {
        Args: {
          p_body?: string
          p_link?: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      release_slot_for_google_event: {
        Args: {
          _google_event_id: string
          _profile_id: string
          _reason?: string
        }
        Returns: {
          booking_id: string
          contact_email: string
          contact_name: string
          slot_id: string
          start_at: string
        }[]
      }
      start_member_trial: {
        Args: never
        Returns: {
          live_call_used_at: string
          subscription_status: string
          trial_ends_at: string
          trial_started_at: string
        }[]
      }
      sync_stripe_subscription: {
        Args: {
          _cancel_at: string
          _current_period_end: string
          _email: string
          _status: string
          _stripe_customer_id: string
          _stripe_subscription_id: string
          _trial_end: string
          _trial_start: string
        }
        Returns: string
      }
      update_slot_for_google_event: {
        Args: {
          _google_event_id: string
          _new_end: string
          _new_start: string
          _profile_id: string
          _summary?: string
        }
        Returns: string
      }
    }
    Enums: {
      activity_type: "anruf" | "email" | "meeting" | "notiz" | "fehler"
      affiliate_status: "pending" | "onboarding" | "active" | "disabled"
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "kunde"
        | "mitarbeiter"
        | "teamleiter"
        | "geschaeftsfuehrung"
        | "vertriebspartner"
        | "gruppenbetreuer"
        | "member_basic"
        | "member_starter"
        | "member_pro"
        | "guest"
      application_status: "pending" | "reviewing" | "accepted" | "rejected"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "cancelled_by_organizer"
        | "no_show"
        | "completed"
      call_provider: "zoom" | "twilio" | "sipgate" | "manual"
      call_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "recording_ready"
        | "transcribed"
        | "analyzed"
        | "failed"
      call_type: "phone" | "zoom" | "teams" | "other"
      catalog_category: "automation" | "education"
      catalog_mode: "one_time" | "subscription"
      commission_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "cancelled"
      course_price_tier: "freebie" | "low_budget" | "mid_range" | "high_class"
      email_consent_status: "pending" | "confirmed" | "revoked"
      lead_discovered_by: "daily_ai" | "manual" | "inbound"
      lead_source_type:
        | "inbound_paid"
        | "inbound_organic"
        | "referral"
        | "outbound_ai"
        | "outbound_manual"
        | "partner"
      lead_status: "new" | "qualified" | "unqualified"
      learning_path_level: "starter" | "fortgeschritten" | "experte"
      lesson_type: "video" | "task" | "worksheet" | "quiz"
      member_status: "active" | "paused" | "churned"
      membership_product: "basic" | "starter" | "growth" | "premium"
      membership_status: "active" | "inactive" | "pending"
      offer_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "sent"
        | "viewed"
        | "expired"
        | "accepted"
        | "paid"
      order_status: "pending" | "paid" | "failed" | "refunded" | "cancelled"
      payment_provider: "stripe" | "copecart" | "bank_transfer" | "manual"
      pipeline_stage:
        | "new_lead"
        | "setter_call_scheduled"
        | "setter_call_done"
        | "analysis_ready"
        | "offer_draft"
        | "offer_sent"
        | "payment_unlocked"
        | "won"
        | "lost"
      progress_status: "not_started" | "in_progress" | "completed"
      slot_category:
        | "discovery_call"
        | "closing"
        | "strategy"
        | "demo"
        | "onboarding"
        | "internal"
        | "personal"
        | "blocker"
        | "other"
      slot_source: "manual" | "google_busy" | "recurring"
      slot_status: "free" | "held" | "booked" | "blocked" | "cancelled"
      structogram_type: "red" | "green" | "blue" | "mixed" | "unknown"
      task_status: "open" | "done" | "blocked"
      task_type: "call" | "followup" | "review_offer" | "intervention"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_source: "email" | "mail" | "manual" | "phone"
      ticket_status: "open" | "in_progress" | "waiting" | "closed"
      transcript_status: "pending" | "processing" | "done" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: ["anruf", "email", "meeting", "notiz", "fehler"],
      affiliate_status: ["pending", "onboarding", "active", "disabled"],
      app_role: [
        "admin",
        "moderator",
        "user",
        "kunde",
        "mitarbeiter",
        "teamleiter",
        "geschaeftsfuehrung",
        "vertriebspartner",
        "gruppenbetreuer",
        "member_basic",
        "member_starter",
        "member_pro",
        "guest",
      ],
      application_status: ["pending", "reviewing", "accepted", "rejected"],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "cancelled_by_organizer",
        "no_show",
        "completed",
      ],
      call_provider: ["zoom", "twilio", "sipgate", "manual"],
      call_status: [
        "scheduled",
        "in_progress",
        "completed",
        "recording_ready",
        "transcribed",
        "analyzed",
        "failed",
      ],
      call_type: ["phone", "zoom", "teams", "other"],
      catalog_category: ["automation", "education"],
      catalog_mode: ["one_time", "subscription"],
      commission_status: ["pending", "paid", "failed", "refunded", "cancelled"],
      course_price_tier: ["freebie", "low_budget", "mid_range", "high_class"],
      email_consent_status: ["pending", "confirmed", "revoked"],
      lead_discovered_by: ["daily_ai", "manual", "inbound"],
      lead_source_type: [
        "inbound_paid",
        "inbound_organic",
        "referral",
        "outbound_ai",
        "outbound_manual",
        "partner",
      ],
      lead_status: ["new", "qualified", "unqualified"],
      learning_path_level: ["starter", "fortgeschritten", "experte"],
      lesson_type: ["video", "task", "worksheet", "quiz"],
      member_status: ["active", "paused", "churned"],
      membership_product: ["basic", "starter", "growth", "premium"],
      membership_status: ["active", "inactive", "pending"],
      offer_status: [
        "draft",
        "pending_review",
        "approved",
        "sent",
        "viewed",
        "expired",
        "accepted",
        "paid",
      ],
      order_status: ["pending", "paid", "failed", "refunded", "cancelled"],
      payment_provider: ["stripe", "copecart", "bank_transfer", "manual"],
      pipeline_stage: [
        "new_lead",
        "setter_call_scheduled",
        "setter_call_done",
        "analysis_ready",
        "offer_draft",
        "offer_sent",
        "payment_unlocked",
        "won",
        "lost",
      ],
      progress_status: ["not_started", "in_progress", "completed"],
      slot_category: [
        "discovery_call",
        "closing",
        "strategy",
        "demo",
        "onboarding",
        "internal",
        "personal",
        "blocker",
        "other",
      ],
      slot_source: ["manual", "google_busy", "recurring"],
      slot_status: ["free", "held", "booked", "blocked", "cancelled"],
      structogram_type: ["red", "green", "blue", "mixed", "unknown"],
      task_status: ["open", "done", "blocked"],
      task_type: ["call", "followup", "review_offer", "intervention"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_source: ["email", "mail", "manual", "phone"],
      ticket_status: ["open", "in_progress", "waiting", "closed"],
      transcript_status: ["pending", "processing", "done", "failed"],
    },
  },
} as const
