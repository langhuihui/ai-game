export class ToolRouter {
    handlers = [];
    /**
     * 注册工具处理器
     */
    registerHandler(handler) {
        this.handlers.push(handler);
    }
    /**
     * 查找并执行工具调用
     */
    async routeToolCall(name, args, context) {
        for (const handler of this.handlers) {
            const tools = handler.getTools();
            if (tools.some((tool) => tool.name === name)) {
                return await handler.handleToolCall(name, args, context);
            }
        }
        return {
            success: false,
            error: `Unknown tool: ${name}`
        };
    }
    /**
     * 获取所有工具
     */
    getAllTools() {
        return this.handlers.flatMap(handler => handler.getTools());
    }
}
//# sourceMappingURL=ToolRouter.js.map