import { gameDb } from '../database.js';
export class MemoryService {
    db = gameDb.getDatabase();
    MAX_SHORT_MEMORIES = 20;
    addShortMemory(data) {
        const stmt = this.db.prepare(`
      INSERT INTO short_memories (character_id, content)
      VALUES (?, ?)
    `);
        const result = stmt.run(data.character_id, data.content);
        // Clean up old memories to maintain limit
        this.cleanupShortMemories(data.character_id);
        return this.getShortMemoryById(result.lastInsertRowid);
    }
    addLongMemory(data) {
        const stmt = this.db.prepare(`
      INSERT INTO long_memories (character_id, content, importance)
      VALUES (?, ?, ?)
    `);
        const result = stmt.run(data.character_id, data.content, data.importance ?? 5);
        return this.getLongMemoryById(result.lastInsertRowid);
    }
    getShortMemoryById(id) {
        const stmt = this.db.prepare('SELECT * FROM short_memories WHERE id = ?');
        return stmt.get(id);
    }
    getLongMemoryById(id) {
        const stmt = this.db.prepare('SELECT * FROM long_memories WHERE id = ?');
        return stmt.get(id);
    }
    getShortMemories(characterId, limit) {
        const stmt = this.db.prepare(`
      SELECT * FROM short_memories 
      WHERE character_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
        return stmt.all(characterId, limit ?? this.MAX_SHORT_MEMORIES);
    }
    getLongMemories(characterId, limit) {
        const stmt = this.db.prepare(`
      SELECT * FROM long_memories 
      WHERE character_id = ? 
      ORDER BY importance DESC, timestamp DESC 
      LIMIT ?
    `);
        return stmt.all(characterId, limit ?? 50);
    }
    getAllMemories(characterId) {
        return {
            short_memories: this.getShortMemories(characterId),
            long_memories: this.getLongMemories(characterId)
        };
    }
    updateShortMemory(id, data) {
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
    updateLongMemory(id, data) {
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
    deleteShortMemory(id) {
        const stmt = this.db.prepare('DELETE FROM short_memories WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    deleteLongMemory(id) {
        const stmt = this.db.prepare('DELETE FROM long_memories WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    deleteAllMemories(characterId) {
        const shortStmt = this.db.prepare('DELETE FROM short_memories WHERE character_id = ?');
        const longStmt = this.db.prepare('DELETE FROM long_memories WHERE character_id = ?');
        const shortResult = shortStmt.run(characterId);
        const longResult = longStmt.run(characterId);
        return shortResult.changes > 0 || longResult.changes > 0;
    }
    cleanupShortMemories(characterId) {
        // Get count of short memories for this character
        const countStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM short_memories WHERE character_id = ?
    `);
        const count = countStmt.get(characterId).count;
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
    addConversationMemory(characterId, speakerName, message, isPublic = true) {
        const memoryContent = isPublic
            ? `${speakerName} said publicly: "${message}"`
            : `${speakerName} said privately: "${message}"`;
        this.addShortMemory({ character_id: characterId, content: memoryContent });
    }
    // Helper method to add action memory
    addActionMemory(characterId, action, details) {
        const memoryContent = details
            ? `Action: ${action} - ${details}`
            : `Action: ${action}`;
        this.addShortMemory({ character_id: characterId, content: memoryContent });
    }
}
//# sourceMappingURL=MemoryService.js.map