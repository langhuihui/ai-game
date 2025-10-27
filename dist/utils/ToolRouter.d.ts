/**
 * 请求上下文 - 包含当前请求的元数据
 */
export interface RequestContext {
    secretKey?: string;
    characterId?: string;
    connectionId?: string;
}
/**
 * 工具路由器 - 用于优化工具调用的路由逻辑
 */
export interface ToolHandler {
    getTools(): any[];
    handleToolCall(name: string, args: any, context?: RequestContext): Promise<any>;
}
export declare class ToolRouter {
    private handlers;
    /**
     * 注册工具处理器
     */
    registerHandler(handler: ToolHandler): void;
    /**
     * 查找并执行工具调用
     */
    routeToolCall(name: string, args: any, context?: RequestContext): Promise<any>;
    /**
     * 获取所有工具
     */
    getAllTools(): any[];
}
//# sourceMappingURL=ToolRouter.d.ts.map