import { ErrorHandler } from './ErrorHandler.js';
/**
 * API响应处理器 - 统一处理API响应格式
 */
export class ApiResponseHandler {
    /**
     * 处理API请求并返回标准响应
     */
    static async handleRequest(res, operation, successMessage) {
        try {
            const data = await Promise.resolve(operation());
            res.json({
                success: true,
                ...(data !== undefined && { data }),
                ...(successMessage && { message: successMessage })
            });
        }
        catch (error) {
            const errorResponse = ErrorHandler.createErrorResponse(error);
            res.status(500).json(errorResponse);
        }
    }
    /**
     * 处理API请求并返回标准响应（带数据键）
     */
    static async handleRequestWithKey(res, operation, dataKey, successMessage) {
        try {
            const data = await Promise.resolve(operation());
            res.json({
                success: true,
                [dataKey]: data,
                ...(successMessage && { message: successMessage })
            });
        }
        catch (error) {
            const errorResponse = ErrorHandler.createErrorResponse(error);
            res.status(500).json(errorResponse);
        }
    }
    /**
     * 处理404响应
     */
    static handleNotFound(res, message = 'Resource not found') {
        res.status(404).json({
            success: false,
            error: message
        });
    }
    /**
     * 处理成功响应
     */
    static handleSuccess(res, data, message) {
        res.json({
            success: true,
            data,
            ...(message && { message })
        });
    }
}
//# sourceMappingURL=ApiResponseHandler.js.map