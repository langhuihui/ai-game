import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { RequestContext } from '../utils/ToolRouter.js';
export declare class GameManagementTools {
    private citizenshipService;
    private identityService;
    private loggingService;
    constructor();
    getTools(): Tool[];
    handleToolCall(name: string, args: any, context?: RequestContext): Promise<any>;
    private validateIdentity;
    private applyForCitizenship;
    private reviewApplication;
    private generateVisitorId;
}
//# sourceMappingURL=game-management-tools.d.ts.map