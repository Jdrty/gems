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
} 