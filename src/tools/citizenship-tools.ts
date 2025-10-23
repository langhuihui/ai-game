import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CitizenshipApplicationService } from '../services/CitizenshipApplicationService.js';
import { PermissionService } from '../services/PermissionService.js';
import { LoggingService } from '../services/LoggingService.js';
import { PermissionLevel } from '../models/Permission.js';

export class CitizenshipTools {
  private citizenshipService: CitizenshipApplicationService;
  private permissionService: PermissionService;
  private loggingService: LoggingService;

  constructor() {
    this.citizenshipService = new CitizenshipApplicationService();
    this.permissionService = new PermissionService();
    this.loggingService = new LoggingService();
  }

  getTools(): Tool[] {
    return [
      {
        name: 'apply_for_citizenship',
        description: 'Apply for citizenship (visitor only)',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'string',
              description: 'Unique character ID for the visitor'
            },
            character_name: {
              type: 'string',
              description: 'Desired character name'
            },
            description: {
              type: 'string',
              description: 'Character physical description'
            },
            personality: {
              type: 'string',
              description: 'Character personality and background'
            },
            message: {
              type: 'string',
              description: 'Application message explaining why you want to become a citizen'
            },
            preferred_character_id: {
              type: 'string',
              description: 'Preferred character ID (optional, server will try to use this if available)'
            }
          },
          required: ['character_id', 'character_name', 'description', 'personality', 'message']
        }
      },
      {
        name: 'get_citizenship_application_status',
        description: 'Get citizenship application status',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'string',
              description: 'Character ID to check application status for'
            }
          },
          required: ['character_id']
        }
      },
      {
        name: 'get_pending_citizenship_applications',
        description: 'Get all pending citizenship applications (requires manager or super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Admin secret key for authorization'
            }
          },
          required: ['admin_secret_key']
        }
      },
      {
        name: 'review_citizenship_application',
        description: 'Review a citizenship application (requires manager or super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Admin secret key for authorization'
            },
            application_id: {
              type: 'number',
              description: 'Application ID to review'
            },
            status: {
              type: 'string',
              enum: ['approved', 'rejected'],
              description: 'Review decision'
            },
            review_message: {
              type: 'string',
              description: 'Optional review message'
            }
          },
          required: ['admin_secret_key', 'application_id', 'status']
        }
      },
      {
        name: 'get_character_basic_info',
        description: 'Get basic character information (ID and permission level only)',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID to get info for'
            }
          },
          required: ['character_id']
        }
      },
      {
        name: 'get_game_rules',
        description: 'Get game rules and gameplay information',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'generate_visitor_id',
        description: 'Generate a unique visitor character ID',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_citizenship_application_stats',
        description: 'Get citizenship application statistics (requires manager or super admin)',
        inputSchema: {
          type: 'object',
          properties: {
            admin_secret_key: {
              type: 'string',
              description: 'Admin secret key for authorization'
            }
          },
          required: ['admin_secret_key']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'apply_for_citizenship':
          return await this.applyForCitizenship(args);
        case 'get_citizenship_application_status':
          return await this.getApplicationStatus(args);
        case 'get_pending_citizenship_applications':
          return await this.getPendingApplications(args);
        case 'review_citizenship_application':
          return await this.reviewApplication(args);
        case 'get_character_basic_info':
          return await this.getCharacterBasicInfo(args);
        case 'get_game_rules':
          return await this.getGameRules(args);
        case 'generate_visitor_id':
          return await this.generateVisitorId(args);
        case 'get_citizenship_application_stats':
          return await this.getApplicationStats(args);
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

  private async applyForCitizenship(args: any): Promise<any> {
    const { character_id, character_name, description, personality, message, preferred_character_id } = args;

    // 检查角色ID是否唯一
    if (!this.citizenshipService.isCharacterIdUnique(character_id)) {
      return { success: false, error: 'Character ID already exists' };
    }

    // 检查角色名称是否已存在
    const existingCharacter = this.citizenshipService.getCharacterBasicInfo(parseInt(character_id));
    if (existingCharacter) {
      return { success: false, error: 'Character name already exists' };
    }

    const application = this.citizenshipService.createApplication({
      character_id,
      character_name,
      description,
      personality,
      message,
      preferred_character_id
    });

    this.loggingService.logAction({
      action_type: 'apply_for_citizenship',
      action_data: JSON.stringify({ character_id, character_name, preferred_character_id }),
      result: `Citizenship application created with ID ${application.id}`
    });

    return {
      success: true,
      application,
      message: 'Citizenship application submitted successfully. Please wait for admin review.'
    };
  }

  private async getApplicationStatus(args: any): Promise<any> {
    const { character_id } = args;

    const application = this.citizenshipService.getApplicationByCharacterId(character_id);
    if (!application) {
      return { success: false, error: 'No application found for this character ID' };
    }

    return {
      success: true,
      application,
      message: `Application status: ${application.status}`
    };
  }

  private async getPendingApplications(args: any): Promise<any> {
    const { admin_secret_key } = args;

    // 验证管理员权限
    if (!this.permissionService.validateMinimumPermission(admin_secret_key, PermissionLevel.MANAGER)) {
      return { success: false, error: 'Insufficient permissions. Manager or Super Admin required.' };
    }

    const pendingApplications = this.citizenshipService.getPendingApplications();

    return {
      success: true,
      applications: pendingApplications,
      count: pendingApplications.length,
      message: `Found ${pendingApplications.length} pending applications`
    };
  }

  private async reviewApplication(args: any): Promise<any> {
    const { admin_secret_key, application_id, status, review_message } = args;

    // 验证管理员权限
    if (!this.permissionService.validateMinimumPermission(admin_secret_key, PermissionLevel.MANAGER)) {
      return { success: false, error: 'Insufficient permissions. Manager or Super Admin required.' };
    }

    // 获取审核者信息
    const adminPermission = this.permissionService.getPermissionBySecretKey(admin_secret_key);
    if (!adminPermission || !adminPermission.character_id) {
      return { success: false, error: 'Invalid admin permission' };
    }

    const reviewedApplication = this.citizenshipService.reviewApplication({
      application_id,
      status,
      review_message,
      reviewer_character_id: adminPermission.character_id
    });

    if (!reviewedApplication) {
      return { success: false, error: 'Application not found or already reviewed' };
    }

    this.loggingService.logAction({
      character_id: adminPermission.character_id,
      action_type: 'review_citizenship_application',
      action_data: JSON.stringify({ application_id, status, review_message }),
      result: `Application ${application_id} ${status}`
    });

    return {
      success: true,
      application: reviewedApplication,
      message: `Application ${status} successfully`
    };
  }

  private async getCharacterBasicInfo(args: any): Promise<any> {
    const { character_id } = args;

    const characterInfo = this.citizenshipService.getCharacterBasicInfo(character_id);
    if (!characterInfo) {
      return { success: false, error: 'Character not found' };
    }

    return {
      success: true,
      character_info: characterInfo,
      message: 'Character basic information retrieved'
    };
  }

  private async getGameRules(args: any): Promise<any> {
    const gameRules = this.citizenshipService.getGameRules();

    return {
      success: true,
      game_rules: gameRules,
      message: 'Game rules retrieved successfully'
    };
  }

  private async generateVisitorId(args: any): Promise<any> {
    const visitorId = this.citizenshipService.generateUniqueCharacterId();

    return {
      success: true,
      visitor_id: visitorId,
      message: 'Unique visitor ID generated successfully'
    };
  }

  private async getApplicationStats(args: any): Promise<any> {
    const { admin_secret_key } = args;

    // 验证管理员权限
    if (!this.permissionService.validateMinimumPermission(admin_secret_key, PermissionLevel.MANAGER)) {
      return { success: false, error: 'Insufficient permissions. Manager or Super Admin required.' };
    }

    const stats = this.citizenshipService.getApplicationStats();

    return {
      success: true,
      stats,
      message: 'Citizenship application statistics retrieved successfully'
    };
  }
}
