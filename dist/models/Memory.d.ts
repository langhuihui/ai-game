export interface ShortMemory {
    id: number;
    character_id: number;
    content: string;
    timestamp: string;
}
export interface LongMemory {
    id: number;
    character_id: number;
    content: string;
    importance: number;
    timestamp: string;
}
export interface CreateMemoryData {
    character_id: number;
    content: string;
    importance?: number;
}
export interface UpdateMemoryData {
    content?: string;
    importance?: number;
}
export interface CharacterMemories {
    short_memories: ShortMemory[];
    long_memories: LongMemory[];
}
//# sourceMappingURL=Memory.d.ts.map