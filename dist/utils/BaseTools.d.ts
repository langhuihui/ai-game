import { Tool } from '@modelcontextprotocol/sdk/types.js';
/**
 * 工具类的基类，提供通用的功能
 */
export declare abstract class BaseTools {
    /**
     * 处理工具调用的通用方法
     */
    handleToolCall(name: string, args: any): Promise<any>;
    /**
     * 将工具名称转换为方法名称
     * 例如: 'create_character' -> 'createCharacter'
     */
    protected getMethodName(toolName: string): string;
    /**
     * 验证必需参数
     */
    protected validateParams(args: any, requiredFields: string[]): string | null;
    /**
     * 创建成功响应
     */
    protected success(data?: any, message?: string): {
        success: true;
        data?: any;
        message?: string;
    };
    /**
     * 创建错误响应
     */
    protected error(error: unknown, context?: string): {
        success: false;
        error: string;
    };
    /**
     * 安全执行操作
     */
    protected safeExecute<T>(operation: () => Promise<T>, context?: string): Promise<{
        success: false;
        error: string;
    } | {
        success: true;
        data: T;
    }>;
    /**
     * 获取工具列表 - 子类必须实现
     */
    abstract getTools(): Tool[];
}
//# sourceMappingURL=BaseTools.d.ts.map