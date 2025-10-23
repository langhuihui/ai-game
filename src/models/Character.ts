export interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
  health: number;
  mental_state: number;
  current_scene_id: number | null;
  created_at: string;
}

export interface CreateCharacterData {
  name: string;
  description: string;
  personality: string;
  health?: number;
  mental_state?: number;
  current_scene_id?: number;
}

export interface UpdateCharacterData {
  name?: string;
  description?: string;
  personality?: string;
  health?: number;
  mental_state?: number;
  current_scene_id?: number;
}
