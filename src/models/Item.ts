export interface Item {
  id: number;
  name: string;
  description: string;
  scene_id: number | null;
  character_id: number | null;
  created_at: string;
}

export interface CreateItemData {
  name: string;
  description: string;
  scene_id?: number;
  character_id?: number;
}

export interface ItemEffect {
  health_change?: number;
  mental_state_change?: number;
  description: string;
}
