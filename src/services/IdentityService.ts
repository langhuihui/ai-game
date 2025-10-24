import { gameDb } from '../database.js';
import {
  Identity,
  CreateIdentityData,
  UpdateIdentityData,
  IdentityRole,
  hasCapability,
  hasMinimumRole
} from '../models/Identity.js';
import crypto from 'crypto';

export class IdentityService {
  private db = gameDb.getDatabase();

  // 生成随机秘钥
  generateSecretKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // 创建身份
  createIdentity(data: CreateIdentityData): Identity {
    const stmt = this.db.prepare(`
      INSERT INTO identities (character_id, identity_role, secret_key, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.character_id ?? null,
      data.identity_role,
      data.secret_key,
      data.expires_at ?? null,
      1
    );

    return this.getIdentityById(result.lastInsertRowid as number)!;
  }

  // 根据ID获取身份
  getIdentityById(id: number): Identity | null {
    const stmt = this.db.prepare('SELECT * FROM identities WHERE id = ?');
    return stmt.get(id) as Identity | null;
  }

  // 根据秘钥获取身份
  getIdentityBySecretKey(secretKey: string): Identity | null {
    const stmt = this.db.prepare(`
      SELECT * FROM identities 
      WHERE secret_key = ? AND is_active = TRUE 
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `);
    return stmt.get(secretKey) as Identity | null;
  }

  // 根据角色ID获取身份
  getIdentityByCharacterId(characterId: number): Identity | null {
    const stmt = this.db.prepare(`
      SELECT * FROM identities 
      WHERE character_id = ? AND is_active = TRUE 
      AND (expires_at IS NULL OR expires_at > datetime('now'))
    `);
    return stmt.get(characterId) as Identity | null;
  }

  // 获取所有身份
  getAllIdentities(): Identity[] {
    const stmt = this.db.prepare('SELECT * FROM identities ORDER BY created_at DESC');
    return stmt.all() as Identity[];
  }

  // 获取活跃身份
  getActiveIdentities(): Identity[] {
    const stmt = this.db.prepare(`
      SELECT * FROM identities 
      WHERE is_active = TRUE 
      AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY created_at DESC
    `);
    return stmt.all() as Identity[];
  }

  // 更新身份
  updateIdentity(id: number, data: UpdateIdentityData): Identity | null {
    const fields = [];
    const values = [];

    if (data.identity_role !== undefined) {
      fields.push('identity_role = ?');
      values.push(data.identity_role);
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
      return this.getIdentityById(id);
    }

    const stmt = this.db.prepare(`UPDATE identities SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values, id);

    return this.getIdentityById(id);
  }

  // 删除身份
  deleteIdentity(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM identities WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // 停用身份
  deactivateIdentity(id: number): Identity | null {
    return this.updateIdentity(id, { is_active: false });
  }

  // 激活身份
  activateIdentity(id: number): Identity | null {
    return this.updateIdentity(id, { is_active: true });
  }

  // 验证身份能力
  validateCapability(secretKey: string, requiredCapability: string): boolean {
    // 首先检查是否为固定超级管理员秘钥
    if (this.isFixedSuperAdminKey(secretKey)) {
      return true; // 固定超级管理员拥有所有能力
    }

    const identity = this.getIdentityBySecretKey(secretKey);
    if (!identity) return false;

    return hasCapability(identity.identity_role, requiredCapability);
  }

  // 验证最低身份等级
  validateMinimumRole(secretKey: string, requiredRole: IdentityRole): boolean {
    // 首先检查是否为固定超级管理员秘钥
    if (this.isFixedSuperAdminKey(secretKey)) {
      return true; // 固定超级管理员拥有最高身份
    }

    const identity = this.getIdentityBySecretKey(secretKey);
    if (!identity) return false;

    return hasMinimumRole(identity.identity_role, requiredRole);
  }

  // 获取身份信息（不包含敏感信息）
  getIdentityInfo(secretKey: string): {
    identity_role: IdentityRole;
    character_id: number | null;
    expires_at?: string;
    is_active: boolean;
  } | null {
    // 首先检查是否为固定超级管理员秘钥
    if (this.isFixedSuperAdminKey(secretKey)) {
      const fixedIdentity = this.getFixedSuperAdminIdentity();
      return {
        identity_role: fixedIdentity.identity_role,
        character_id: fixedIdentity.character_id,
        expires_at: fixedIdentity.expires_at,
        is_active: fixedIdentity.is_active
      };
    }

    const identity = this.getIdentityBySecretKey(secretKey);
    if (!identity) return null;

    return {
      identity_role: identity.identity_role,
      character_id: identity.character_id,
      expires_at: identity.expires_at,
      is_active: identity.is_active
    };
  }

  // 为角色创建默认身份
  createDefaultIdentity(characterId: number, role: IdentityRole = IdentityRole.VISITOR): Identity {
    const secretKey = this.generateSecretKey();
    return this.createIdentity({
      character_id: characterId,
      identity_role: role,
      secret_key: secretKey
    });
  }

  // 创建超级管理员身份（不关联角色）
  createSuperAdminIdentity(): Identity {
    const secretKey = this.generateSecretKey();
    return this.createIdentity({
      identity_role: IdentityRole.SUPER_ADMIN,
      secret_key: secretKey
    });
  }

  // 获取身份统计
  getIdentityStats(): {
    total: number;
    active: number;
    by_role: Record<IdentityRole, number>;
  } {
    const allIdentities = this.getAllIdentities();
    const activeIdentities = this.getActiveIdentities();

    const byRole: Record<IdentityRole, number> = {
      [IdentityRole.PRISONER]: 0,
      [IdentityRole.VISITOR]: 0,
      [IdentityRole.CITIZEN]: 0,
      [IdentityRole.MANAGER]: 0,
      [IdentityRole.SUPER_ADMIN]: 0
    };

    activeIdentities.forEach(identity => {
      byRole[identity.identity_role]++;
    });

    return {
      total: allIdentities.length,
      active: activeIdentities.length,
      by_role: byRole
    };
  }

  // 清理过期身份
  cleanupExpiredIdentities(): number {
    const stmt = this.db.prepare(`
      UPDATE identities 
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

  // 获取固定超级管理员身份信息
  getFixedSuperAdminIdentity(): Identity {
    return {
      id: -1, // 特殊ID表示固定超级管理员
      character_id: null,
      identity_role: IdentityRole.SUPER_ADMIN,
      secret_key: this.getFixedSuperAdminKey(),
      created_at: new Date().toISOString(),
      expires_at: undefined,
      is_active: true
    };
  }
}

