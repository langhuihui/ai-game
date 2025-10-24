import { gameDb } from '../database.js';
export class LoggingService {
    db = gameDb.getDatabase();
    logAction(data) {
        const stmt = this.db.prepare(`
      INSERT INTO action_logs (character_id, action_type, action_data, result)
      VALUES (?, ?, ?, ?)
    `);
        const result = stmt.run(data.character_id ?? null, data.action_type, data.action_data, data.result ?? null);
        return this.getLogById(result.lastInsertRowid);
    }
    getLogById(id) {
        const stmt = this.db.prepare('SELECT * FROM action_logs WHERE id = ?');
        return stmt.get(id);
    }
    getLogsByCharacter(characterId, limit) {
        const stmt = this.db.prepare(`
      SELECT * FROM action_logs 
      WHERE character_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
        return stmt.all(characterId, limit ?? 100);
    }
    getAllLogs(limit) {
        const stmt = this.db.prepare(`
      SELECT * FROM action_logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
        return stmt.all(limit ?? 1000);
    }
    getLogsByDate(date) {
        const stmt = this.db.prepare(`
      SELECT * FROM action_logs 
      WHERE DATE(timestamp) = ? 
      ORDER BY timestamp DESC
    `);
        return stmt.all(date);
    }
    getLogsByDateRange(startDate, endDate) {
        const stmt = this.db.prepare(`
      SELECT * FROM action_logs 
      WHERE DATE(timestamp) BETWEEN ? AND ? 
      ORDER BY timestamp DESC
    `);
        return stmt.all(startDate, endDate);
    }
    getLogsWithCharacterInfo(limit) {
        const stmt = this.db.prepare(`
      SELECT 
        al.*,
        c.name as character_name
      FROM action_logs al
      LEFT JOIN characters c ON al.character_id = c.id
      ORDER BY al.timestamp DESC 
      LIMIT ?
    `);
        return stmt.all(limit ?? 1000);
    }
    deleteLog(id) {
        const stmt = this.db.prepare('DELETE FROM action_logs WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    deleteLogsByCharacter(characterId) {
        const stmt = this.db.prepare('DELETE FROM action_logs WHERE character_id = ?');
        const result = stmt.run(characterId);
        return result.changes > 0;
    }
    deleteOldLogs(daysToKeep = 30) {
        const stmt = this.db.prepare(`
      DELETE FROM action_logs 
      WHERE timestamp < datetime('now', '-${daysToKeep} days')
    `);
        const result = stmt.run();
        return result.changes > 0;
    }
    getStats() {
        const charactersStmt = this.db.prepare('SELECT COUNT(*) as count FROM characters');
        const scenesStmt = this.db.prepare('SELECT COUNT(*) as count FROM scenes');
        const itemsStmt = this.db.prepare('SELECT COUNT(*) as count FROM items');
        const recentActivityStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM action_logs 
      WHERE timestamp > datetime('now', '-24 hours')
    `);
        const charactersCount = charactersStmt.get().count;
        const scenesCount = scenesStmt.get().count;
        const itemsCount = itemsStmt.get().count;
        const recentActivityCount = recentActivityStmt.get().count;
        return {
            totalCharacters: charactersCount,
            totalScenes: scenesCount,
            totalItems: itemsCount,
            recentActivity: recentActivityCount
        };
    }
}
//# sourceMappingURL=LoggingService.js.map