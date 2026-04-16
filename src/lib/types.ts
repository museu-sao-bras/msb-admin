export interface ExhibitionImage {
  id: string;
  exhibition_id?: string;
  file_path?: string | null;
  description?: string | null;
  date_taken?: string | null;
  photographer?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  public_url?: string | null;
}

export interface ExhibitionRecord {
  id: string;
  title: string | null;
  description: string | null;
  start_date?: string | null;
  end_date?: string | null;
  collection_type?: CollectionType | null;
  preview?: boolean;
  images?: ExhibitionImage[];
  created_at?: string | null;
  updated_at?: string | null;
}

export enum CollectionType {
  PERMANENT = "permanent",
  TEMPORARY = "temporary",
  ARCHIVED = "archived",
}
