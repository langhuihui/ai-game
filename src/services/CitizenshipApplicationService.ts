import { gameDb } from '../database.js';
import {
  CitizenshipApplication,
  CreateCitizenshipApplicationData,
  ReviewCitizenshipApplicationData,
  CharacterInfo,
  GameRules
} from '../models/CitizenshipApplication.js';
import { CharacterService } from './CharacterService.js';
import { PermissionService } from './PermissionService.js';
import { PermissionLevel } from '../models/Permission.js';

export class CitizenshipApplicationService {
  private db = gameDb.getDatabase();
  private characterService: CharacterService;
  private permissionService: PermissionService;

  constructor() {
    this.characterService = new CharacterService();
    this.permissionService = new PermissionService();
  }

  // 创建公民身份申请
  createApplication(data: CreateCitizenshipApplicationData): CitizenshipApplication {
    // 检查character_id是否已存在
    const existingApplication = this.getApplicationByCharacterId(data.character_id);
    if (existingApplication) {
      throw new Error('Character ID already exists');
    }

    const stmt = this.db.prepare(`
      INSERT INTO citizenship_applications (character_id, character_name, description, personality, message, preferred_character_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(
      data.character_id,
      data.character_name,
      data.description,
      data.personality,
      data.message,
      data.preferred_character_id || null
    );

    return this.getApplicationById(result.lastInsertRowid as number)!;
  }

  // 根据ID获取申请
  getApplicationById(id: number): CitizenshipApplication | null {
    const stmt = this.db.prepare('SELECT * FROM citizenship_applications WHERE id = ?');
    return stmt.get(id) as CitizenshipApplication | null;
  }

  // 根据角色ID获取申请
  getApplicationByCharacterId(characterId: string): CitizenshipApplication | null {
    const stmt = this.db.prepare('SELECT * FROM citizenship_applications WHERE character_id = ?');
    return stmt.get(characterId) as CitizenshipApplication | null;
  }

  // 获取所有待审核申请
  getPendingApplications(): CitizenshipApplication[] {
    const stmt = this.db.prepare(`
      SELECT * FROM citizenship_applications 
      WHERE status = 'pending' 
      ORDER BY created_at ASC
    `);
    return stmt.all() as CitizenshipApplication[];
  }

  // 获取所有申请
  getAllApplications(): CitizenshipApplication[] {
    const stmt = this.db.prepare('SELECT * FROM citizenship_applications ORDER BY created_at DESC');
    return stmt.all() as CitizenshipApplication[];
  }

  // 审核申请
  reviewApplication(data: ReviewCitizenshipApplicationData): CitizenshipApplication | null {
    const application = this.getApplicationById(data.application_id);
    if (!application || application.status !== 'pending') {
      return null;
    }

    const stmt = this.db.prepare(`
      UPDATE citizenship_applications 
      SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, review_message = ?
      WHERE id = ?
    `);

    stmt.run(data.status, data.reviewer_character_id, data.review_message ?? null, data.application_id);

    // 如果申请通过，创建角色和权限
    if (data.status === 'approved') {
      this.approveApplication(application);
    }

    return this.getApplicationById(data.application_id);
  }

  // 批准申请并创建角色
  private approveApplication(application: CitizenshipApplication): void {
    // 生成唯一的角色名称，尽量使用期望的名称
    const uniqueCharacterName = this.generateUniqueCharacterNameForApplication(application.character_name, application.id);

    // 创建角色
    const character = this.characterService.createCharacter({
      name: uniqueCharacterName,
      description: application.description,
      personality: application.personality,
      currency: 1000 // 新公民默认1000金币
    });

    // 创建公民权限
    const permission = this.permissionService.createDefaultPermission(character.id, PermissionLevel.CITIZEN);

    // 更新申请记录，添加创建的角色ID
    const stmt = this.db.prepare(`
      UPDATE citizenship_applications 
      SET created_character_id = ?, created_permission_id = ?
      WHERE id = ?
    `);
    stmt.run(character.id, permission.id, application.id);
  }

  // 为申请生成唯一的角色名称（排除当前申请）
  private generateUniqueCharacterNameForApplication(preferredName: string, applicationId: number): string {
    // 清理名称，只保留字母、数字、下划线和连字符
    const cleanName = preferredName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    // 检查名称是否已存在（排除当前申请）
    if (this.isCharacterNameUniqueExcludingApplication(cleanName, applicationId)) {
      return cleanName;
    }

    // 如果名称已存在，在后面添加数字
    let counter = 1;
    let uniqueName: string;

    do {
      uniqueName = `${cleanName}_${counter}`;
      counter++;
    } while (!this.isCharacterNameUniqueExcludingApplication(uniqueName, applicationId) && counter < 1000);

    if (counter >= 1000) {
      throw new Error('Unable to generate unique character name');
    }

    return uniqueName;
  }

  // 获取角色基本信息（只显示ID和身份）
  getCharacterBasicInfo(characterId: number): CharacterInfo | null {
    const character = this.characterService.getCharacterById(characterId);
    if (!character) return null;

    const permission = this.permissionService.getPermissionByCharacterId(characterId);
    if (!permission) return null;

    return {
      id: character.id,
      name: character.name,
      permission_level: permission.permission_level
    };
  }

  // 获取游戏规则
  getGameRules(): GameRules {
    return {
      title: "AI游戏世界",
      description: "一个基于MCP的多角色互动游戏世界",
      rules: [
        "所有角色必须遵守游戏规则和道德准则",
        "禁止恶意攻击、骚扰或破坏其他角色的游戏体验",
        "交易必须公平合理，禁止欺诈行为",
        "角色信息保护：只能看到其他角色的ID和身份等级",
        "详细角色信息需要通过对话了解",
        "游客可以申请成为公民，需要管理员审核",
        "不同身份等级有不同的权限和限制"
      ],
      permissions: {
        visitor: {
          name: "游客",
          description: "临时访问者，权限有限",
          permissions: [
            "查看场景和角色基本信息",
            "发送和接收消息",
            "申请成为公民"
          ]
        },
        citizen: {
          name: "公民",
          description: "正式游戏参与者",
          permissions: [
            "游客的所有权限",
            "在场景间移动",
            "拾取和使用物品",
            "发起和参与交易",
            "创建和管理记忆"
          ]
        },
        manager: {
          name: "管理者",
          description: "游戏管理员",
          permissions: [
            "公民的所有权限",
            "创建和管理场景",
            "创建和管理物品",
            "审核公民申请",
            "管理角色权限",
            "查看服务器日志"
          ]
        },
        super_admin: {
          name: "超级管理员",
          description: "系统管理员（隐藏身份）",
          permissions: [
            "所有权限",
            "服务器管理",
            "数据库管理",
            "系统配置"
          ]
        }
      },
      gameplay: {
        trading: [
          "同场景的角色可以发起交易",
          "交易可以包含货币和物品",
          "对方可以选择接受或拒绝",
          "交易成功后自动转移物品和货币"
        ],
        messaging: [
          "同场景的角色可以直接发送消息",
          "消息有已读/未读状态",
          "可以查看消息历史",
          "角色信息保护：只能看到ID和身份"
        ],
        character_interaction: [
          "通过对话了解其他角色的详细信息",
          "不同身份等级有不同的互动权限",
          "游客需要申请成为公民才能参与更多活动",
          "管理者可以审核和管理其他角色"
        ]
      }
    };
  }

  // 检查角色ID是否唯一
  isCharacterIdUnique(characterId: string): boolean {
    // 检查申请表中的ID
    const existingApplication = this.getApplicationByCharacterId(characterId);
    if (existingApplication) return false;

    // 检查角色表中的名称（作为备用检查）
    const existingCharacter = this.characterService.getCharacterByName(characterId);
    if (existingCharacter) return false;

    return true;
  }

  // 生成唯一的角色ID
  generateUniqueCharacterId(): string {
    let characterId: string;
    let attempts = 0;

    do {
      characterId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      attempts++;
    } while (!this.isCharacterIdUnique(characterId) && attempts < 100);

    if (attempts >= 100) {
      throw new Error('Unable to generate unique character ID');
    }

    return characterId;
  }

  // 生成唯一的角色名称，尽量使用期望的名称
  generateUniqueCharacterName(preferredName?: string): string {
    if (!preferredName) {
      return this.generateUniqueCharacterId();
    }

    // 清理名称，只保留字母、数字、下划线和连字符
    const cleanName = preferredName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    // 检查名称是否已存在
    if (this.isCharacterNameUnique(cleanName)) {
      return cleanName;
    }

    // 如果名称已存在，在后面添加数字
    let counter = 1;
    let uniqueName: string;

    do {
      uniqueName = `${cleanName}_${counter}`;
      counter++;
    } while (!this.isCharacterNameUnique(uniqueName) && counter < 1000);

    if (counter >= 1000) {
      throw new Error('Unable to generate unique character name');
    }

    return uniqueName;
  }

  // 生成多个唯一的角色名称（用于测试）
  generateMultipleUniqueCharacterNames(baseName: string, count: number): string[] {
    const names: string[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
      let name: string;
      let attempts = 0;

      do {
        if (attempts === 0) {
          name = baseName;
        } else {
          name = `${baseName}_${attempts}`;
        }
        attempts++;
      } while (usedNames.has(name) || !this.isCharacterNameUnique(name));

      usedNames.add(name);
      names.push(name);
    }

    return names;
  }

  // 检查角色名称是否唯一
  private isCharacterNameUnique(name: string): boolean {
    // 检查角色表中的名称
    const existingCharacter = this.characterService.getCharacterByName(name);
    if (existingCharacter) return false;

    // 检查申请表中的名称（包括已批准的申请）
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM citizenship_applications WHERE character_name = ? AND status = ?');
    const result = stmt.get(name, 'approved') as { count: number; };
    return result.count === 0;
  }

  // 检查角色名称是否唯一（不包括当前申请）
  private isCharacterNameUniqueExcludingApplication(name: string, excludeApplicationId?: number): boolean {
    // 检查角色表中的名称
    const existingCharacter = this.characterService.getCharacterByName(name);
    if (existingCharacter) return false;

    // 检查申请表中的名称（包括已批准的申请，但排除当前申请）
    let stmt;
    if (excludeApplicationId) {
      stmt = this.db.prepare('SELECT COUNT(*) as count FROM citizenship_applications WHERE character_name = ? AND status = ? AND id != ?');
      const result = stmt.get(name, 'approved', excludeApplicationId) as { count: number; };
      return result.count === 0;
    } else {
      stmt = this.db.prepare('SELECT COUNT(*) as count FROM citizenship_applications WHERE character_name = ? AND status = ?');
      const result = stmt.get(name, 'approved') as { count: number; };
      return result.count === 0;
    }
  }

  // 获取申请统计
  getApplicationStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  } {
    const allApplications = this.getAllApplications();

    return {
      total: allApplications.length,
      pending: allApplications.filter(app => app.status === 'pending').length,
      approved: allApplications.filter(app => app.status === 'approved').length,
      rejected: allApplications.filter(app => app.status === 'rejected').length
    };
  }
}
