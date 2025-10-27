import { BaseTools } from '../utils/BaseTools.js';
import { ResourceService } from '../services/ResourceService.js';

export class ResourceTools extends BaseTools {
  private resourceService: ResourceService;

  constructor() {
    super();
    this.resourceService = new ResourceService();
  }

  getTools() {
    return [
      {
        name: 'mcp_list_resources',
        description: '列出所有可用的游戏资源',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: []
        }
      },
      {
        name: 'mcp_read_resource',
        description: '读取指定URI的游戏资源内容',
        inputSchema: {
          type: 'object' as const,
          properties: {
            uri: {
              type: 'string',
              description: '要读取的资源URI'
            }
          },
          required: ['uri']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any, context?: any) {
    try {
      switch (name) {
        case 'mcp_list_resources':
          return await this.listResources();

        case 'mcp_read_resource':
          return await this.readResource(args.uri);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async listResources() {
    try {
      const resources = this.resourceService.getAllResources();
      return {
        success: true,
        resources: resources,
        total_count: resources.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list resources'
      };
    }
  }

  private async readResource(uri: string) {
    try {
      const content = await this.resourceService.readResource(uri);
      return {
        success: true,
        content: content
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read resource'
      };
    }
  }
}
