export interface Character {
    id: number;
    name: string;
    description: string;
    personality: string;
    health: number;
    mental_state: number;
    currency: number;
    current_scene_id: number | null;
    created_at: string;
}
export interface CreateCharacterData {
    name: string;
    description: string;
    personality: string;
    health?: number;
    mental_state?: number;
    currency?: number;
    current_scene_id?: number;
}
export interface UpdateCharacterData {
    name?: string;
    description?: string;
    personality?: string;
    health?: number;
    mental_state?: number;
    currency?: number;
    current_scene_id?: number;
}
export interface TradeOffer {
    id: number;
    from_character_id: number;
    to_character_id: number;
    currency_amount: number;
    item_id?: number;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    created_at: string;
    responded_at?: string;
}
export interface CreateTradeOfferData {
    from_character_id: number;
    to_character_id: number;
    currency_amount: number;
    item_id?: number;
    message?: string;
}
export interface DirectMessage {
    id: number;
    from_character_id: number;
    to_character_id: number;
    message: string;
    scene_id: number;
    created_at: string;
    read: boolean;
}
//# sourceMappingURL=Character.d.ts.map