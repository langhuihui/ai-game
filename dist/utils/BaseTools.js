import { ErrorHandler } from './ErrorHandler.js';
/**
 * 工具类的基类，提供通用的功能
 */
export class BaseTools {
    /**
     * 处理工具调用的通用方法
     */
    async handleToolCall(name, args) {
        try {
            const toolNames = this.getTools().map(tool => tool.name);
            if (!toolNames.includes(name)) {
                return ErrorHandler.createErrorResponse(new Error(`Unknown tool: ${name}`));
            }
            const methodName = this.getMethodName(name);
            const method = this[methodName];
            if (typeof method !== 'function') {
                return ErrorHandler.createErrorResponse(new Error(`Method not found: ${methodName}`));
            }
            return await method.call(this, args);
        }
        catch (error) {
            return ErrorHandler.createErrorResponse(error, `Tool call failed: ${name}`);
        }
    }
    /**
     * 将工具名称转换为方法名称
     * 例如: 'create_character' -> 'createCharacter'
     */
    getMethodName(toolName) {
        return toolName
            .split('_')
            .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
    }
    /**
     * 验证必需参数
     */
    validateParams(args, requiredFields) {
        return ErrorHandler.validateRequiredParams(args, requiredFields);
    }
    /**
     * 创建成功响应
     */
    success(data, message) {
        return ErrorHandler.createSuccessResponse(data, message);
    }
    /**
     * 创建错误响应
     */
    error(error, context) {
        return ErrorHandler.createErrorResponse(error, context);
    }
    /**
     * 安全执行操作
     */
    async safeExecute(operation, context) {
        return await ErrorHandler.safeExecute(operation, context);
    }
}
//# sourceMappingURL=BaseTools.js.map