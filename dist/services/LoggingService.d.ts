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
export declare class LoggingService {
    private db;
    logAction(data: CreateLogData): ActionLog;
    getLogById(id: number): ActionLog | null;
    getLogsByCharacter(characterId: number, limit?: number): ActionLog[];
    getAllLogs(limit?: number): ActionLog[];
    getLogsByDate(date: string): ActionLog[];
    getLogsByDateRange(startDate: string, endDate: string): ActionLog[];
    getLogsWithCharacterInfo(limit?: number): Array<ActionLog & {
        character_name?: string;
    }>;
    deleteLog(id: number): boolean;
    deleteLogsByCharacter(characterId: number): boolean;
    deleteOldLogs(daysToKeep?: number): boolean;
    getStats(): {
        totalCharacters: number;
        totalScenes: number;
        totalItems: number;
        recentActivity: number;
    };
}
//# sourceMappingURL=LoggingService.d.ts.map