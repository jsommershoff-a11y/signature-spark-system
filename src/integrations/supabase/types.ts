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
      analytics_events: {
        Row: {
          consent_level: string | null
          created_at: string
          event_category: string | null
          event_label: string | null
          event_name: string
          id: string
          page_path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          consent_level?: string | null
          created_at?: string
          event_category?: string | null
          event_label?: string | null
          event_name: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          consent_level?: string | null
          created_at?: string
          event_category?: string | null
          event_label?: string | null
          event_name?: string
          id?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          application_id: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          title: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          application_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          application_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          contact_label: string[] | null
          created_at: string
          email: string
          estimated_value: number | null
          id: string
          landing_page: string | null
          message: string
          name: string
          newsletter_consent: boolean | null
          next_follow_up: string | null
          phone: string | null
          priority: string | null
          referrer: string | null
          service_type: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          contact_label?: string[] | null
          created_at?: string
          email: string
          estimated_value?: number | null
          id?: string
          landing_page?: string | null
          message: string
          name: string
          newsletter_consent?: boolean | null
          next_follow_up?: string | null
          phone?: string | null
          priority?: string | null
          referrer?: string | null
          service_type?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          contact_label?: string[] | null
          created_at?: string
          email?: string
          estimated_value?: number | null
          id?: string
          landing_page?: string | null
          message?: string
          name?: string
          newsletter_consent?: boolean | null
          next_follow_up?: string | null
          phone?: string | null
          priority?: string | null
          referrer?: string | null
          service_type?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      crew_members: {
        Row: {
          created_at: string | null
          crew_id: string
          employee_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          crew_id: string
          employee_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          crew_id?: string
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          created_at: string | null
          default_vehicle_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_vehicle_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_vehicle_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crews_default_vehicle_id_fkey"
            columns: ["default_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crews_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          paid_at: string | null
          pdf_url: string | null
          project_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          tax_amount: number | null
          title: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          paid_at?: string | null
          pdf_url?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          tax_amount?: number | null
          title: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_at?: string | null
          pdf_url?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          tax_amount?: number | null
          title?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "customer_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          avatar_updated_at: string | null
          avatar_url: string | null
          company: string | null
          created_at: string | null
          customer_category: string | null
          email: string
          full_name: string | null
          id: string
          is_approved: boolean | null
          lead_source: string | null
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_updated_at?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          customer_category?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          lead_source?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avatar_updated_at?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          customer_category?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          lead_source?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_projects: {
        Row: {
          actual_end_date: string | null
          ai_status_summary: string | null
          billing_hourly_rate: number | null
          created_at: string | null
          description: string | null
          estimated_end_date: string | null
          id: string
          progress_percent: number | null
          quote_id: string | null
          revenue_type: string
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_end_date?: string | null
          ai_status_summary?: string | null
          billing_hourly_rate?: number | null
          created_at?: string | null
          description?: string | null
          estimated_end_date?: string | null
          id?: string
          progress_percent?: number | null
          quote_id?: string | null
          revenue_type?: string
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_end_date?: string | null
          ai_status_summary?: string | null
          billing_hourly_rate?: number | null
          created_at?: string | null
          description?: string | null
          estimated_end_date?: string | null
          id?: string
          progress_percent?: number | null
          quote_id?: string | null
          revenue_type?: string
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_projects_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "customer_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_quotes: {
        Row: {
          commissioned_at: string | null
          confirmed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          is_risk_project: boolean
          payment_secured: boolean
          payment_security_method: string | null
          pdf_url: string | null
          quote_number: string
          risk_acknowledged_at: string | null
          risk_note: string | null
          risk_surcharge_amount: number
          risk_surcharge_percent: number
          secured_at: string | null
          sent_at: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          title: string
          total_amount: number
          updated_at: string | null
          user_id: string
          valid_until: string | null
          visualization_id: string | null
        }
        Insert: {
          commissioned_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_risk_project?: boolean
          payment_secured?: boolean
          payment_security_method?: string | null
          pdf_url?: string | null
          quote_number: string
          risk_acknowledged_at?: string | null
          risk_note?: string | null
          risk_surcharge_amount?: number
          risk_surcharge_percent?: number
          secured_at?: string | null
          sent_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          title: string
          total_amount: number
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
          visualization_id?: string | null
        }
        Update: {
          commissioned_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_risk_project?: boolean
          payment_secured?: boolean
          payment_security_method?: string | null
          pdf_url?: string | null
          quote_number?: string
          risk_acknowledged_at?: string | null
          risk_note?: string | null
          risk_surcharge_amount?: number
          risk_surcharge_percent?: number
          secured_at?: string | null
          sent_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          title?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
          visualization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_quotes_visualization_id_fkey"
            columns: ["visualization_id"]
            isOneToOne: false
            referencedRelation: "customer_visualizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_visualizations: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          estimated_cost: number | null
          estimated_effort: string | null
          generated_image_url: string | null
          id: string
          original_image_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          estimated_cost?: number | null
          estimated_effort?: string | null
          generated_image_url?: string | null
          id?: string
          original_image_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          estimated_cost?: number | null
          estimated_effort?: string | null
          generated_image_url?: string | null
          id?: string
          original_image_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_plans: {
        Row: {
          approved_by: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          status: string
          team_lead_id: string | null
          updated_at: string | null
          weather_forecast: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          status?: string
          team_lead_id?: string | null
          updated_at?: string | null
          weather_forecast?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          status?: string
          team_lead_id?: string | null
          updated_at?: string | null
          weather_forecast?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_plans_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_ticket_employees: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_ticket_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_ticket_employees_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "dispatch_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_tickets: {
        Row: {
          attachments: Json | null
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          crew_id: string | null
          customer_reference: string | null
          description: string | null
          duration_estimate_minutes: number | null
          id: string
          internal_notes: string | null
          job_type: string | null
          location_address: string | null
          planned_date: string | null
          priority: string
          project_id: string | null
          status: string
          ticket_number: string
          time_window_end: string | null
          time_window_start: string | null
          title: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          attachments?: Json | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_id?: string | null
          customer_reference?: string | null
          description?: string | null
          duration_estimate_minutes?: number | null
          id?: string
          internal_notes?: string | null
          job_type?: string | null
          location_address?: string | null
          planned_date?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          ticket_number?: string
          time_window_end?: string | null
          time_window_start?: string | null
          title: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          attachments?: Json | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_id?: string | null
          customer_reference?: string | null
          description?: string | null
          duration_estimate_minutes?: number | null
          id?: string
          internal_notes?: string | null
          job_type?: string | null
          location_address?: string | null
          planned_date?: string | null
          priority?: string
          project_id?: string | null
          status?: string
          ticket_number?: string
          time_window_end?: string | null
          time_window_start?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_tickets_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "customer_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_tickets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          description: string | null
          id: string
          name: string
          subject: string
          template_key: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          body_html: string
          description?: string | null
          id?: string
          name: string
          subject: string
          template_key: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          body_html?: string
          description?: string | null
          id?: string
          name?: string
          subject?: string
          template_key?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      employee_personal_data: {
        Row: {
          address_city: string | null
          address_street: string | null
          bic: string | null
          birth_date: string | null
          birth_name: string | null
          birth_place: string | null
          child_allowance: number | null
          completed_at: string | null
          created_at: string | null
          declaration_accepted: boolean | null
          disabled: boolean | null
          education_level: string | null
          employee_id: string
          entry_date: string | null
          gender: string | null
          health_insurance: string | null
          health_insurance_number: string | null
          iban: string | null
          id: string
          is_fulltime: boolean | null
          job_title: string | null
          marital_status: string | null
          nationality: string | null
          personal_tax_rate: number | null
          personnel_number: string | null
          professional_qualification: string | null
          religion: string | null
          signature_date: string | null
          social_security_number: string | null
          tax_class: string | null
          tax_id: string | null
          updated_at: string | null
          vacation_days: number | null
          weekly_hours: number | null
        }
        Insert: {
          address_city?: string | null
          address_street?: string | null
          bic?: string | null
          birth_date?: string | null
          birth_name?: string | null
          birth_place?: string | null
          child_allowance?: number | null
          completed_at?: string | null
          created_at?: string | null
          declaration_accepted?: boolean | null
          disabled?: boolean | null
          education_level?: string | null
          employee_id: string
          entry_date?: string | null
          gender?: string | null
          health_insurance?: string | null
          health_insurance_number?: string | null
          iban?: string | null
          id?: string
          is_fulltime?: boolean | null
          job_title?: string | null
          marital_status?: string | null
          nationality?: string | null
          personal_tax_rate?: number | null
          personnel_number?: string | null
          professional_qualification?: string | null
          religion?: string | null
          signature_date?: string | null
          social_security_number?: string | null
          tax_class?: string | null
          tax_id?: string | null
          updated_at?: string | null
          vacation_days?: number | null
          weekly_hours?: number | null
        }
        Update: {
          address_city?: string | null
          address_street?: string | null
          bic?: string | null
          birth_date?: string | null
          birth_name?: string | null
          birth_place?: string | null
          child_allowance?: number | null
          completed_at?: string | null
          created_at?: string | null
          declaration_accepted?: boolean | null
          disabled?: boolean | null
          education_level?: string | null
          employee_id?: string
          entry_date?: string | null
          gender?: string | null
          health_insurance?: string | null
          health_insurance_number?: string | null
          iban?: string | null
          id?: string
          is_fulltime?: boolean | null
          job_title?: string | null
          marital_status?: string | null
          nationality?: string | null
          personal_tax_rate?: number | null
          personnel_number?: string | null
          professional_qualification?: string | null
          religion?: string | null
          signature_date?: string | null
          social_security_number?: string | null
          tax_class?: string | null
          tax_id?: string | null
          updated_at?: string | null
          vacation_days?: number | null
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_personal_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          avatar_updated_at: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          emergency_contact: string | null
          emergency_phone: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          monthly_salary: number | null
          name: string
          notes: string | null
          phone: string | null
          position: string
          skills: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_updated_at?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          monthly_salary?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string
          skills?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_updated_at?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          monthly_salary?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string
          skills?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feedback_suggestions: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          message: string
          portal: string
          rating: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          message: string
          portal: string
          rating?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          message?: string
          portal?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      google_reviews_cache: {
        Row: {
          expires_at: string
          fetched_at: string
          id: string
          place_id: string
          rating: number | null
          review_count: number | null
          reviews: Json | null
        }
        Insert: {
          expires_at?: string
          fetched_at?: string
          id?: string
          place_id: string
          rating?: number | null
          review_count?: number | null
          reviews?: Json | null
        }
        Update: {
          expires_at?: string
          fetched_at?: string
          id?: string
          place_id?: string
          rating?: number | null
          review_count?: number | null
          reviews?: Json | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          admin_notes: string | null
          ai_summary: string | null
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          interview_date: string | null
          last_reminder_at: string | null
          lead_score: number | null
          lead_score_details: Json | null
          message: string | null
          name: string
          phone: string | null
          portal_invited_at: string | null
          position: string
          privacy_accepted_at: string | null
          qualification_answers: Json | null
          qualification_status: string | null
          rating: number | null
          reminder_count: number
          resume_parsed: Json | null
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          trial_workday_enabled: boolean
          user_id: string | null
          whatsapp_optin: boolean
        }
        Insert: {
          admin_notes?: string | null
          ai_summary?: string | null
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          interview_date?: string | null
          last_reminder_at?: string | null
          lead_score?: number | null
          lead_score_details?: Json | null
          message?: string | null
          name: string
          phone?: string | null
          portal_invited_at?: string | null
          position: string
          privacy_accepted_at?: string | null
          qualification_answers?: Json | null
          qualification_status?: string | null
          rating?: number | null
          reminder_count?: number
          resume_parsed?: Json | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          trial_workday_enabled?: boolean
          user_id?: string | null
          whatsapp_optin?: boolean
        }
        Update: {
          admin_notes?: string | null
          ai_summary?: string | null
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          interview_date?: string | null
          last_reminder_at?: string | null
          lead_score?: number | null
          lead_score_details?: Json | null
          message?: string | null
          name?: string
          phone?: string | null
          portal_invited_at?: string | null
          position?: string
          privacy_accepted_at?: string | null
          qualification_answers?: Json | null
          qualification_status?: string | null
          rating?: number | null
          reminder_count?: number
          resume_parsed?: Json | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          trial_workday_enabled?: boolean
          user_id?: string | null
          whatsapp_optin?: boolean
        }
        Relationships: []
      }
      kpi_insights: {
        Row: {
          ai_generated: boolean | null
          confidence_score: number | null
          created_at: string | null
          description: string
          id: string
          insight_type: string
          kpi_id: string | null
          title: string
        }
        Insert: {
          ai_generated?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          kpi_id?: string | null
          title: string
        }
        Update: {
          ai_generated?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          kpi_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpi_insights_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_metrics: {
        Row: {
          calculated_at: string | null
          category: string | null
          current_value: number
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          period_end: string
          period_start: string
          previous_value: number | null
          target_value: number | null
        }
        Insert: {
          calculated_at?: string | null
          category?: string | null
          current_value: number
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          period_end: string
          period_start: string
          previous_value?: number | null
          target_value?: number | null
        }
        Update: {
          calculated_at?: string | null
          category?: string | null
          current_value?: number
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          period_end?: string
          period_start?: string
          previous_value?: number | null
          target_value?: number | null
        }
        Relationships: []
      }
      machines: {
        Row: {
          created_at: string | null
          expense_id: string | null
          id: string
          machine_type: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expense_id?: string | null
          id?: string
          machine_type?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expense_id?: string | null
          id?: string
          machine_type?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machines_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "project_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      material_order_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          material_name: string
          notes: string | null
          order_id: string
          quality_certificate_required: boolean
          quality_spec: string
          quantity: number
          sort_order: number
          unit: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          material_name: string
          notes?: string | null
          order_id: string
          quality_certificate_required?: boolean
          quality_spec?: string
          quantity?: number
          sort_order?: number
          unit?: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          material_name?: string
          notes?: string | null
          order_id?: string
          quality_certificate_required?: boolean
          quality_spec?: string
          quantity?: number
          sort_order?: number
          unit?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "material_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "material_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      material_orders: {
        Row: {
          checked_at: string | null
          checked_by: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          confirmed_by_supplier: boolean | null
          created_at: string
          delivered_at: string | null
          delivery_address: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          order_number: string
          ordered_at: string | null
          ordered_by: string | null
          project_id: string | null
          quality_check_notes: string | null
          quality_check_passed: boolean | null
          quality_requirements: string | null
          released_at: string | null
          released_by: string | null
          status: string
          supplier_confirmation_notes: string | null
          supplier_id: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          checked_at?: string | null
          checked_by?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          confirmed_by_supplier?: boolean | null
          created_at?: string
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          ordered_at?: string | null
          ordered_by?: string | null
          project_id?: string | null
          quality_check_notes?: string | null
          quality_check_passed?: boolean | null
          quality_requirements?: string | null
          released_at?: string | null
          released_by?: string | null
          status?: string
          supplier_confirmation_notes?: string | null
          supplier_id: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          checked_at?: string | null
          checked_by?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          confirmed_by_supplier?: boolean | null
          created_at?: string
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          ordered_at?: string | null
          ordered_by?: string | null
          project_id?: string | null
          quality_check_notes?: string | null
          quality_check_passed?: boolean | null
          quality_requirements?: string | null
          released_at?: string | null
          released_by?: string | null
          status?: string
          supplier_confirmation_notes?: string | null
          supplier_id?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "customer_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_kpi"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "material_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string | null
          source: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          event_key: string
          event_label: string
          id: string
          is_enabled: boolean
          recipients: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_key: string
          event_label: string
          id?: string
          is_enabled?: boolean
          recipients?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_key?: string
          event_label?: string
          id?: string
          is_enabled?: boolean
          recipients?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      project_expenses: {
        Row: {
          add_to_inventory: boolean | null
          amount: number
          approved_by: string | null
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          machine_id: string | null
          project_id: string | null
          quantity: number | null
          receipt_url: string | null
          status: string | null
          submitted_by: string | null
          supplier: string | null
          ticket_id: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          add_to_inventory?: boolean | null
          amount: number
          approved_by?: string | null
          category?: string
          created_at?: string | null
          date?: string
          description: string
          id?: string
          machine_id?: string | null
          project_id?: string | null
          quantity?: number | null
          receipt_url?: string | null
          status?: string | null
          submitted_by?: string | null
          supplier?: string | null
          ticket_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          add_to_inventory?: boolean | null
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          machine_id?: string | null
          project_id?: string | null
          quantity?: number | null
          receipt_url?: string | null
          status?: string | null
          submitted_by?: string | null
          supplier?: string | null
          ticket_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_expenses_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "customer_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_expenses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "dispatch_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_expenses_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          hours_worked: number | null
          id: string
          photos: Json | null
          project_id: string
          title: string
          update_type: string | null
          work_date: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hours_worked?: number | null
          id?: string
          photos?: Json | null
          project_id: string
          title: string
          update_type?: string | null
          work_date: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          hours_worked?: number | null
          id?: string
          photos?: Json | null
          project_id?: string
          title?: string
          update_type?: string | null
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "customer_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device_info: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          device_info?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          device_info?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assignment_id: string | null
          break_minutes: number | null
          clock_in: string | null
          clock_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          notes: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assignment_id?: string | null
          break_minutes?: number | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assignment_id?: string | null
          break_minutes?: number | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "work_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "customer_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_workdays: {
        Row: {
          application_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          date: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          application_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_workdays_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          license_plate: string | null
          name: string
          notes: string | null
          seats_total: number
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate?: string | null
          name: string
          notes?: string | null
          seats_total?: number
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          license_plate?: string | null
          name?: string
          notes?: string | null
          seats_total?: number
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      work_assignments: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string | null
          created_by: string | null
          crew_id: string | null
          daily_plan_id: string | null
          date: string
          employee_id: string
          end_time: string | null
          id: string
          notes: string | null
          project_id: string | null
          start_time: string | null
          status: string
          ticket_id: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_id?: string | null
          daily_plan_id?: string | null
          date: string
          employee_id: string
          end_time?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          start_time?: string | null
          status?: string
          ticket_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string | null
          created_by?: string | null
          crew_id?: string | null
          daily_plan_id?: string | null
          date?: string
          employee_id?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          start_time?: string | null
          status?: string
          ticket_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_assignments_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_assignments_daily_plan_id_fkey"
            columns: ["daily_plan_id"]
            isOneToOne: false
            referencedRelation: "daily_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "customer_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_assignments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "dispatch_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      supplier_kpi: {
        Row: {
          avg_delivery_days: number | null
          complaint_rate: number | null
          completed_orders: number | null
          quality_failed: number | null
          quality_passed: number | null
          quality_rate: number | null
          supplier_id: string | null
          supplier_name: string | null
          total_orders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_id_by_email: { Args: { email_input: string }; Returns: string }
      get_user_roles_with_emails: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
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
      activity_type:
        | "note"
        | "call"
        | "email"
        | "meeting"
        | "quote"
        | "status_change"
        | "task"
        | "document"
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "team_lead"
        | "employee"
        | "applicant"
      application_status:
        | "new"
        | "reviewing"
        | "interview"
        | "trial"
        | "offer"
        | "hired"
        | "rejected"
        | "withdrawn"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
        | "archived"
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
      activity_type: [
        "note",
        "call",
        "email",
        "meeting",
        "quote",
        "status_change",
        "task",
        "document",
      ],
      app_role: [
        "admin",
        "moderator",
        "user",
        "team_lead",
        "employee",
        "applicant",
      ],
      application_status: [
        "new",
        "reviewing",
        "interview",
        "trial",
        "offer",
        "hired",
        "rejected",
        "withdrawn",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
        "archived",
      ],
    },
  },
} as const
