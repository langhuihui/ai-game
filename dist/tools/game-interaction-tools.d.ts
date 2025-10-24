import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class GameInteractionTools {
    private characterService;
    private itemService;
    private memoryService;
    private loggingService;
    constructor();
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private addShortMemory;
    private addLongMemory;
    private updateShortMemory;
    private updateLongMemory;
    private deleteShortMemory;
    private deleteLongMemory;
    private deleteAllMemories;
    private createTradeOffer;
    private respondToTradeOffer;
    private cancelTradeOffer;
    private sendDirectMessage;
    private markMessageAsRead;
    private markAllMessagesAsRead;
}
//# sourceMappingURL=game-interaction-tools.d.ts.map