/**
 * 统一的错误处理工具类
 */
export declare class ErrorHandler {
    /**
     * 创建标准化的错误响应
     */
    static createErrorResponse(error: unknown, context?: string): {
        success: false;
        error: string;
    };
    /**
     * 创建成功响应
     */
    static createSuccessResponse(data: any, message?: string): {
        success: true;
        data?: any;
        message?: string;
    };
    /**
     * 验证必需参数
     */
    static validateRequiredParams(params: any, requiredFields: string[]): string | null;
    /**
     * 安全地执行异步操作
     */
    static safeExecute<T>(operation: () => Promise<T>, context?: string): Promise<{
        success: true;
        data: T;
    } | {
        success: false;
        error: string;
    }>;
}
//# sourceMappingURL=ErrorHandler.d.ts.map