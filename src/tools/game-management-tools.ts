import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CitizenshipApplicationService } from '../services/CitizenshipApplicationService.js';
import { IdentityService } from '../services/IdentityService.js';
import { LoggingService } from '../services/LoggingService.js';
import { IdentityRole } from '../models/Identity.js';

export class GameManagementTools {
  private citizenshipService: CitizenshipApplicationService;
  private identityService: IdentityService;
  private loggingService: LoggingService;

  constructor() {
    this.citizenshipService = new CitizenshipApplicationService();
    this.identityService = new IdentityService();
    this.loggingService = new LoggingService();
  }

  getTools(): Tool[] {
    return [
      // 身份验证工具
      {
        name: 'validate_identity',
        description: 'Validate if a secret key has a specific capability',
        inputSchema: {
          type: 'object',
          properties: {
            secret_key: {
              type: 'string',
              description: 'Secret key to validate'
            },
            required_capability: {
              type: 'string',
              description: 'Required capability to check'
            }
          },
          required: ['secret_key', 'required_capability']
        }
      },

      // 公民申请工具
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
        name: 'generate_visitor_id',
        description: 'Generate a unique visitor character ID',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'validate_identity':
          return await this.validateIdentity(args);
        case 'apply_for_citizenship':
          return await this.applyForCitizenship(args);
        case 'review_citizenship_application':
          return await this.reviewApplication(args);
        case 'generate_visitor_id':
          return await this.generateVisitorId(args);
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

  private async validateIdentity(args: any): Promise<any> {
    const { secret_key, required_capability } = args;

    const hasCapability = this.identityService.validateCapability(secret_key, required_capability);
    const identityInfo = this.identityService.getIdentityInfo(secret_key);

    return {
      success: true,
      has_capability: hasCapability,
      identity_info: identityInfo,
      message: hasCapability ? 'Capability granted' : 'Capability denied'
    };
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

  private async reviewApplication(args: any): Promise<any> {
    const { admin_secret_key, application_id, status, review_message } = args;

    // 验证管理员身份
    if (!this.identityService.validateMinimumRole(admin_secret_key, IdentityRole.MANAGER)) {
      return { success: false, error: 'Insufficient identity role. Manager or Super Admin required.' };
    }

    // 获取审核者信息
    const adminIdentity = this.identityService.getIdentityBySecretKey(admin_secret_key);
    if (!adminIdentity || !adminIdentity.character_id) {
      return { success: false, error: 'Invalid admin identity' };
    }

    const reviewedApplication = this.citizenshipService.reviewApplication({
      application_id,
      status,
      review_message,
      reviewer_character_id: adminIdentity.character_id
    });

    if (!reviewedApplication) {
      return { success: false, error: 'Application not found or already reviewed' };
    }

    this.loggingService.logAction({
      character_id: adminIdentity.character_id,
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

  private async generateVisitorId(args: any): Promise<any> {
    const visitorId = this.citizenshipService.generateUniqueCharacterId();

    return {
      success: true,
      visitor_id: visitorId,
      message: 'Unique visitor ID generated successfully'
    };
  }
}
