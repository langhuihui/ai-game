import Database from 'better-sqlite3';
import { join } from 'path';

export class GameDatabase {
  private db: Database.Database;

  constructor(dbPath: string = 'game.db') {
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // Characters table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        personality TEXT NOT NULL,
        health INTEGER NOT NULL DEFAULT 100,
        mental_state INTEGER NOT NULL DEFAULT 100,
        current_scene_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (current_scene_id) REFERENCES scenes (id)
      )
    `);

    // Scenes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Scene connections table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scene_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_scene_id INTEGER NOT NULL,
        to_scene_id INTEGER NOT NULL,
        connection_type TEXT NOT NULL CHECK (connection_type IN ('door', 'road')),
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_scene_id) REFERENCES scenes (id),
        FOREIGN KEY (to_scene_id) REFERENCES scenes (id),
        UNIQUE (from_scene_id, to_scene_id)
      )
    `);

    // Items table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        scene_id INTEGER,
        character_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scene_id) REFERENCES scenes (id),
        FOREIGN KEY (character_id) REFERENCES characters (id),
        CHECK ((scene_id IS NOT NULL AND character_id IS NULL) OR (scene_id IS NULL AND character_id IS NOT NULL))
      )
    `);

    // Short memories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS short_memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
    `);

    // Long memories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS long_memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        importance INTEGER NOT NULL DEFAULT 1 CHECK (importance BETWEEN 1 AND 10),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
    `);

    // Action logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS action_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER,
        action_type TEXT NOT NULL,
        action_data TEXT NOT NULL,
        result TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_characters_scene ON characters (current_scene_id);
      CREATE INDEX IF NOT EXISTS idx_scene_connections_from ON scene_connections (from_scene_id);
      CREATE INDEX IF NOT EXISTS idx_scene_connections_to ON scene_connections (to_scene_id);
      CREATE INDEX IF NOT EXISTS idx_items_scene ON items (scene_id);
      CREATE INDEX IF NOT EXISTS idx_items_character ON items (character_id);
      CREATE INDEX IF NOT EXISTS idx_short_memories_character ON short_memories (character_id);
      CREATE INDEX IF NOT EXISTS idx_long_memories_character ON long_memories (character_id);
      CREATE INDEX IF NOT EXISTS idx_action_logs_character ON action_logs (character_id);
      CREATE INDEX IF NOT EXISTS idx_action_logs_timestamp ON action_logs (timestamp);
    `);
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

// Export singleton instance
export const gameDb = new GameDatabase();
