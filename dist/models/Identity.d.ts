export declare enum IdentityRole {
    PRISONER = "prisoner",// 囚犯 - 无身份，只能查询自己信息
    VISITOR = "visitor",// 游客 - 基础身份
    CITIZEN = "citizen",// 公民 - 标准身份
    MANAGER = "manager",// 管理者 - 高级身份
    SUPER_ADMIN = "super_admin"
}
export interface Identity {
    id: number;
    character_id: number | null;
    identity_role: IdentityRole;
    secret_key: string;
    created_at: string;
    expires_at?: string;
    is_active: boolean;
}
export interface CreateIdentityData {
    character_id?: number;
    identity_role: IdentityRole;
    secret_key: string;
    expires_at?: string;
}
export interface UpdateIdentityData {
    identity_role?: IdentityRole;
    expires_at?: string;
    is_active?: boolean;
}
export declare const IDENTITY_DEFINITIONS: {
    prisoner: {
        name: string;
        description: string;
        capabilities: string[];
    };
    visitor: {
        name: string;
        description: string;
        capabilities: string[];
    };
    citizen: {
        name: string;
        description: string;
        capabilities: string[];
    };
    manager: {
        name: string;
        description: string;
        capabilities: string[];
    };
    super_admin: {
        name: string;
        description: string;
        capabilities: string[];
    };
};
export declare function hasCapability(identityRole: IdentityRole, requiredCapability: string): boolean;
export declare function compareIdentityRoles(role1: IdentityRole, role2: IdentityRole): number;
export declare function hasMinimumRole(userRole: IdentityRole, requiredRole: IdentityRole): boolean;
//# sourceMappingURL=Identity.d.ts.map