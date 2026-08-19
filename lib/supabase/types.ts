export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ClaimStatus = "unclaimed" | "pending_verification" | "claimed" | "rejected"

export interface Database {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string
          name: string
          slug: string
          licence_region: string | null
          street_address: string | null
          locality: string | null
          region: string | null
          postcode: string
          telephone: string | null
          contact_email: string | null
          website: string | null
          latitude: number | null
          longitude: number | null
          claim_status: ClaimStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          licence_region?: string | null
          street_address?: string | null
          locality?: string | null
          region?: string | null
          postcode: string
          telephone?: string | null
          contact_email?: string | null
          website?: string | null
          latitude?: number | null
          longitude?: number | null
          claim_status?: ClaimStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          licence_region?: string | null
          street_address?: string | null
          locality?: string | null
          region?: string | null
          postcode?: string
          telephone?: string | null
          contact_email?: string | null
          website?: string | null
          latitude?: number | null
          longitude?: number | null
          claim_status?: ClaimStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          type: "owner" | "operator"
          org_id: string | null
          full_name: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          type: "owner" | "operator"
          org_id?: string | null
          full_name?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: "owner" | "operator"
          org_id?: string | null
          full_name?: string | null
          phone?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }
      capacity_settings: {
        Row: {
          id: string
          org_id: string
          max_dogs_total: number
          max_dogs_by_size: Json
          min_notice_days: number
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          max_dogs_total: number
          max_dogs_by_size?: Json
          min_notice_days?: number
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          max_dogs_total?: number
          max_dogs_by_size?: Json
          min_notice_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capacity_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }
      blackout_dates: {
        Row: {
          id: string
          org_id: string
          date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          date?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blackout_dates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }
      dogs: {
        Row: {
          id: string
          user_id: string
          org_id: string
          name: string
          breed: string
          size_category: string
          vaccination_expiry_date: string | null
          internal_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_id: string
          name: string
          breed: string
          size_category: string
          vaccination_expiry_date?: string | null
          internal_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          org_id?: string
          name?: string
          breed?: string
          size_category?: string
          vaccination_expiry_date?: string | null
          internal_notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dogs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dogs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      booking_requests: {
        Row: {
          id: string
          org_id: string
          dog_id: string
          user_id: string
          check_in_date: string
          check_out_date: string
          status: Database["public"]["Enums"]["booking_status"]
          availability_signal: Database["public"]["Enums"]["availability_signal"] | null
          capacity_snapshot: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          dog_id: string
          user_id: string
          check_in_date: string
          check_out_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          availability_signal?: Database["public"]["Enums"]["availability_signal"] | null
          capacity_snapshot?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          dog_id?: string
          user_id?: string
          check_in_date?: string
          check_out_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          availability_signal?: Database["public"]["Enums"]["availability_signal"] | null
          capacity_snapshot?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      internal_notes: {
        Row: {
          id: string
          org_id: string
          booking_request_id: string
          created_by: string | null
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          booking_request_id: string
          created_by?: string | null
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          booking_request_id?: string
          created_by?: string | null
          note?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability_signal: "space" | "nearly_full" | "full"
      booking_status: "new" | "needs-info" | "accepted" | "rejected"
    }
  }
}
