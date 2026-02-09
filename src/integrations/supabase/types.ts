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
          lead_id: string
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
          lead_id: string
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
          lead_id?: string
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
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
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
          name: string
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
          name?: string
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
        Relationships: []
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
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
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
          source: string
        }
        Insert: {
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
          source: string
        }
        Update: {
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
          source?: string
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
          last_name: string | null
          phone: string | null
          team_id: string | null
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
          last_name?: string | null
          phone?: string | null
          team_id?: string | null
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
          last_name?: string | null
          phone?: string | null
          team_id?: string | null
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
      calculate_pipeline_priority: {
        Args: {
          _icp_score: number
          _purchase_readiness: number
          _source_weight: number
          _urgency: number
        }
        Returns: number
      }
      can_view_profile: { Args: { _profile_id: string }; Returns: boolean }
      get_team_member_ids: { Args: { _user_id: string }; Returns: string[] }
      get_user_profile_id: { Args: { _user_id: string }; Returns: string }
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
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "kunde"
        | "mitarbeiter"
        | "teamleiter"
        | "geschaeftsfuehrung"
      application_status: "pending" | "reviewing" | "accepted" | "rejected"
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
      lead_discovered_by: "daily_ai" | "manual" | "inbound"
      lead_source_type:
        | "inbound_paid"
        | "inbound_organic"
        | "referral"
        | "outbound_ai"
        | "outbound_manual"
        | "partner"
      lead_status: "new" | "qualified" | "unqualified"
      lesson_type: "video" | "task" | "worksheet" | "quiz"
      member_status: "active" | "paused" | "churned"
      membership_product: "starter" | "growth" | "premium"
      membership_status: "active" | "inactive" | "pending"
      offer_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "sent"
        | "viewed"
        | "expired"
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
      structogram_type: "red" | "green" | "blue" | "mixed" | "unknown"
      task_status: "open" | "done" | "blocked"
      task_type: "call" | "followup" | "review_offer" | "intervention"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "kunde",
        "mitarbeiter",
        "teamleiter",
        "geschaeftsfuehrung",
      ],
      application_status: ["pending", "reviewing", "accepted", "rejected"],
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
      lesson_type: ["video", "task", "worksheet", "quiz"],
      member_status: ["active", "paused", "churned"],
      membership_product: ["starter", "growth", "premium"],
      membership_status: ["active", "inactive", "pending"],
      offer_status: [
        "draft",
        "pending_review",
        "approved",
        "sent",
        "viewed",
        "expired",
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
      structogram_type: ["red", "green", "blue", "mixed", "unknown"],
      task_status: ["open", "done", "blocked"],
      task_type: ["call", "followup", "review_offer", "intervention"],
      transcript_status: ["pending", "processing", "done", "failed"],
    },
  },
} as const
