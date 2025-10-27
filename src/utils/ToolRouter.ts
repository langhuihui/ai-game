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

export class ToolRouter {
  private handlers: ToolHandler[] = [];

  /**
   * 注册工具处理器
   */
  registerHandler(handler: ToolHandler): void {
    this.handlers.push(handler);
  }

  /**
   * 查找并执行工具调用
   */
  async routeToolCall(name: string, args: any, context?: RequestContext): Promise<any> {
    for (const handler of this.handlers) {
      const tools = handler.getTools();
      if (tools.some((tool: any) => tool.name === name)) {
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
  getAllTools(): any[] {
    return this.handlers.flatMap(handler => handler.getTools());
  }
}
