export interface CitizenshipApplication {
    id: number;
    character_id: string;
    character_name: string;
    description: string;
    personality: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    reviewed_at?: string;
    reviewed_by?: number;
    review_message?: string;
}
export interface CreateCitizenshipApplicationData {
    character_id: string;
    character_name: string;
    description: string;
    personality: string;
    message: string;
    preferred_character_id?: string;
}
export interface ReviewCitizenshipApplicationData {
    application_id: number;
    status: 'approved' | 'rejected';
    review_message?: string;
    reviewer_character_id: number;
}
export interface CharacterInfo {
    id: number;
    name: string;
    identity_role: string;
}
export interface GameRules {
    title: string;
    description: string;
    rules: string[];
    identities: {
        [key: string]: {
            name: string;
            description: string;
            capabilities: string[];
        };
    };
    gameplay: {
        trading: string[];
        messaging: string[];
        character_interaction: string[];
    };
}
//# sourceMappingURL=CitizenshipApplication.d.ts.map