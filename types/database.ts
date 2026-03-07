export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          caption: string | null;
          vote_count: number;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          storage_path: string;
          caption?: string | null;
          vote_count?: number;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          storage_path?: string;
          caption?: string | null;
          vote_count?: number;
          expires_at?: string;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          photo_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          photo_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          photo_id?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Photo = Database['public']['Tables']['photos']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];

export interface FeedPhoto extends Photo {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null;
  has_voted: boolean;
}
