export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      kennels: {
        Row: {
          created_at: string
          contact_email: string
          id: string
          name: string
          notify_accepted: boolean
          notify_new_request: boolean
          notify_rejected: boolean
          phone: string | null
          postcode: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          contact_email: string
          id?: string
          name: string
          notify_accepted?: boolean
          notify_new_request?: boolean
          notify_rejected?: boolean
          phone?: string | null
          postcode: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          contact_email?: string
          id?: string
          name?: string
          notify_accepted?: boolean
          notify_new_request?: boolean
          notify_rejected?: boolean
          phone?: string | null
          postcode?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          created_at: string
          kennel_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          kennel_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          kennel_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_kennel_id_fkey"
            columns: ["kennel_id"]
            isOneToOne: false
            referencedRelation: "kennels"
            referencedColumns: ["id"]
          }
        ]
      }
      capacity_settings: {
        Row: {
          id: string
          kennel_id: string
          max_dogs_by_size: Json
          max_dogs_total: number
          min_notice_days: number
          updated_at: string
        }
        Insert: {
          id?: string
          kennel_id: string
          max_dogs_by_size?: Json
          max_dogs_total: number
          min_notice_days?: number
          updated_at?: string
        }
        Update: {
          id?: string
          kennel_id?: string
          max_dogs_by_size?: Json
          max_dogs_total?: number
          min_notice_days?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capacity_settings_kennel_id_fkey"
            columns: ["kennel_id"]
            isOneToOne: true
            referencedRelation: "kennels"
            referencedColumns: ["id"]
          }
        ]
      }
      blackout_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          kennel_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          kennel_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          kennel_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blackout_dates_kennel_id_fkey"
            columns: ["kennel_id"]
            isOneToOne: false
            referencedRelation: "kennels"
            referencedColumns: ["id"]
          }
        ]
      }
      owners: {
        Row: {
          created_at: string
          email: string
          id: string
          kennel_id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          kennel_id: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          kennel_id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owners_kennel_id_fkey"
            columns: ["kennel_id"]
            isOneToOne: false
            referencedRelation: "kennels"
            referencedColumns: ["id"]
          }
        ]
      }
      dogs: {
        Row: {
          breed: string
          created_at: string
          id: string
          internal_notes: string | null
          kennel_id: string
          name: string
          owner_id: string
          size_category: string
          vaccination_expiry_date: string | null
        }
        Insert: {
          breed: string
          created_at?: string
          id?: string
          internal_notes?: string | null
          kennel_id: string
          name: string
          owner_id: string
          size_category: string
          vaccination_expiry_date?: string | null
        }
        Update: {
          breed?: string
          created_at?: string
          id?: string
          internal_notes?: string | null
          kennel_id?: string
          name?: string
          owner_id?: string
          size_category?: string
          vaccination_expiry_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dogs_kennel_id_fkey"
            columns: ["kennel_id"]
            isOneToOne: false
            referencedRelation: "kennels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dogs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          }
        ]
      }
      booking_requests: {
        Row: {
          availability_signal: Database["public"]["Enums"]["availability_signal"] | null
          capacity_snapshot: Json | null
          check_in_date: string
          check_out_date: string
          contact_opt_in: boolean
          created_at: string
          dog_id: string
          id: string
          kennel_id: string
          notes: string | null
          owner_id: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          availability_signal?: Database["public"]["Enums"]["availability_signal"] | null
          capacity_snapshot?: Json | null
          check_in_date: string
          check_out_date: string
          contact_opt_in?: boolean
          created_at?: string
          dog_id: string
          id?: string
          kennel_id: string
          notes?: string | null
          owner_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          availability_signal?: Database["public"]["Enums"]["availability_signal"] | null
          capacity_snapshot?: Json | null
          check_in_date?: string
          check_out_date?: string
          contact_opt_in?: boolean
          created_at?: string
          dog_id?: string
          id?: string
          kennel_id?: string
          notes?: string | null
          owner_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
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
            foreignKeyName: "booking_requests_kennel_id_fkey"
            columns: ["kennel_id"]
            isOneToOne: false
            referencedRelation: "kennels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          }
        ]
      }
      internal_notes: {
        Row: {
          booking_request_id: string
          created_at: string
          created_by: string | null
          id: string
          kennel_id: string
          note: string
        }
        Insert: {
          booking_request_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          kennel_id: string
          note: string
        }
        Update: {
          booking_request_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          kennel_id?: string
          note?: string
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
            foreignKeyName: "internal_notes_kennel_id_fkey"
            columns: ["kennel_id"]
            isOneToOne: false
            referencedRelation: "kennels"
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
