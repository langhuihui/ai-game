export interface Scene {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface SceneConnection {
  id: number;
  from_scene_id: number;
  to_scene_id: number;
  connection_type: 'door' | 'road';
  description: string;
  created_at: string;
}

export interface SceneDetails extends Scene {
  characters: Array<{
    id: number;
    name: string;
  }>;
  items: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  connections: Array<{
    id: number;
    to_scene_id: number;
    to_scene_name: string;
    connection_type: 'door' | 'road';
    description: string;
  }>;
}

export interface CreateSceneData {
  name: string;
  description: string;
}

export interface CreateConnectionData {
  from_scene_id: number;
  to_scene_id: number;
  connection_type: 'door' | 'road';
  description: string;
}
