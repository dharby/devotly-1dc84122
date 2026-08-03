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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      devotional_highlights: {
        Row: {
          color: string
          created_at: string
          devotional_id: string
          id: string
          note: string | null
          section: string
          text: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          devotional_id: string
          id?: string
          note?: string | null
          section?: string
          text: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          devotional_id?: string
          id?: string
          note?: string | null
          section?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_highlights_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
      devotionals: {
        Row: {
          completed: boolean
          created_at: string
          declaration: string | null
          greek_latin_insights: string | null
          id: string
          prayer: string
          reflection: string
          saved: boolean
          scripture: string
          scripture_reference: string
          title: string
          tone: string
          topic: string
          translation: string
          translations: Json
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          declaration?: string | null
          greek_latin_insights?: string | null
          id?: string
          prayer?: string
          reflection?: string
          saved?: boolean
          scripture?: string
          scripture_reference?: string
          title: string
          tone?: string
          topic: string
          translation?: string
          translations?: Json
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          declaration?: string | null
          greek_latin_insights?: string | null
          id?: string
          prayer?: string
          reflection?: string
          saved?: boolean
          scripture?: string
          scripture_reference?: string
          title?: string
          tone?: string
          topic?: string
          translation?: string
          translations?: Json
          user_id?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      family_devotionals: {
        Row: {
          devotional_id: string
          family_id: string
          id: string
          message: string | null
          shared_at: string
          shared_by: string
        }
        Insert: {
          devotional_id: string
          family_id: string
          id?: string
          message?: string | null
          shared_at?: string
          shared_by: string
        }
        Update: {
          devotional_id?: string
          family_id?: string
          id?: string
          message?: string | null
          shared_at?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_devotionals_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_devotionals_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          display_name: string
          family_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          display_name?: string
          family_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          display_name?: string
          family_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      fasts: {
        Row: {
          checkins: string[]
          completed: boolean
          created_at: string
          duration_days: number
          id: string
          plan_id: string
          plan_name: string
          start_date: string
          user_id: string
        }
        Insert: {
          checkins?: string[]
          completed?: boolean
          created_at?: string
          duration_days: number
          id?: string
          plan_id: string
          plan_name: string
          start_date?: string
          user_id: string
        }
        Update: {
          checkins?: string[]
          completed?: boolean
          created_at?: string
          duration_days?: number
          id?: string
          plan_id?: string
          plan_name?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          body: string
          created_at: string
          folder: string
          id: string
          pinned: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          folder?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          folder?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sermons: {
        Row: {
          audience: string
          bookmarked: boolean
          completed: boolean
          content: Json
          created_at: string
          id: string
          notes: string | null
          saved: boolean
          style: string
          title: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string
          bookmarked?: boolean
          completed?: boolean
          content: Json
          created_at?: string
          id?: string
          notes?: string | null
          saved?: boolean
          style?: string
          title: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string
          bookmarked?: boolean
          completed?: boolean
          content?: Json
          created_at?: string
          id?: string
          notes?: string | null
          saved?: boolean
          style?: string
          title?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracker_days: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          devotional_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date: string
          devotional_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          devotional_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracker_days_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_family_member: {
        Args: { _family_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
