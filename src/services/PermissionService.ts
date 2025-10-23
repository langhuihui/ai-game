import { gameDb } from '../database.js';
import {
  Permission,
  CreatePermissionData,
  UpdatePermissionData,
  PermissionLevel,
  hasPermission,
  hasMinimumPermission
} from '../models/Permission.js';
import crypto from 'crypto';

export class PermissionService {
  private db = gameDb.getDatabase();

  // 生成随机秘钥
  generateSecretKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // 创建权限
  createPermission(data: CreatePermissionData): Permission {
    const stmt = this.db.prepare(`
      INSERT INTO permissions (character_id, permission_level, secret_key, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.character_id ?? null,
      data.permission_level,
      data.secret_key,
      data.expires_at ?? null,
      1
    );

    return this.getPermissionById(result.lastInsertRowid as number)!;
  }

  // 根据ID获取权限
  getPermissionById(id: number): Permission | null {
    const stmt = this.db.prepare('SELECT * FROM permissions WHERE id = ?');
    return stmt.get(id) as Permission | null;
  }

  // 根据秘钥获取权限
  getPermissionBySecretKey(secretKey: string): Permission | null {
    const stmt = this.db.prepare(`
      SELECT * FROM permissions 
      WHERE secret_key = ? AND is_active = TRUE 
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `);
    return stmt.get(secretKey) as Permission | null;
  }

  // 根据角色ID获取权限
  getPermissionByCharacterId(characterId: number): Permission | null {
    const stmt = this.db.prepare(`
      SELECT * FROM permissions 
      WHERE character_id = ? AND is_active = TRUE 
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `);
    return stmt.get(characterId) as Permission | null;
  }

  // 获取所有权限
  getAllPermissions(): Permission[] {
    const stmt = this.db.prepare('SELECT * FROM permissions ORDER BY created_at DESC');
    return stmt.all() as Permission[];
  }

  // 获取活跃权限
  getActivePermissions(): Permission[] {
    const stmt = this.db.prepare(`
      SELECT * FROM permissions 
      WHERE is_active = TRUE 
      AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC
    `);
    return stmt.all() as Permission[];
  }

  // 更新权限
  updatePermission(id: number, data: UpdatePermissionData): Permission | null {
    const fields = [];
    const values = [];

    if (data.permission_level !== undefined) {
      fields.push('permission_level = ?');
      values.push(data.permission_level);
    }
    if (data.expires_at !== undefined) {
      fields.push('expires_at = ?');
      values.push(data.expires_at);
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(data.is_active ? 1 : 0);
    }

    if (fields.length === 0) {
      return this.getPermissionById(id);
    }

    const stmt = this.db.prepare(`UPDATE permissions SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getPermissionById(id);
  }

  // 删除权限
  deletePermission(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM permissions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 停用权限
  deactivatePermission(id: number): Permission | null {
    return this.updatePermission(id, { is_active: false });
  }

  // 激活权限
  activatePermission(id: number): Permission | null {
    return this.updatePermission(id, { is_active: true });
  }

  // 验证权限
  validatePermission(secretKey: string, requiredPermission: string): boolean {
    // 首先检查是否为固定超级管理员秘钥
    if (this.isFixedSuperAdminKey(secretKey)) {
      return true; // 固定超级管理员拥有所有权限
    }

    const permission = this.getPermissionBySecretKey(secretKey);
    if (!permission) return false;

    return hasPermission(permission.permission_level, requiredPermission);
  }

  // 验证最低权限等级
  validateMinimumPermission(secretKey: string, requiredLevel: PermissionLevel): boolean {
    // 首先检查是否为固定超级管理员秘钥
    if (this.isFixedSuperAdminKey(secretKey)) {
      return true; // 固定超级管理员拥有所有权限
    }

    const permission = this.getPermissionBySecretKey(secretKey);
    if (!permission) return false;

    return hasMinimumPermission(permission.permission_level, requiredLevel);
  }

  // 获取权限信息（不包含敏感信息）
  getPermissionInfo(secretKey: string): {
    permission_level: PermissionLevel;
    character_id: number | null;
    expires_at?: string;
    is_active: boolean;
  } | null {
    // 首先检查是否为固定超级管理员秘钥
    if (this.isFixedSuperAdminKey(secretKey)) {
      const fixedPermission = this.getFixedSuperAdminPermission();
      return {
        permission_level: fixedPermission.permission_level,
        character_id: fixedPermission.character_id,
        expires_at: fixedPermission.expires_at,
        is_active: fixedPermission.is_active
      };
    }

    const permission = this.getPermissionBySecretKey(secretKey);
    if (!permission) return null;

    return {
      permission_level: permission.permission_level,
      character_id: permission.character_id,
      expires_at: permission.expires_at,
      is_active: permission.is_active
    };
  }

  // 为角色创建默认权限
  createDefaultPermission(characterId: number, level: PermissionLevel = PermissionLevel.VISITOR): Permission {
    const secretKey = this.generateSecretKey();
    return this.createPermission({
      character_id: characterId,
      permission_level: level,
      secret_key: secretKey
    });
  }

  // 创建超级管理员权限（不关联角色）
  createSuperAdminPermission(): Permission {
    const secretKey = this.generateSecretKey();
    return this.createPermission({
      permission_level: PermissionLevel.SUPER_ADMIN,
      secret_key: secretKey
    });
  }

  // 获取权限统计
  getPermissionStats(): {
    total: number;
    active: number;
    by_level: Record<PermissionLevel, number>;
  } {
    const allPermissions = this.getAllPermissions();
    const activePermissions = this.getActivePermissions();

    const byLevel: Record<PermissionLevel, number> = {
      [PermissionLevel.PRISONER]: 0,
      [PermissionLevel.VISITOR]: 0,
      [PermissionLevel.CITIZEN]: 0,
      [PermissionLevel.MANAGER]: 0,
      [PermissionLevel.SUPER_ADMIN]: 0
    };

    activePermissions.forEach(permission => {
      byLevel[permission.permission_level]++;
    });

    return {
      total: allPermissions.length,
      active: activePermissions.length,
      by_level: byLevel
    };
  }

  // 清理过期权限
  cleanupExpiredPermissions(): number {
    const stmt = this.db.prepare(`
      UPDATE permissions 
      SET is_active = FALSE 
      WHERE expires_at IS NOT NULL 
      AND expires_at <= datetime('now') 
      AND is_active = TRUE
    `);
    const result = stmt.run();
    return result.changes;
  }

  // 获取固定的超级管理员秘钥
  getFixedSuperAdminKey(): string {
    return 'super_admin_fixed_key_2024_ai_game_server_management_only';
  }

  // 验证是否为固定的超级管理员秘钥
  isFixedSuperAdminKey(secretKey: string): boolean {
    return secretKey === this.getFixedSuperAdminKey();
  }

  // 获取固定超级管理员权限信息
  getFixedSuperAdminPermission(): Permission {
    return {
      id: -1, // 特殊ID表示固定超级管理员
      character_id: null,
      permission_level: PermissionLevel.SUPER_ADMIN,
      secret_key: this.getFixedSuperAdminKey(),
      created_at: new Date().toISOString(),
      expires_at: undefined,
      is_active: true
    };
  }
}
