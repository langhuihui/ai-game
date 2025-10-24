import { Permission, CreatePermissionData, UpdatePermissionData, PermissionLevel } from '../models/Permission.js';
export declare class PermissionService {
    private db;
    generateSecretKey(): string;
    createPermission(data: CreatePermissionData): Permission;
    getPermissionById(id: number): Permission | null;
    getPermissionBySecretKey(secretKey: string): Permission | null;
    getPermissionByCharacterId(characterId: number): Permission | null;
    getAllPermissions(): Permission[];
    getActivePermissions(): Permission[];
    updatePermission(id: number, data: UpdatePermissionData): Permission | null;
    deletePermission(id: number): boolean;
    deactivatePermission(id: number): Permission | null;
    activatePermission(id: number): Permission | null;
    validatePermission(secretKey: string, requiredPermission: string): boolean;
    validateMinimumPermission(secretKey: string, requiredLevel: PermissionLevel): boolean;
    getPermissionInfo(secretKey: string): {
        permission_level: PermissionLevel;
        character_id: number | null;
        expires_at?: string;
        is_active: boolean;
    } | null;
    createDefaultPermission(characterId: number, level?: PermissionLevel): Permission;
    createSuperAdminPermission(): Permission;
    getPermissionStats(): {
        total: number;
        active: number;
        by_level: Record<PermissionLevel, number>;
    };
    cleanupExpiredPermissions(): number;
    getFixedSuperAdminKey(): string;
    isFixedSuperAdminKey(secretKey: string): boolean;
    getFixedSuperAdminPermission(): Permission;
}
//# sourceMappingURL=PermissionService.d.ts.map