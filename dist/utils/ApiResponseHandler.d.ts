import { Response } from 'express';
/**
 * API响应处理器 - 统一处理API响应格式
 */
export declare class ApiResponseHandler {
    /**
     * 处理API请求并返回标准响应
     */
    static handleRequest<T>(res: Response, operation: () => T | Promise<T>, successMessage?: string): Promise<void>;
    /**
     * 处理API请求并返回标准响应（带数据键）
     */
    static handleRequestWithKey<T>(res: Response, operation: () => T | Promise<T>, dataKey: string, successMessage?: string): Promise<void>;
    /**
     * 处理404响应
     */
    static handleNotFound(res: Response, message?: string): void;
    /**
     * 处理成功响应
     */
    static handleSuccess<T>(res: Response, data: T, message?: string): void;
}
//# sourceMappingURL=ApiResponseHandler.d.ts.map