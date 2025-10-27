import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PromptService } from '../services/PromptService.js';

export class PromptTools {
  private promptService = new PromptService();

  getTools(): Tool[] {
    return [
      {
        name: 'mcp_list_prompts',
        description: '列出所有可用的提示词模板',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'mcp_get_prompt',
        description: '获取指定名称的提示词模板及其消息',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '提示词名称'
            },
            arguments: {
              type: 'object',
              description: '提示词参数'
            }
          },
          required: ['name']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any, context?: any): Promise<any> {
    try {
      switch (name) {
        case 'mcp_list_prompts':
          return await this.listPrompts();
        case 'mcp_get_prompt':
          return await this.getPrompt(args.name, args.arguments || {});
        default:
          return { success: false, error: `Unknown tool: ${name}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async listPrompts(): Promise<any> {
    try {
      const prompts = this.promptService.getAllPrompts();
      return {
        success: true,
        prompts: prompts,
        total_count: prompts.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list prompts'
      };
    }
  }

  private async getPrompt(name: string, promptArgs?: any): Promise<any> {
    try {
      const allPrompts = this.promptService.getAllPrompts();
      const promptDef = allPrompts.find(p => p.name === name);

      if (!promptDef) {
        return {
          success: false,
          error: `Prompt not found: ${name}`
        };
      }

      // 生成提示词消息
      const messages = await this.promptService.getPromptMessages(name, promptArgs || {});

      return {
        success: true,
        prompt: {
          name: promptDef.name,
          description: promptDef.description,
          arguments: promptDef.arguments,
          messages: messages
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get prompt'
      };
    }
  }
}
