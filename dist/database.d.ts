import Database from 'better-sqlite3';
export declare class GameDatabase {
    private db;
    constructor(dbPath?: string);
    private initializeTables;
    getDatabase(): Database.Database;
    close(): void;
    /**
     * 迁移旧的permissions数据到新的identities表
     */
    private migratePermissionsToIdentities;
}
export declare const gameDb: GameDatabase;
//# sourceMappingURL=database.d.ts.map