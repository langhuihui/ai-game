import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class GameCoreTools {
    private characterService;
    private sceneService;
    private itemService;
    private memoryService;
    private loggingService;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
}
//# sourceMappingURL=game-core-tools.d.ts.map