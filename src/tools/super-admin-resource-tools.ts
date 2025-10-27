import { BaseTools } from '../utils/BaseTools.js';
import { ResourceService, GameResource } from '../services/ResourceService.js';

export class SuperAdminResourceTools extends BaseTools {
  private resourceService: ResourceService;

  constructor() {
    super();
    this.resourceService = new ResourceService();
  }

  getTools() {
    return [
      {
        name: 'mcp_admin_list_resources',
        description: '列出管理员专用的资源（仅包含管理和监控相关的资源）',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: []
        }
      },
      {
        name: 'mcp_admin_read_resource',
        description: '读取指定URI的游戏资源内容（管理员专用）',
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

  /**
   * 获取超级管理员专用的资源列表
   * 只包含管理和监控相关的关键资源
   */
  private getAdminResources(): GameResource[] {
    return [
      // 身份管理
      {
        uri: 'game://identities/all',
        name: '身份信息',
        description: '获取所有身份和角色身份信息',
        mimeType: 'application/json'
      },
      {
        uri: 'game://identities/stats',
        name: '身份统计',
        description: '获取身份系统的统计信息',
        mimeType: 'application/json'
      },

      // 公民申请管理
      {
        uri: 'game://citizenship/applications',
        name: '公民申请',
        description: '获取所有公民申请的信息',
        mimeType: 'application/json'
      },
      {
        uri: 'game://citizenship/stats',
        name: '公民统计',
        description: '获取公民申请的统计信息',
        mimeType: 'application/json'
      },

      // 活动监控
      {
        uri: 'game://logs/recent',
        name: '最近活动',
        description: '获取游戏中的最近活动日志',
        mimeType: 'application/json'
      },
      {
        uri: 'game://logs/character-activity',
        name: '角色活动统计',
        description: '获取所有角色的活动统计',
        mimeType: 'application/json'
      },

      // 系统状态
      {
        uri: 'game://state/overview',
        name: '游戏概览',
        description: '获取游戏的总体状态概览',
        mimeType: 'application/json'
      },

      // 数据统计
      {
        uri: 'game://characters/stats',
        name: '角色统计',
        description: '获取角色的统计信息和概览',
        mimeType: 'application/json'
      },
      {
        uri: 'game://scenes/all',
        name: '所有场景',
        description: '获取游戏中所有场景的详细信息',
        mimeType: 'application/json'
      }
    ];
  }

  async handleToolCall(name: string, args: any, context?: any) {
    try {
      switch (name) {
        case 'mcp_admin_list_resources':
          return await this.listResources();
        case 'mcp_admin_read_resource':
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
      // 只返回超级管理员需要的资源
      const resources = this.getAdminResources();
      return {
        success: true,
        resources: resources,
        total_count: resources.length,
        message: '超级管理员资源列表（仅包含管理和监控相关资源）'
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
