/**
 * 工具路由器 - 用于优化工具调用的路由逻辑
 */
export interface ToolHandler {
    getTools(): any[];
    handleToolCall(name: string, args: any): Promise<any>;
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
    routeToolCall(name: string, args: any): Promise<any>;
    /**
     * 获取所有工具
     */
    getAllTools(): any[];
}
//# sourceMappingURL=ToolRouter.d.ts.map