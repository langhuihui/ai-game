/**
 * 统一的错误处理工具类
 */
export class ErrorHandler {
  /**
   * 创建标准化的错误响应
   */
  static createErrorResponse(error: unknown, context?: string): { success: false; error: string; } {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;

    return {
      success: false,
      error: fullMessage
    };
  }

  /**
   * 创建成功响应
   */
  static createSuccessResponse(data: any, message?: string): { success: true; data?: any; message?: string; } {
    const response: { success: true; data?: any; message?: string; } = { success: true };

    if (data !== undefined) {
      response.data = data;
    }

    if (message) {
      response.message = message;
    }

    return response;
  }

  /**
   * 验证必需参数
   */
  static validateRequiredParams(params: any, requiredFields: string[]): string | null {
    for (const field of requiredFields) {
      if (params[field] === undefined || params[field] === null) {
        return `Missing required parameter: ${field}`;
      }
    }
    return null;
  }

  /**
   * 安全地执行异步操作
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<{ success: true; data: T; } | { success: false; error: string; }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      return this.createErrorResponse(error, context);
    }
  }
}
