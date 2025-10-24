import { gameDb } from '../database.js';

export interface ActionLog {
  id: number;
  character_id: number | null;
  action_type: string;
  action_data: string;
  result: string | null;
  timestamp: string;
}

export interface CreateLogData {
  character_id?: number;
  action_type: string;
  action_data: string;
  result?: string;
}

export class LoggingService {
  private db = gameDb.getDatabase();

  logAction(data: CreateLogData): ActionLog {
    const stmt = this.db.prepare(`
      INSERT INTO action_logs (character_id, action_type, action_data, result)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.character_id ?? null,
      data.action_type,
      data.action_data,
      data.result ?? null
    );

    return this.getLogById(result.lastInsertRowid as number)!;
  }

  getLogById(id: number): ActionLog | null {
    const stmt = this.db.prepare('SELECT * FROM action_logs WHERE id = ?');
    return stmt.get(id) as ActionLog | null;
  }

  getLogsByCharacter(characterId: number, limit?: number): ActionLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM action_logs 
      WHERE character_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(characterId, limit ?? 100) as ActionLog[];
  }

  getAllLogs(limit?: number): ActionLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM action_logs 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit ?? 1000) as ActionLog[];
  }

  getLogsByDate(date: string): ActionLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM action_logs 
      WHERE DATE(timestamp) = ? 
      ORDER BY timestamp DESC
    `);
    return stmt.all(date) as ActionLog[];
  }

  getLogsByDateRange(startDate: string, endDate: string): ActionLog[] {
    const stmt = this.db.prepare(`
      SELECT * FROM action_logs 
      WHERE DATE(timestamp) BETWEEN ? AND ? 
      ORDER BY timestamp DESC
    `);
    return stmt.all(startDate, endDate) as ActionLog[];
  }

  getLogsWithCharacterInfo(limit?: number): Array<ActionLog & { character_name?: string; }> {
    const stmt = this.db.prepare(`
      SELECT 
        al.*,
        c.name as character_name
      FROM action_logs al
      LEFT JOIN characters c ON al.character_id = c.id
      ORDER BY al.timestamp DESC 
      LIMIT ?
    `);
    return stmt.all(limit ?? 1000) as Array<ActionLog & { character_name?: string; }>;
  }

  deleteLog(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM action_logs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteLogsByCharacter(characterId: number): boolean {
    const stmt = this.db.prepare('DELETE FROM action_logs WHERE character_id = ?');
    const result = stmt.run(characterId);
    return result.changes > 0;
  }

  deleteOldLogs(daysToKeep: number = 30): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM action_logs 
      WHERE timestamp < datetime('now', '-${daysToKeep} days')
    `);
    const result = stmt.run();
    return result.changes > 0;
  }

  getStats(): { totalCharacters: number; totalScenes: number; totalItems: number; recentActivity: number; } {
    const charactersStmt = this.db.prepare('SELECT COUNT(*) as count FROM characters');
    const scenesStmt = this.db.prepare('SELECT COUNT(*) as count FROM scenes');
    const itemsStmt = this.db.prepare('SELECT COUNT(*) as count FROM items');
    const recentActivityStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM action_logs 
      WHERE timestamp > datetime('now', '-24 hours')
    `);

    const charactersCount = (charactersStmt.get() as any).count;
    const scenesCount = (scenesStmt.get() as any).count;
    const itemsCount = (itemsStmt.get() as any).count;
    const recentActivityCount = (recentActivityStmt.get() as any).count;

    return {
      totalCharacters: charactersCount,
      totalScenes: scenesCount,
      totalItems: itemsCount,
      recentActivity: recentActivityCount
    };
  }
}
