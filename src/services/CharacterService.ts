import { gameDb } from '../database.js';
import { Character, CreateCharacterData, UpdateCharacterData } from '../models/Character.js';

export class CharacterService {
  private db = gameDb.getDatabase();

  createCharacter(data: CreateCharacterData): Character {
    const stmt = this.db.prepare(`
      INSERT INTO characters (name, description, personality, health, mental_state, current_scene_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.name,
      data.description,
      data.personality,
      data.health ?? 100,
      data.mental_state ?? 100,
      data.current_scene_id ?? null
    );

    return this.getCharacterById(result.lastInsertRowid as number)!;
  }

  getCharacterById(id: number): Character | null {
    const stmt = this.db.prepare('SELECT * FROM characters WHERE id = ?');
    return stmt.get(id) as Character | null;
  }

  getCharacterByName(name: string): Character | null {
    const stmt = this.db.prepare('SELECT * FROM characters WHERE name = ?');
    return stmt.get(name) as Character | null;
  }

  getAllCharacters(): Character[] {
    const stmt = this.db.prepare('SELECT * FROM characters ORDER BY created_at DESC');
    return stmt.all() as Character[];
  }

  updateCharacter(id: number, data: UpdateCharacterData): Character | null {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.personality !== undefined) {
      fields.push('personality = ?');
      values.push(data.personality);
    }
    if (data.health !== undefined) {
      fields.push('health = ?');
      values.push(data.health);
    }
    if (data.mental_state !== undefined) {
      fields.push('mental_state = ?');
      values.push(data.mental_state);
    }
    if (data.current_scene_id !== undefined) {
      fields.push('current_scene_id = ?');
      values.push(data.current_scene_id);
    }

    if (fields.length === 0) {
      return this.getCharacterById(id);
    }

    const stmt = this.db.prepare(`UPDATE characters SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getCharacterById(id);
  }

  deleteCharacter(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM characters WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getCharactersInScene(sceneId: number): Character[] {
    const stmt = this.db.prepare('SELECT * FROM characters WHERE current_scene_id = ?');
    return stmt.all(sceneId) as Character[];
  }

  moveCharacter(characterId: number, sceneId: number): Character | null {
    return this.updateCharacter(characterId, { current_scene_id: sceneId });
  }

  updateCharacterHealth(characterId: number, healthChange: number): Character | null {
    const character = this.getCharacterById(characterId);
    if (!character) return null;

    const newHealth = Math.max(0, Math.min(100, character.health + healthChange));
    return this.updateCharacter(characterId, { health: newHealth });
  }

  updateCharacterMentalState(characterId: number, mentalStateChange: number): Character | null {
    const character = this.getCharacterById(characterId);
    if (!character) return null;

    const newMentalState = Math.max(0, Math.min(100, character.mental_state + mentalStateChange));
    return this.updateCharacter(characterId, { mental_state: newMentalState });
  }
}
