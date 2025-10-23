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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          analysis_id: string | null
          id: number
          source: string | null
          used_at: string | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          id?: number
          source?: string | null
          used_at?: string | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          id?: number
          source?: string | null
          used_at?: string | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          id: string
          insights_json: Json
          model: string
          processing_time_sec: number | null
          score_apresentacao: number | null
          score_compromisso_pagamento: number | null
          score_conexao: number | null
          score_fechamento: number | null
          score_global: number | null
          score_objecoes: number | null
          score_spin_i: number | null
          score_spin_n: number | null
          score_spin_p: number | null
          score_spin_s: number | null
          tokens_used: number | null
          video_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          insights_json: Json
          model: string
          processing_time_sec?: number | null
          score_apresentacao?: number | null
          score_compromisso_pagamento?: number | null
          score_conexao?: number | null
          score_fechamento?: number | null
          score_global?: number | null
          score_objecoes?: number | null
          score_spin_i?: number | null
          score_spin_n?: number | null
          score_spin_p?: number | null
          score_spin_s?: number | null
          tokens_used?: number | null
          video_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          insights_json?: Json
          model?: string
          processing_time_sec?: number | null
          score_apresentacao?: number | null
          score_compromisso_pagamento?: number | null
          score_conexao?: number | null
          score_fechamento?: number | null
          score_global?: number | null
          score_objecoes?: number | null
          score_spin_i?: number | null
          score_spin_n?: number | null
          score_spin_p?: number | null
          score_spin_s?: number | null
          tokens_used?: number | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          duration_sec: number | null
          id: string
          operation: string
          provider: string
          request_metadata: Json | null
          tokens_used: number | null
          user_id: string
          video_id: string | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          duration_sec?: number | null
          id?: string
          operation: string
          provider: string
          request_metadata?: Json | null
          tokens_used?: number | null
          user_id: string
          video_id?: string | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          duration_sec?: number | null
          id?: string
          operation?: string
          provider?: string
          request_metadata?: Json | null
          tokens_used?: number | null
          user_id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_logs_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          job_title: string | null
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email: string
          id: string
          is_active?: boolean | null
          job_title?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          downloaded_count: number | null
          file_size_bytes: number | null
          id: string
          pdf_path: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          downloaded_count?: number | null
          file_size_bytes?: number | null
          id?: string
          pdf_path: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          downloaded_count?: number | null
          file_size_bytes?: number | null
          id?: string
          pdf_path?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      transcriptions: {
        Row: {
          confidence_avg: number | null
          cost_usd: number | null
          created_at: string | null
          duration_sec: number | null
          id: string
          language: string | null
          provider: string
          speakers_json: Json | null
          text: string
          video_id: string
          words_count: number | null
        }
        Insert: {
          confidence_avg?: number | null
          cost_usd?: number | null
          created_at?: string | null
          duration_sec?: number | null
          id?: string
          language?: string | null
          provider: string
          speakers_json?: Json | null
          text: string
          video_id: string
          words_count?: number | null
        }
        Update: {
          confidence_avg?: number | null
          cost_usd?: number | null
          created_at?: string | null
          duration_sec?: number | null
          id?: string
          language?: string | null
          provider?: string
          speakers_json?: Json | null
          text?: string
          video_id?: string
          words_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transcriptions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
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
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      video_fingerprints: {
        Row: {
          first_seen_at: string | null
          hash_audio: string | null
          hash_metadata: string | null
          id: string
          video_id: string
        }
        Insert: {
          first_seen_at?: string | null
          hash_audio?: string | null
          hash_metadata?: string | null
          id?: string
          video_id: string
        }
        Update: {
          first_seen_at?: string | null
          hash_audio?: string | null
          hash_metadata?: string | null
          id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_fingerprints_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          duration_sec: number | null
          error_message: string | null
          file_hash: string | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          mode: string
          source_url: string | null
          status: string | null
          storage_path: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_sec?: number | null
          error_message?: string | null
          file_hash?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          mode: string
          source_url?: string | null
          status?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_sec?: number | null
          error_message?: string | null
          file_hash?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          mode?: string
          source_url?: string | null
          status?: string | null
          storage_path?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_by_email: { Args: { user_email: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
