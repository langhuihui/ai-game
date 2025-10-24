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
        currency INTEGER NOT NULL DEFAULT 1000,
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

    // Trade offers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trade_offers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_character_id INTEGER NOT NULL,
        to_character_id INTEGER NOT NULL,
        currency_amount INTEGER NOT NULL DEFAULT 0,
        item_id INTEGER,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        responded_at DATETIME,
        FOREIGN KEY (from_character_id) REFERENCES characters (id),
        FOREIGN KEY (to_character_id) REFERENCES characters (id),
        FOREIGN KEY (item_id) REFERENCES items (id)
      )
    `);

    // Direct messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_character_id INTEGER NOT NULL,
        to_character_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        scene_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (from_character_id) REFERENCES characters (id),
        FOREIGN KEY (to_character_id) REFERENCES characters (id),
        FOREIGN KEY (scene_id) REFERENCES scenes (id)
      )
    `);

    // Permissions table
    // Permissions table (兼容旧版本)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER,
        permission_level TEXT NOT NULL CHECK (permission_level IN ('prisoner', 'visitor', 'citizen', 'manager', 'super_admin')),
        secret_key TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
    `);

    // Identities table (新的身份系统表)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS identities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER,
        identity_role TEXT NOT NULL CHECK (identity_role IN ('prisoner', 'visitor', 'citizen', 'manager', 'super_admin')),
        secret_key TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        is_active INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
    `);

    // 迁移旧的permissions数据到identities表
    this.migratePermissionsToIdentities();

    // Citizenship applications table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS citizenship_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id TEXT NOT NULL UNIQUE,
        character_name TEXT NOT NULL,
        description TEXT NOT NULL,
        personality TEXT NOT NULL,
        message TEXT NOT NULL,
        preferred_character_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_at DATETIME,
        reviewed_by INTEGER,
        review_message TEXT,
        created_character_id INTEGER,
        created_permission_id INTEGER,
        FOREIGN KEY (reviewed_by) REFERENCES characters (id),
        FOREIGN KEY (created_character_id) REFERENCES characters (id),
        FOREIGN KEY (created_permission_id) REFERENCES identities (id)
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
      CREATE INDEX IF NOT EXISTS idx_trade_offers_from ON trade_offers (from_character_id);
      CREATE INDEX IF NOT EXISTS idx_trade_offers_to ON trade_offers (to_character_id);
      CREATE INDEX IF NOT EXISTS idx_trade_offers_status ON trade_offers (status);
      CREATE INDEX IF NOT EXISTS idx_direct_messages_from ON direct_messages (from_character_id);
      CREATE INDEX IF NOT EXISTS idx_direct_messages_to ON direct_messages (to_character_id);
      CREATE INDEX IF NOT EXISTS idx_direct_messages_scene ON direct_messages (scene_id);
      CREATE INDEX IF NOT EXISTS idx_permissions_character ON permissions (character_id);
      CREATE INDEX IF NOT EXISTS idx_permissions_secret_key ON permissions (secret_key);
      CREATE INDEX IF NOT EXISTS idx_permissions_level ON permissions (permission_level);
      CREATE INDEX IF NOT EXISTS idx_permissions_active ON permissions (is_active);
      CREATE INDEX IF NOT EXISTS idx_identities_character ON identities (character_id);
      CREATE INDEX IF NOT EXISTS idx_identities_secret_key ON identities (secret_key);
      CREATE INDEX IF NOT EXISTS idx_identities_role ON identities (identity_role);
      CREATE INDEX IF NOT EXISTS idx_identities_active ON identities (is_active);
      CREATE INDEX IF NOT EXISTS idx_citizenship_applications_character_id ON citizenship_applications (character_id);
      CREATE INDEX IF NOT EXISTS idx_citizenship_applications_status ON citizenship_applications (status);
      CREATE INDEX IF NOT EXISTS idx_citizenship_applications_created_at ON citizenship_applications (created_at);
    `);
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close() {
    this.db.close();
  }

  /**
   * 迁移旧的permissions数据到新的identities表
   */
  private migratePermissionsToIdentities() {
    // 检查identities表是否为空
    const count = this.db.prepare('SELECT COUNT(*) as count FROM identities').get() as { count: number; };

    // 如果identities表已有数据，跳过迁移
    if (count.count > 0) {
      return;
    }

    // 从permissions表迁移数据到identities表
    this.db.exec(`
      INSERT OR IGNORE INTO identities (character_id, identity_role, secret_key, created_at, expires_at, is_active)
      SELECT character_id, permission_level, secret_key, created_at, expires_at, is_active
      FROM permissions
    `);

    console.log('已将permissions表数据迁移到identities表');
  }
}

// Export singleton instance
export const gameDb = new GameDatabase();
