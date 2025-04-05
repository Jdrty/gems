// Base location type matching Supabase schema
export interface Location {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  city_id: string;
  category_id: string | null;
  is_hidden_gem: boolean;
  difficulty_to_find: number | null;
  image_url: string | null;
  area: string | null;
  created_at?: string;
  updated_at?: string;
  is_private: boolean;
  is_user_uploaded: boolean;
}

// Extended location type for our application
export interface AppLocation extends Location {
  is_private: boolean;
  is_user_uploaded: boolean;
}