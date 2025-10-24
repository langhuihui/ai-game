import { Identity, CreateIdentityData, UpdateIdentityData, IdentityRole } from '../models/Identity.js';
export declare class IdentityService {
    private db;
    generateSecretKey(): string;
    createIdentity(data: CreateIdentityData): Identity;
    getIdentityById(id: number): Identity | null;
    getIdentityBySecretKey(secretKey: string): Identity | null;
    getIdentityByCharacterId(characterId: number): Identity | null;
    getAllIdentities(): Identity[];
    getActiveIdentities(): Identity[];
    updateIdentity(id: number, data: UpdateIdentityData): Identity | null;
    deleteIdentity(id: number): boolean;
    deactivateIdentity(id: number): Identity | null;
    activateIdentity(id: number): Identity | null;
    validateCapability(secretKey: string, requiredCapability: string): boolean;
    validateMinimumRole(secretKey: string, requiredRole: IdentityRole): boolean;
    getIdentityInfo(secretKey: string): {
        identity_role: IdentityRole;
        character_id: number | null;
        expires_at?: string;
        is_active: boolean;
    } | null;
    createDefaultIdentity(characterId: number, role?: IdentityRole): Identity;
    createSuperAdminIdentity(): Identity;
    getIdentityStats(): {
        total: number;
        active: number;
        by_role: Record<IdentityRole, number>;
    };
    cleanupExpiredIdentities(): number;
    getFixedSuperAdminKey(): string;
    isFixedSuperAdminKey(secretKey: string): boolean;
    getFixedSuperAdminIdentity(): Identity;
}
//# sourceMappingURL=IdentityService.d.ts.map