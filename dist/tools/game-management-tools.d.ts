import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class GameManagementTools {
    private citizenshipService;
    private identityService;
    private loggingService;
    constructor();
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private validateIdentity;
    private applyForCitizenship;
    private reviewApplication;
    private generateVisitorId;
}
//# sourceMappingURL=game-management-tools.d.ts.map