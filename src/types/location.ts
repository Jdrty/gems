export interface Location {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  category_id: string | null;
  is_hidden_gem: boolean;
  difficulty_to_find: number;
  image_url: string | null;
  area: string | null;
  is_private: boolean;
} 