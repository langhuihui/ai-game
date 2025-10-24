export declare enum PermissionLevel {
    PRISONER = "prisoner",// 囚犯 - 无权限，只能查询自己信息
    VISITOR = "visitor",// 游客 - 基础权限
    CITIZEN = "citizen",// 公民 - 标准权限
    MANAGER = "manager",// 管理者 - 高级权限
    SUPER_ADMIN = "super_admin"
}
export interface Permission {
    id: number;
    character_id: number | null;
    permission_level: PermissionLevel;
    secret_key: string;
    created_at: string;
    expires_at?: string;
    is_active: boolean;
}
export interface CreatePermissionData {
    character_id?: number;
    permission_level: PermissionLevel;
    secret_key: string;
    expires_at?: string;
}
export interface UpdatePermissionData {
    permission_level?: PermissionLevel;
    expires_at?: string;
    is_active?: boolean;
}
export declare const PERMISSION_DEFINITIONS: {
    prisoner: {
        name: string;
        description: string;
        permissions: string[];
    };
    visitor: {
        name: string;
        description: string;
        permissions: string[];
    };
    citizen: {
        name: string;
        description: string;
        permissions: string[];
    };
    manager: {
        name: string;
        description: string;
        permissions: string[];
    };
    super_admin: {
        name: string;
        description: string;
        permissions: string[];
    };
};
export declare function hasPermission(permissionLevel: PermissionLevel, requiredPermission: string): boolean;
export declare function comparePermissionLevels(level1: PermissionLevel, level2: PermissionLevel): number;
export declare function hasMinimumPermission(userLevel: PermissionLevel, requiredLevel: PermissionLevel): boolean;
//# sourceMappingURL=Permission.d.ts.map