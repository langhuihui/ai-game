import { gameDb } from '../database.js';
import { CharacterService } from './CharacterService.js';
export class SceneService {
    db = gameDb.getDatabase();
    characterService = new CharacterService();
    createScene(data) {
        const stmt = this.db.prepare(`
      INSERT INTO scenes (name, description)
      VALUES (?, ?)
    `);
        const result = stmt.run(data.name, data.description);
        return this.getSceneById(result.lastInsertRowid);
    }
    getSceneById(id) {
        const stmt = this.db.prepare('SELECT * FROM scenes WHERE id = ?');
        return stmt.get(id);
    }
    getSceneByName(name) {
        const stmt = this.db.prepare('SELECT * FROM scenes WHERE name = ?');
        return stmt.get(name);
    }
    getAllScenes() {
        const stmt = this.db.prepare('SELECT * FROM scenes ORDER BY created_at DESC');
        return stmt.all();
    }
    getSceneDetails(id) {
        const scene = this.getSceneById(id);
        if (!scene)
            return null;
        // Get characters in scene
        const characters = this.characterService.getCharactersInScene(id);
        // Get items in scene
        const itemsStmt = this.db.prepare(`
      SELECT id, name, description FROM items 
      WHERE scene_id = ? AND character_id IS NULL
    `);
        const items = itemsStmt.all(id);
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
        const connections = connectionsStmt.all(id);
        return {
            ...scene,
            characters: characters.map(c => ({ id: c.id, name: c.name })),
            items,
            connections
        };
    }
    connectScenes(data) {
        // Check if both scenes exist
        const fromScene = this.getSceneById(data.from_scene_id);
        const toScene = this.getSceneById(data.to_scene_id);
        if (!fromScene || !toScene) {
            throw new Error('One or both scenes do not exist');
        }
        // Check if connection already exists
        const existingStmt = this.db.prepare(`
      SELECT id FROM scene_connections 
      WHERE from_scene_id = ? AND to_scene_id = ?
    `);
        const existing = existingStmt.get(data.from_scene_id, data.to_scene_id);
        if (existing) {
            throw new Error('Connection already exists between these scenes');
        }
        const stmt = this.db.prepare(`
      INSERT INTO scene_connections (from_scene_id, to_scene_id, connection_type, description)
      VALUES (?, ?, ?, ?)
    `);
        const result = stmt.run(data.from_scene_id, data.to_scene_id, data.connection_type, data.description);
        return this.getConnectionById(result.lastInsertRowid);
    }
    getConnectionById(id) {
        const stmt = this.db.prepare('SELECT * FROM scene_connections WHERE id = ?');
        return stmt.get(id);
    }
    getConnectionsFromScene(sceneId) {
        const stmt = this.db.prepare('SELECT * FROM scene_connections WHERE from_scene_id = ?');
        return stmt.all(sceneId);
    }
    canMoveBetweenScenes(fromSceneId, toSceneId) {
        const stmt = this.db.prepare(`
      SELECT id FROM scene_connections 
      WHERE from_scene_id = ? AND to_scene_id = ?
    `);
        const connection = stmt.get(fromSceneId, toSceneId);
        return !!connection;
    }
    deleteScene(id) {
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
    deleteConnection(id) {
        const stmt = this.db.prepare('DELETE FROM scene_connections WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
}
//# sourceMappingURL=SceneService.js.map