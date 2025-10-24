import { BaseTools } from '../utils/BaseTools.js';
import { GameResource } from '../services/ResourceService.js';
export declare class SuperAdminResourceTools extends BaseTools {
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
    /**
     * 获取超级管理员专用的资源列表
     * 只包含管理和监控相关的关键资源
     */
    private getAdminResources;
    handleToolCall(name: string, args: any): Promise<{
        success: boolean;
        resources: GameResource[];
        total_count: number;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        resources?: undefined;
        total_count?: undefined;
        message?: undefined;
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
//# sourceMappingURL=super-admin-resource-tools.d.ts.map