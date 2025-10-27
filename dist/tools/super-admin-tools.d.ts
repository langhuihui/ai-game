import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { RequestContext } from '../utils/ToolRouter.js';
export declare class SuperAdminTools {
    private characterService;
    private sceneService;
    private itemService;
    private loggingService;
    private identityService;
    constructor();
    getTools(): Tool[];
    handleToolCall(name: string, args: any, context?: RequestContext): Promise<any>;
    private updateCharacterIdentity;
    private createScene;
    private createItem;
    private sendAnnouncement;
    private modifyCharacter;
}
//# sourceMappingURL=super-admin-tools.d.ts.map