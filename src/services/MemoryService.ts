import { gameDb } from '../database.js';
import { ShortMemory, LongMemory, CreateMemoryData, UpdateMemoryData, CharacterMemories } from '../models/Memory.js';

export class MemoryService {
  private db = gameDb.getDatabase();
  private readonly MAX_SHORT_MEMORIES = 20;

  addShortMemory(data: CreateMemoryData): ShortMemory {
    const stmt = this.db.prepare(`
      INSERT INTO short_memories (character_id, content)
      VALUES (?, ?)
    `);

    const result = stmt.run(data.character_id, data.content);

    // Clean up old memories to maintain limit
    this.cleanupShortMemories(data.character_id);

    return this.getShortMemoryById(result.lastInsertRowid as number)!;
  }

  addLongMemory(data: CreateMemoryData): LongMemory {
    const stmt = this.db.prepare(`
      INSERT INTO long_memories (character_id, content, importance)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      data.character_id,
      data.content,
      data.importance ?? 5
    );

    return this.getLongMemoryById(result.lastInsertRowid as number)!;
  }

  getShortMemoryById(id: number): ShortMemory | null {
    const stmt = this.db.prepare('SELECT * FROM short_memories WHERE id = ?');
    return stmt.get(id) as ShortMemory | null;
  }

  getLongMemoryById(id: number): LongMemory | null {
    const stmt = this.db.prepare('SELECT * FROM long_memories WHERE id = ?');
    return stmt.get(id) as LongMemory | null;
  }

  getShortMemories(characterId: number, limit?: number): ShortMemory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM short_memories 
      WHERE character_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(characterId, limit ?? this.MAX_SHORT_MEMORIES) as ShortMemory[];
  }

  getLongMemories(characterId: number, limit?: number): LongMemory[] {
    const stmt = this.db.prepare(`
      SELECT * FROM long_memories 
      WHERE character_id = ? 
      ORDER BY importance DESC, timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(characterId, limit ?? 50) as LongMemory[];
  }

  getAllMemories(characterId: number): CharacterMemories {
    return {
      short_memories: this.getShortMemories(characterId),
      long_memories: this.getLongMemories(characterId)
    };
  }

  updateShortMemory(id: number, data: UpdateMemoryData): ShortMemory | null {
    const fields = [];
    const values = [];

    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }

    if (fields.length === 0) {
      return this.getShortMemoryById(id);
    }

    const stmt = this.db.prepare(`UPDATE short_memories SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getShortMemoryById(id);
  }

  updateLongMemory(id: number, data: UpdateMemoryData): LongMemory | null {
    const fields = [];
    const values = [];

    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }
    if (data.importance !== undefined) {
      fields.push('importance = ?');
      values.push(data.importance);
    }

    if (fields.length === 0) {
      return this.getLongMemoryById(id);
    }

    const stmt = this.db.prepare(`UPDATE long_memories SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getLongMemoryById(id);
  }

  deleteShortMemory(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM short_memories WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteLongMemory(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM long_memories WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteAllMemories(characterId: number): boolean {
    const shortStmt = this.db.prepare('DELETE FROM short_memories WHERE character_id = ?');
    const longStmt = this.db.prepare('DELETE FROM long_memories WHERE character_id = ?');

    const shortResult = shortStmt.run(characterId);
    const longResult = longStmt.run(characterId);

    return shortResult.changes > 0 || longResult.changes > 0;
  }

  private cleanupShortMemories(characterId: number) {
    // Get count of short memories for this character
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM short_memories WHERE character_id = ?
    `);
    const count = (countStmt.get(characterId) as { count: number; }).count;

    if (count > this.MAX_SHORT_MEMORIES) {
      // Delete oldest memories
      const deleteStmt = this.db.prepare(`
        DELETE FROM short_memories 
        WHERE character_id = ? AND id IN (
          SELECT id FROM short_memories 
          WHERE character_id = ? 
          ORDER BY timestamp ASC 
          LIMIT ?
        )
      `);
      deleteStmt.run(characterId, characterId, count - this.MAX_SHORT_MEMORIES);
    }
  }

  // Helper method to add conversation memory
  addConversationMemory(characterId: number, speakerName: string, message: string, isPublic: boolean = true): void {
    const memoryContent = isPublic
      ? `${speakerName} said publicly: "${message}"`
      : `${speakerName} said privately: "${message}"`;

    this.addShortMemory({ character_id: characterId, content: memoryContent });
  }

  // Helper method to add action memory
  addActionMemory(characterId: number, action: string, details?: string): void {
    const memoryContent = details
      ? `Action: ${action} - ${details}`
      : `Action: ${action}`;

    this.addShortMemory({ character_id: characterId, content: memoryContent });
  }
}
