export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      article: {
        Row: {
          abstract: string | null
          category: number | null
          content_html: string | null
          content_json: Json | null
          content_text: string | null
          cover: number | null
          created_at: string | null
          id: number
          is_draft: boolean | null
          is_featured: boolean | null
          is_premium: boolean | null
          is_top: boolean | null
          lang: number | null
          page_view: number | null
          published_at: string | null
          slug: string | null
          subtitle: string | null
          title: string | null
          topic: string[] | null
          updated_at: string | null
        }
        Insert: {
          abstract?: string | null
          category?: number | null
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          cover?: number | null
          created_at?: string | null
          id?: number
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_top?: boolean | null
          lang?: number | null
          page_view?: number | null
          published_at?: string | null
          slug?: string | null
          subtitle?: string | null
          title?: string | null
          topic?: string[] | null
          updated_at?: string | null
        }
        Update: {
          abstract?: string | null
          category?: number | null
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          cover?: number | null
          created_at?: string | null
          id?: number
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_top?: boolean | null
          lang?: number | null
          page_view?: number | null
          published_at?: string | null
          slug?: string | null
          subtitle?: string | null
          title?: string | null
          topic?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_cover_fkey"
            columns: ["cover"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_lang_fkey"
            columns: ["lang"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
      category: {
        Row: {
          cover: number | null
          created_at: string | null
          description: string | null
          id: number
          lang: number | null
          slug: string | null
          title: string | null
          type: Database["public"]["Enums"]["content"] | null
        }
        Insert: {
          cover?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          lang?: number | null
          slug?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["content"] | null
        }
        Update: {
          cover?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          lang?: number | null
          slug?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["content"] | null
        }
        Relationships: [
          {
            foreignKeyName: "category_cover_fkey"
            columns: ["cover"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_lang_fkey"
            columns: ["lang"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
      comment: {
        Row: {
          content_html: string | null
          content_json: Json | null
          content_text: string | null
          created_at: string | null
          id: number
          is_anonymous: boolean | null
          is_blocked: boolean | null
          is_public: boolean | null
          receive_notification: boolean | null
          reply_to: number | null
          to_article: number | null
          to_photo: number | null
          to_thought: number | null
          to_video: number | null
          toxic_score: number | null
          user_id: number | null
        }
        Insert: {
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          created_at?: string | null
          id?: number
          is_anonymous?: boolean | null
          is_blocked?: boolean | null
          is_public?: boolean | null
          receive_notification?: boolean | null
          reply_to?: number | null
          to_article?: number | null
          to_photo?: number | null
          to_thought?: number | null
          to_video?: number | null
          toxic_score?: number | null
          user_id?: number | null
        }
        Update: {
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          created_at?: string | null
          id?: number
          is_anonymous?: boolean | null
          is_blocked?: boolean | null
          is_public?: boolean | null
          receive_notification?: boolean | null
          reply_to?: number | null
          to_article?: number | null
          to_photo?: number | null
          to_thought?: number | null
          to_video?: number | null
          toxic_score?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_to_article_fkey"
            columns: ["to_article"]
            isOneToOne: false
            referencedRelation: "article"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_to_photo_fkey"
            columns: ["to_photo"]
            isOneToOne: false
            referencedRelation: "photo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_to_photo_fkey"
            columns: ["to_photo"]
            isOneToOne: false
            referencedRelation: "random_en_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_to_photo_fkey"
            columns: ["to_photo"]
            isOneToOne: false
            referencedRelation: "random_jp_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_to_photo_fkey"
            columns: ["to_photo"]
            isOneToOne: false
            referencedRelation: "random_zh_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_to_thought_fkey"
            columns: ["to_thought"]
            isOneToOne: false
            referencedRelation: "thought"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_to_video_fkey"
            columns: ["to_video"]
            isOneToOne: false
            referencedRelation: "video"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      image: {
        Row: {
          alt: string | null
          caption: string | null
          created_at: string | null
          date: string | null
          exif: Json | null
          file_name: string | null
          folder: string | null
          format: string | null
          height: number | null
          id: number
          location: string | null
          size: number | null
          storage_key: string
          taken_at: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          caption?: string | null
          created_at?: string | null
          date?: string | null
          exif?: Json | null
          file_name?: string | null
          folder?: string | null
          format?: string | null
          height?: number | null
          id?: number
          location?: string | null
          size?: number | null
          storage_key?: string
          taken_at?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          caption?: string | null
          created_at?: string | null
          date?: string | null
          exif?: Json | null
          file_name?: string | null
          folder?: string | null
          format?: string | null
          height?: number | null
          id?: number
          location?: string | null
          size?: number | null
          storage_key?: string
          taken_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      language: {
        Row: {
          id: number
          is_default: boolean | null
          lang: string | null
          locale: string | null
        }
        Insert: {
          id?: number
          is_default?: boolean | null
          lang?: string | null
          locale?: string | null
        }
        Update: {
          id?: number
          is_default?: boolean | null
          lang?: string | null
          locale?: string | null
        }
        Relationships: []
      }
      message: {
        Row: {
          contact_detail: string | null
          contact_type: string | null
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string | null
          name: string | null
          user_id: number
        }
        Insert: {
          contact_detail?: string | null
          contact_type?: string | null
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message?: string | null
          name?: string | null
          user_id: number
        }
        Update: {
          contact_detail?: string | null
          contact_type?: string | null
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message?: string | null
          name?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      photo: {
        Row: {
          abstract: string | null
          category: number | null
          content_html: string | null
          content_json: Json | null
          content_text: string | null
          cover: number | null
          created_at: string | null
          id: number
          is_draft: boolean | null
          is_featured: boolean | null
          is_top: boolean | null
          lang: number | null
          page_view: number | null
          published_at: string | null
          slug: string | null
          title: string | null
          topic: string[] | null
          updated_at: string | null
        }
        Insert: {
          abstract?: string | null
          category?: number | null
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          cover?: number | null
          created_at?: string | null
          id?: number
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_top?: boolean | null
          lang?: number | null
          page_view?: number | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
          topic?: string[] | null
          updated_at?: string | null
        }
        Update: {
          abstract?: string | null
          category?: number | null
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          cover?: number | null
          created_at?: string | null
          id?: number
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_top?: boolean | null
          lang?: number | null
          page_view?: number | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
          topic?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_cover_fkey"
            columns: ["cover"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_lang_fkey"
            columns: ["lang"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_image: {
        Row: {
          image_id: number
          order: number | null
          photo_id: number
        }
        Insert: {
          image_id: number
          order?: number | null
          photo_id: number
        }
        Update: {
          image_id?: number
          order?: number | null
          photo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "photo_image_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_image_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_image_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "random_en_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_image_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "random_jp_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_image_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "random_zh_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      reaction: {
        Row: {
          created_at: string | null
          id: number
          reaction: string | null
          to_article: number | null
          to_comment: number | null
          to_photo: number | null
          to_thought: number | null
          to_video: number | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          reaction?: string | null
          to_article?: number | null
          to_comment?: number | null
          to_photo?: number | null
          to_thought?: number | null
          to_video?: number | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          reaction?: string | null
          to_article?: number | null
          to_comment?: number | null
          to_photo?: number | null
          to_thought?: number | null
          to_video?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reaction_to_article_fkey"
            columns: ["to_article"]
            isOneToOne: false
            referencedRelation: "article"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reaction_to_comment_fkey"
            columns: ["to_comment"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reaction_to_photo_fkey"
            columns: ["to_photo"]
            isOneToOne: false
            referencedRelation: "photo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reaction_to_photo_fkey"
            columns: ["to_photo"]
            isOneToOne: false
            referencedRelation: "random_en_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reaction_to_photo_fkey"
            columns: ["to_photo"]
            isOneToOne: false
            referencedRelation: "random_jp_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reaction_to_photo_fkey"
            columns: ["to_photo"]
            isOneToOne: false
            referencedRelation: "random_zh_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reaction_to_thought_fkey"
            columns: ["to_thought"]
            isOneToOne: false
            referencedRelation: "thought"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reaction_to_video_fkey"
            columns: ["to_video"]
            isOneToOne: false
            referencedRelation: "video"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reaction_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stats: {
        Row: {
          article_count: number | null
          comment_count: number | null
          date: string | null
          id: number
          image_count: number | null
          message_count: number | null
          photo_count: number | null
          thought_count: number | null
          user_count: number | null
          video_count: number | null
        }
        Insert: {
          article_count?: number | null
          comment_count?: number | null
          date?: string | null
          id?: number
          image_count?: number | null
          message_count?: number | null
          photo_count?: number | null
          thought_count?: number | null
          user_count?: number | null
          video_count?: number | null
        }
        Update: {
          article_count?: number | null
          comment_count?: number | null
          date?: string | null
          id?: number
          image_count?: number | null
          message_count?: number | null
          photo_count?: number | null
          thought_count?: number | null
          user_count?: number | null
          video_count?: number | null
        }
        Relationships: []
      }
      thought: {
        Row: {
          content_html: string | null
          content_json: Json | null
          content_text: string | null
          created_at: string | null
          id: number
          location: string | null
          page_view: number | null
          slug: string | null
          topic: string[] | null
        }
        Insert: {
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          created_at?: string | null
          id?: number
          location?: string | null
          page_view?: number | null
          slug?: string | null
          topic?: string[] | null
        }
        Update: {
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          created_at?: string | null
          id?: number
          location?: string | null
          page_view?: number | null
          slug?: string | null
          topic?: string[] | null
        }
        Relationships: []
      }
      thought_image: {
        Row: {
          image_id: number
          order: number | null
          thought_id: number
        }
        Insert: {
          image_id: number
          order?: number | null
          thought_id: number
        }
        Update: {
          image_id?: number
          order?: number | null
          thought_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "thought_image_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thought_image_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thought"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          current_ip: string | null
          id: number
          name: string | null
          role: Database["public"]["Enums"]["role"] | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_ip?: string | null
          id?: number
          name?: string | null
          role?: Database["public"]["Enums"]["role"] | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_ip?: string | null
          id?: number
          name?: string | null
          role?: Database["public"]["Enums"]["role"] | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      video: {
        Row: {
          abstract: string | null
          category: number | null
          content_html: string | null
          content_json: Json | null
          content_text: string | null
          cover: number | null
          created_at: string | null
          embed: string | null
          id: number
          is_draft: boolean | null
          is_featured: boolean | null
          is_top: boolean | null
          lang: number | null
          link: string | null
          page_view: number | null
          published_at: string | null
          slug: string | null
          title: string | null
          topic: string[] | null
          updated_at: string | null
        }
        Insert: {
          abstract?: string | null
          category?: number | null
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          cover?: number | null
          created_at?: string | null
          embed?: string | null
          id?: number
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_top?: boolean | null
          lang?: number | null
          link?: string | null
          page_view?: number | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
          topic?: string[] | null
          updated_at?: string | null
        }
        Update: {
          abstract?: string | null
          category?: number | null
          content_html?: string | null
          content_json?: Json | null
          content_text?: string | null
          cover?: number | null
          created_at?: string | null
          embed?: string | null
          id?: number
          is_draft?: boolean | null
          is_featured?: boolean | null
          is_top?: boolean | null
          lang?: number | null
          link?: string | null
          page_view?: number | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
          topic?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_cover_fkey"
            columns: ["cover"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_lang_fkey"
            columns: ["lang"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      random_en_photos: {
        Row: {
          abstract: string | null
          category: number | null
          content_html: string | null
          content_json: Json | null
          content_text: string | null
          cover: number | null
          created_at: string | null
          id: number | null
          is_draft: boolean | null
          is_featured: boolean | null
          is_top: boolean | null
          lang: number | null
          page_view: number | null
          published_at: string | null
          slug: string | null
          title: string | null
          topic: string[] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_cover_fkey"
            columns: ["cover"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_lang_fkey"
            columns: ["lang"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
      random_jp_photos: {
        Row: {
          abstract: string | null
          category: number | null
          content_html: string | null
          content_json: Json | null
          content_text: string | null
          cover: number | null
          created_at: string | null
          id: number | null
          is_draft: boolean | null
          is_featured: boolean | null
          is_top: boolean | null
          lang: number | null
          page_view: number | null
          published_at: string | null
          slug: string | null
          title: string | null
          topic: string[] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_cover_fkey"
            columns: ["cover"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_lang_fkey"
            columns: ["lang"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
      random_zh_photos: {
        Row: {
          abstract: string | null
          category: number | null
          content_html: string | null
          content_json: Json | null
          content_text: string | null
          cover: number | null
          created_at: string | null
          id: number | null
          is_draft: boolean | null
          is_featured: boolean | null
          is_top: boolean | null
          lang: number | null
          page_view: number | null
          published_at: string | null
          slug: string | null
          title: string | null
          topic: string[] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_cover_fkey"
            columns: ["cover"]
            isOneToOne: false
            referencedRelation: "image"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_lang_fkey"
            columns: ["lang"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_article_count_by_category: {
        Args: {
          lang_name: string
        }
        Returns: {
          title: string
          slug: string
          count: number
        }[]
      }
      get_article_count_by_year: {
        Args: {
          lang_name: string
        }
        Returns: {
          year: string
          count: number
        }[]
      }
      get_photography_count_by_category: {
        Args: {
          lang_name: string
        }
        Returns: {
          title: string
          slug: string
          count: number
        }[]
      }
      get_photography_count_by_year: {
        Args: {
          lang_name: string
        }
        Returns: {
          year: string
          count: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_is_blocked: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_is_comment_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_is_react_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      content: "article" | "photo" | "video" | "thought"
      role: "admin" | "reader" | "banned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
