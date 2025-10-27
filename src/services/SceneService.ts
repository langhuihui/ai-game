import { gameDb } from '../database.js';
import { Scene, SceneDetails, CreateSceneData, CreateConnectionData, SceneConnection } from '../models/Scene.js';
import { CharacterService } from './CharacterService.js';
import { Item } from '../models/Item.js';

export class SceneService {
  private db = gameDb.getDatabase();
  private characterService = new CharacterService();

  createScene(data: CreateSceneData): Scene {
    const stmt = this.db.prepare(`
      INSERT INTO scenes (name, description)
      VALUES (?, ?)
    `);

    const result = stmt.run(data.name, data.description);
    return this.getSceneById(result.lastInsertRowid as number)!;
  }

  getSceneById(id: number): Scene | null {
    const stmt = this.db.prepare('SELECT * FROM scenes WHERE id = ?');
    return stmt.get(id) as Scene | null;
  }

  getSceneByName(name: string): Scene | null {
    const stmt = this.db.prepare('SELECT * FROM scenes WHERE name = ?');
    return stmt.get(name) as Scene | null;
  }

  getAllScenes(): Scene[] {
    const stmt = this.db.prepare('SELECT * FROM scenes ORDER BY created_at DESC');
    return stmt.all() as Scene[];
  }

  getSceneDetails(id: number): SceneDetails | null {
    const scene = this.getSceneById(id);
    if (!scene) return null;

    // Get characters in scene
    const characters = this.characterService.getCharactersInScene(id);

    // Get items in scene
    const itemsStmt = this.db.prepare(`
      SELECT id, name, description FROM items 
      WHERE scene_id = ? AND character_id IS NULL
    `);
    const items = itemsStmt.all(id) as Array<{ id: number; name: string; description: string; }>;

    // Get connections from this scene
    const connectionsStmt = this.db.prepare(`
      SELECT 
        sc.id,
        sc.to_scene_id,
        s.name as to_scene_name,
        sc.connection_type,
        sc.description
      FROM scene_connections sc
      JOIN scenes s ON sc.to_scene_id = s.id
      WHERE sc.from_scene_id = ?
    `);
    const connections = connectionsStmt.all(id) as Array<{
      id: number;
      to_scene_id: number;
      to_scene_name: string;
      connection_type: 'door' | 'road';
      description: string;
    }>;

    return {
      ...scene,
      characters: characters.map(c => ({ id: c.id, name: c.name })),
      items,
      connections
    };
  }

  connectScenes(data: CreateConnectionData): SceneConnection | null {
    // Check if both scenes exist
    const fromScene = this.getSceneById(data.from_scene_id);
    const toScene = this.getSceneById(data.to_scene_id);

    if (!fromScene || !toScene) {
      throw new Error('One or both scenes do not exist');
    }

    // Check if connection already exists in either direction
    const existingStmt = this.db.prepare(`
      SELECT id FROM scene_connections 
      WHERE (from_scene_id = ? AND to_scene_id = ?) 
         OR (from_scene_id = ? AND to_scene_id = ?)
    `);
    const existing = existingStmt.get(
      data.from_scene_id,
      data.to_scene_id,
      data.to_scene_id,
      data.from_scene_id
    );

    if (existing) {
      throw new Error('Connection already exists between these scenes');
    }

    const stmt = this.db.prepare(`
      INSERT INTO scene_connections (from_scene_id, to_scene_id, connection_type, description)
      VALUES (?, ?, ?, ?)
    `);

    // Create bidirectional connection by inserting two records
    // Forward direction
    const result1 = stmt.run(
      data.from_scene_id,
      data.to_scene_id,
      data.connection_type,
      data.description
    );

    // Reverse direction
    stmt.run(
      data.to_scene_id,
      data.from_scene_id,
      data.connection_type,
      data.description
    );

    return this.getConnectionById(result1.lastInsertRowid as number);
  }

  getConnectionById(id: number): SceneConnection | null {
    const stmt = this.db.prepare('SELECT * FROM scene_connections WHERE id = ?');
    return stmt.get(id) as SceneConnection | null;
  }

  getConnectionsFromScene(sceneId: number): SceneConnection[] {
    const stmt = this.db.prepare('SELECT * FROM scene_connections WHERE from_scene_id = ?');
    return stmt.all(sceneId) as SceneConnection[];
  }

  canMoveBetweenScenes(fromSceneId: number, toSceneId: number): boolean {
    const stmt = this.db.prepare(`
      SELECT id FROM scene_connections 
      WHERE from_scene_id = ? AND to_scene_id = ?
    `);
    const connection = stmt.get(fromSceneId, toSceneId);
    return !!connection;
  }

  deleteScene(id: number): boolean {
    // Check if scene has characters
    const characters = this.characterService.getCharactersInScene(id);
    if (characters.length > 0) {
      throw new Error('Cannot delete scene with characters in it');
    }

    // Delete connections
    const deleteConnectionsStmt = this.db.prepare(`
      DELETE FROM scene_connections 
      WHERE from_scene_id = ? OR to_scene_id = ?
    `);
    deleteConnectionsStmt.run(id, id);

    // Delete items in scene
    const deleteItemsStmt = this.db.prepare('DELETE FROM items WHERE scene_id = ?');
    deleteItemsStmt.run(id);

    // Delete scene
    const stmt = this.db.prepare('DELETE FROM scenes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteConnection(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM scene_connections WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
