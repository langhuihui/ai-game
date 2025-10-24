import { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare class PromptTools {
    private promptService;
    getTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    private listPrompts;
    private getPrompt;
}
//# sourceMappingURL=prompt-tools.d.ts.map