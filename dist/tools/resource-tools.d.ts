import { BaseTools } from '../utils/BaseTools.js';
export declare class ResourceTools extends BaseTools {
    private resourceService;
    constructor();
    getTools(): ({
        name: string;
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                uri?: undefined;
            };
            required: never[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                uri: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    })[];
    handleToolCall(name: string, args: any, context?: any): Promise<{
        success: boolean;
        resources: import("../services/ResourceService.js").GameResource[];
        total_count: number;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        resources?: undefined;
        total_count?: undefined;
    } | {
        success: boolean;
        content: import("../services/ResourceService.js").ResourceContent;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        content?: undefined;
    }>;
    private listResources;
    private readResource;
}
//# sourceMappingURL=resource-tools.d.ts.map