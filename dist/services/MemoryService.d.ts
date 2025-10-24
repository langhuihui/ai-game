import { ShortMemory, LongMemory, CreateMemoryData, UpdateMemoryData, CharacterMemories } from '../models/Memory.js';
export declare class MemoryService {
    private db;
    private readonly MAX_SHORT_MEMORIES;
    addShortMemory(data: CreateMemoryData): ShortMemory;
    addLongMemory(data: CreateMemoryData): LongMemory;
    getShortMemoryById(id: number): ShortMemory | null;
    getLongMemoryById(id: number): LongMemory | null;
    getShortMemories(characterId: number, limit?: number): ShortMemory[];
    getLongMemories(characterId: number, limit?: number): LongMemory[];
    getAllMemories(characterId: number): CharacterMemories;
    updateShortMemory(id: number, data: UpdateMemoryData): ShortMemory | null;
    updateLongMemory(id: number, data: UpdateMemoryData): LongMemory | null;
    deleteShortMemory(id: number): boolean;
    deleteLongMemory(id: number): boolean;
    deleteAllMemories(characterId: number): boolean;
    private cleanupShortMemories;
    addConversationMemory(characterId: number, speakerName: string, message: string, isPublic?: boolean): void;
    addActionMemory(characterId: number, action: string, details?: string): void;
}
//# sourceMappingURL=MemoryService.d.ts.map