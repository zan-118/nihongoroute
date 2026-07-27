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
      cheatsheets: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          items: Json | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          items?: Json | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          items?: Json | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_users: Json | null
          user_id: string
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_users?: Json | null
          user_id: string
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_users?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_number: number | null
          slug: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_number?: number | null
          slug: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_number?: number | null
          slug?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      expressions: {
        Row: {
          common: boolean | null
          created_at: string | null
          id: string
          indonesia: Json | null
          jlpt_level: string | null
          meanings: Json | null
          misc: Json | null
          reading: string
          text: string
        }
        Insert: {
          common?: boolean | null
          created_at?: string | null
          id: string
          indonesia?: Json | null
          jlpt_level?: string | null
          meanings?: Json | null
          misc?: Json | null
          reading: string
          text: string
        }
        Update: {
          common?: boolean | null
          created_at?: string | null
          id?: string
          indonesia?: Json | null
          jlpt_level?: string | null
          meanings?: Json | null
          misc?: Json | null
          reading?: string
          text?: string
        }
        Relationships: []
      }
      grammar: {
        Row: {
          created_at: string
          examples: Json | null
          formation: string | null
          formation_furigana: string | null
          formation_romaji: string | null
          grammar_family: string | null
          id: string
          jlpt_level: string | null
          meaning: string
          notes: string | null
          order_number: number | null
          related_grammar: string[] | null
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          examples?: Json | null
          formation?: string | null
          formation_furigana?: string | null
          formation_romaji?: string | null
          grammar_family?: string | null
          id?: string
          jlpt_level?: string | null
          meaning: string
          notes?: string | null
          order_number?: number | null
          related_grammar?: string[] | null
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          examples?: Json | null
          formation?: string | null
          formation_furigana?: string | null
          formation_romaji?: string | null
          grammar_family?: string | null
          id?: string
          jlpt_level?: string | null
          meaning?: string
          notes?: string | null
          order_number?: number | null
          related_grammar?: string[] | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      jlpt_exam_template_questions: {
        Row: {
          position: number
          question_id: string
          section_order: number
          template_id: string
        }
        Insert: {
          position: number
          question_id: string
          section_order?: number
          template_id: string
        }
        Update: {
          position?: number
          question_id?: string
          section_order?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jlpt_exam_template_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "jlpt_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jlpt_exam_template_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "jlpt_exam_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      jlpt_exam_templates: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          generation_mode: string
          id: string
          is_published: boolean
          jlpt_level: string
          legacy_sanity_id: string | null
          passing_score: number
          quota_config: Json
          slug: string
          time_limit_minutes: number
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          generation_mode?: string
          id?: string
          is_published?: boolean
          jlpt_level: string
          legacy_sanity_id?: string | null
          passing_score?: number
          quota_config?: Json
          slug: string
          time_limit_minutes: number
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          generation_mode?: string
          id?: string
          is_published?: boolean
          jlpt_level?: string
          legacy_sanity_id?: string | null
          passing_score?: number
          quota_config?: Json
          slug?: string
          time_limit_minutes?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jlpt_exam_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      jlpt_passages: {
        Row: {
          audio_path: string | null
          content_html: string | null
          created_at: string
          id: string
          is_published: boolean
          jlpt_level: string
          mondai_number: number | null
          session_type: string
          source_label: string | null
          title: string | null
          transcript_html: string | null
          updated_at: string
          visual_path: string | null
        }
        Insert: {
          audio_path?: string | null
          content_html?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          jlpt_level: string
          mondai_number?: number | null
          session_type: string
          source_label?: string | null
          title?: string | null
          transcript_html?: string | null
          updated_at?: string
          visual_path?: string | null
        }
        Update: {
          audio_path?: string | null
          content_html?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          jlpt_level?: string
          mondai_number?: number | null
          session_type?: string
          source_label?: string | null
          title?: string | null
          transcript_html?: string | null
          updated_at?: string
          visual_path?: string | null
        }
        Relationships: []
      }
      jlpt_questions: {
        Row: {
          audio_path: string | null
          choices: Json
          correct_choice_index: number
          created_at: string
          difficulty: number | null
          explanation_html: string | null
          id: string
          is_published: boolean
          jlpt_level: string
          mondai_number: number
          passage_id: string | null
          prompt_html: string | null
          question_number: number | null
          session_type: string
          source_id: string | null
          source_reference: string | null
          source_type: string | null
          updated_at: string
          visual_path: string | null
        }
        Insert: {
          audio_path?: string | null
          choices: Json
          correct_choice_index: number
          created_at?: string
          difficulty?: number | null
          explanation_html?: string | null
          id?: string
          is_published?: boolean
          jlpt_level: string
          mondai_number: number
          passage_id?: string | null
          prompt_html?: string | null
          question_number?: number | null
          session_type: string
          source_id?: string | null
          source_reference?: string | null
          source_type?: string | null
          updated_at?: string
          visual_path?: string | null
        }
        Update: {
          audio_path?: string | null
          choices?: Json
          correct_choice_index?: number
          created_at?: string
          difficulty?: number | null
          explanation_html?: string | null
          id?: string
          is_published?: boolean
          jlpt_level?: string
          mondai_number?: number
          passage_id?: string | null
          prompt_html?: string | null
          question_number?: number | null
          session_type?: string
          source_id?: string | null
          source_reference?: string | null
          source_type?: string | null
          updated_at?: string
          visual_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jlpt_questions_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "jlpt_passages"
            referencedColumns: ["id"]
          },
        ]
      }
      kanji: {
        Row: {
          character: string
          created_at: string
          english: string
          examples: Json | null
          frequency_rank: number | null
          grade_level: string | null
          id: string
          jlpt_level: string | null
          kunyomi: string | null
          meaning: string | null
          mnemonics: Json | null
          onyomi: string | null
          radicals: Json | null
          romaji: string | null
          show_in_flashcard: boolean | null
          slug: string | null
          stroke_order_svg: string | null
        }
        Insert: {
          character: string
          created_at?: string
          english: string
          examples?: Json | null
          frequency_rank?: number | null
          grade_level?: string | null
          id?: string
          jlpt_level?: string | null
          kunyomi?: string | null
          meaning?: string | null
          mnemonics?: Json | null
          onyomi?: string | null
          radicals?: Json | null
          romaji?: string | null
          show_in_flashcard?: boolean | null
          slug?: string | null
          stroke_order_svg?: string | null
        }
        Update: {
          character?: string
          created_at?: string
          english?: string
          examples?: Json | null
          frequency_rank?: number | null
          grade_level?: string | null
          id?: string
          jlpt_level?: string | null
          kunyomi?: string | null
          meaning?: string | null
          mnemonics?: Json | null
          onyomi?: string | null
          radicals?: Json | null
          romaji?: string | null
          show_in_flashcard?: boolean | null
          slug?: string | null
          stroke_order_svg?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          audit_log: Json | null
          category_id: string | null
          confidence: Json | null
          content_blocks: Json | null
          created_at: string
          estimated_minutes: number | null
          generation_context: Json | null
          grammar_list: Json | null
          id: string
          is_premium: boolean | null
          is_published: boolean | null
          kanji_list: Json | null
          listening_list: Json | null
          order_number: number | null
          quizzes: Json | null
          reading_list: Json | null
          seo: Json | null
          slug: string
          status: string | null
          summary: string | null
          title: string
          vocab_list: Json | null
          warnings: Json | null
        }
        Insert: {
          audit_log?: Json | null
          category_id?: string | null
          confidence?: Json | null
          content_blocks?: Json | null
          created_at?: string
          estimated_minutes?: number | null
          generation_context?: Json | null
          grammar_list?: Json | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          kanji_list?: Json | null
          listening_list?: Json | null
          order_number?: number | null
          quizzes?: Json | null
          reading_list?: Json | null
          seo?: Json | null
          slug: string
          status?: string | null
          summary?: string | null
          title: string
          vocab_list?: Json | null
          warnings?: Json | null
        }
        Update: {
          audit_log?: Json | null
          category_id?: string | null
          confidence?: Json | null
          content_blocks?: Json | null
          created_at?: string
          estimated_minutes?: number | null
          generation_context?: Json | null
          grammar_list?: Json | null
          id?: string
          is_premium?: boolean | null
          is_published?: boolean | null
          kanji_list?: Json | null
          listening_list?: Json | null
          order_number?: number | null
          quizzes?: Json | null
          reading_list?: Json | null
          seo?: Json | null
          slug?: string
          status?: string | null
          summary?: string | null
          title?: string
          vocab_list?: Json | null
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          post_id: string | null
          read: boolean
          sender_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          post_id?: string | null
          read?: boolean
          sender_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          post_id?: string | null
          read?: boolean
          sender_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          inventory: Json
          last_study_date: string | null
          level: number
          settings: Json
          streak: number
          study_days: Json
          today_review_count: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          inventory?: Json
          last_study_date?: string | null
          level?: number
          settings?: Json
          streak?: number
          study_days?: Json
          today_review_count?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          inventory?: Json
          last_study_date?: string | null
          level?: number
          settings?: Json
          streak?: number
          study_days?: Json
          today_review_count?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      radicals: {
        Row: {
          character: string
          created_at: string | null
          id: string
          kangxi_number: number | null
          kanji_list: Json | null
          meaning: string | null
          stroke_count: number | null
        }
        Insert: {
          character: string
          created_at?: string | null
          id?: string
          kangxi_number?: number | null
          kanji_list?: Json | null
          meaning?: string | null
          stroke_count?: number | null
        }
        Update: {
          character?: string
          created_at?: string | null
          id?: string
          kangxi_number?: number | null
          kanji_list?: Json | null
          meaning?: string | null
          stroke_count?: number | null
        }
        Relationships: []
      }
      sentences: {
        Row: {
          created_at: string | null
          english: string | null
          furigana: string | null
          id: string
          indonesia: string | null
          japanese: string
          jlpt_level: string | null
        }
        Insert: {
          created_at?: string | null
          english?: string | null
          furigana?: string | null
          id: string
          indonesia?: string | null
          japanese: string
          jlpt_level?: string | null
        }
        Update: {
          created_at?: string | null
          english?: string | null
          furigana?: string | null
          id?: string
          indonesia?: string | null
          japanese?: string
          jlpt_level?: string | null
        }
        Relationships: []
      }
      supporters: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          message: string | null
          name: string
          source: string
          tier: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          message?: string | null
          name: string
          source: string
          tier?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          message?: string | null
          name?: string
          source?: string
          tier?: string | null
        }
        Relationships: []
      }
      tts_cache: {
        Row: {
          audio_url: string
          created_at: string
          id: string
          model_used: string | null
          rate: string
          text: string
          voice: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          id: string
          model_used?: string | null
          rate: string
          text: string
          voice: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          id?: string
          model_used?: string | null
          rate?: string
          text?: string
          voice?: string
        }
        Relationships: []
      }
      user_exam_answers: {
        Row: {
          answered_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          selected_choice_index: number | null
          session_id: string
        }
        Insert: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean
          question_id: string
          selected_choice_index?: number | null
          session_id: string
        }
        Update: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_choice_index?: number | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exam_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "jlpt_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exam_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_exam_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exam_sessions: {
        Row: {
          answers_snapshot: Json
          completed_at: string | null
          id: string
          jlpt_level: string
          payload_snapshot: Json
          question_order: string[]
          score_breakdown: Json | null
          started_at: string
          status: string
          template_id: string | null
          total_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers_snapshot?: Json
          completed_at?: string | null
          id?: string
          jlpt_level: string
          payload_snapshot: Json
          question_order?: string[]
          score_breakdown?: Json | null
          started_at?: string
          status?: string
          template_id?: string | null
          total_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers_snapshot?: Json
          completed_at?: string | null
          id?: string
          jlpt_level?: string
          payload_snapshot?: Json
          question_order?: string[]
          score_breakdown?: Json | null
          started_at?: string
          status?: string
          template_id?: string | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exam_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "jlpt_exam_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          created_at: string | null
          id: string
          message: string
          route: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          route?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          route?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_lessons: {
        Row: {
          completed_at: string
          is_completed: boolean
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          is_completed?: boolean
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          is_completed?: boolean
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_srs: {
        Row: {
          created_at: string
          custom_mnemonic: string | null
          ease_factor: number
          id: string
          interval: number
          next_review: string | null
          repetition: number
          status: string
          updated_at: string
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string
          custom_mnemonic?: string | null
          ease_factor?: number
          id?: string
          interval?: number
          next_review?: string | null
          repetition?: number
          status?: string
          updated_at?: string
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string
          custom_mnemonic?: string | null
          ease_factor?: number
          id?: string
          interval?: number
          next_review?: string | null
          repetition?: number
          status?: string
          updated_at?: string
          user_id?: string
          word_id?: string
        }
        Relationships: []
      }
      vocab: {
        Row: {
          antonyms: Json | null
          audio_url: string | null
          conjugations: Json | null
          created_at: string
          examples: Json | null
          furigana: string | null
          hinshi: Json | null
          id: string
          is_common: boolean | null
          jlpt_level: string | null
          meaning_id: string | null
          mnemonic: string | null
          pitch_accent: string | null
          related_kanji: Json | null
          romaji: string | null
          show_in_flashcard: boolean | null
          slug: string
          synonyms: Json | null
          transitivity: string | null
          usage_notes: string | null
          word: string
        }
        Insert: {
          antonyms?: Json | null
          audio_url?: string | null
          conjugations?: Json | null
          created_at?: string
          examples?: Json | null
          furigana?: string | null
          hinshi?: Json | null
          id?: string
          is_common?: boolean | null
          jlpt_level?: string | null
          meaning_id?: string | null
          mnemonic?: string | null
          pitch_accent?: string | null
          related_kanji?: Json | null
          romaji?: string | null
          show_in_flashcard?: boolean | null
          slug: string
          synonyms?: Json | null
          transitivity?: string | null
          usage_notes?: string | null
          word: string
        }
        Update: {
          antonyms?: Json | null
          audio_url?: string | null
          conjugations?: Json | null
          created_at?: string
          examples?: Json | null
          furigana?: string | null
          hinshi?: Json | null
          id?: string
          is_common?: boolean | null
          jlpt_level?: string | null
          meaning_id?: string | null
          mnemonic?: string | null
          pitch_accent?: string | null
          related_kanji?: Json | null
          romaji?: string | null
          show_in_flashcard?: boolean | null
          slug?: string
          synonyms?: Json | null
          transitivity?: string | null
          usage_notes?: string | null
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_formation: { Args: { val: string }; Returns: string }
      clean_seo_intro: { Args: { val: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      sync_user_progress:
        | {
            Args: {
              p_full_name: string
              p_inventory: Json
              p_last_study_date: string
              p_settings: Json
              p_srs_updates: Json
              p_streak: number
              p_study_days: Json
              p_today_review_count: number
              p_xp: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_full_name: string
              p_inventory: Json
              p_last_study_date: string
              p_lesson_updates: Json
              p_settings: Json
              p_srs_updates: Json
              p_streak: number
              p_study_days: Json
              p_today_review_count: number
              p_xp: number
            }
            Returns: Json
          }
      update_vocab_examples: {
        Args: { p_examples: Json; p_ids: string[] }
        Returns: undefined
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

