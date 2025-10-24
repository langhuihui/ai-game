import { Response } from 'express';
import { ErrorHandler } from './ErrorHandler.js';

/**
 * API响应处理器 - 统一处理API响应格式
 */
export class ApiResponseHandler {
  /**
   * 处理API请求并返回标准响应
   */
  static async handleRequest<T>(
    res: Response,
    operation: () => T | Promise<T>,
    successMessage?: string
  ): Promise<void> {
    try {
      const data = await Promise.resolve(operation());
      res.json({
        success: true,
        ...(data !== undefined && { data }),
        ...(successMessage && { message: successMessage })
      });
    } catch (error) {
      const errorResponse = ErrorHandler.createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * 处理API请求并返回标准响应（带数据键）
   */
  static async handleRequestWithKey<T>(
    res: Response,
    operation: () => T | Promise<T>,
    dataKey: string,
    successMessage?: string
  ): Promise<void> {
    try {
      const data = await Promise.resolve(operation());
      res.json({
        success: true,
        [dataKey]: data,
        ...(successMessage && { message: successMessage })
      });
    } catch (error) {
      const errorResponse = ErrorHandler.createErrorResponse(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * 处理404响应
   */
  static handleNotFound(res: Response, message: string = 'Resource not found'): void {
    res.status(404).json({
      success: false,
      error: message
    });
  }

  /**
   * 处理成功响应
   */
  static handleSuccess<T>(res: Response, data: T, message?: string): void {
    res.json({
      success: true,
      data,
      ...(message && { message })
    });
  }
}
