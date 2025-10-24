import { Character, CreateCharacterData, UpdateCharacterData, TradeOffer, CreateTradeOfferData, DirectMessage } from '../models/Character.js';
export declare class CharacterService {
    private db;
    createCharacter(data: CreateCharacterData): Character;
    getCharacterById(id: number): Character | null;
    getCharacterByName(name: string): Character | null;
    getAllCharacters(): Character[];
    updateCharacter(id: number, data: UpdateCharacterData): Character | null;
    deleteCharacter(id: number): boolean;
    getCharactersInScene(sceneId: number): Character[];
    moveCharacter(characterId: number, sceneId: number): Character | null;
    updateCharacterHealth(characterId: number, healthChange: number): Character | null;
    updateCharacterMentalState(characterId: number, mentalStateChange: number): Character | null;
    updateCharacterCurrency(characterId: number, currencyChange: number): Character | null;
    createTradeOffer(data: CreateTradeOfferData): TradeOffer;
    getTradeOfferById(id: number): TradeOffer | null;
    getTradeOffersByCharacter(characterId: number): TradeOffer[];
    getPendingTradeOffers(characterId: number): TradeOffer[];
    respondToTradeOffer(offerId: number, response: 'accepted' | 'rejected'): TradeOffer | null;
    private executeTrade;
    cancelTradeOffer(offerId: number): TradeOffer | null;
    sendDirectMessage(fromCharacterId: number, toCharacterId: number, message: string, sceneId: number): DirectMessage;
    getDirectMessageById(id: number): DirectMessage | null;
    getDirectMessages(characterId: number, limit?: number): DirectMessage[];
    getUnreadMessages(characterId: number): DirectMessage[];
    markMessageAsRead(messageId: number): DirectMessage | null;
    markAllMessagesAsRead(characterId: number): void;
}
//# sourceMappingURL=CharacterService.d.ts.map