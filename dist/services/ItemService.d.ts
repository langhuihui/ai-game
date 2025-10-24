import { Item, CreateItemData, ItemEffect } from '../models/Item.js';
export declare class ItemService {
    private db;
    createItem(data: CreateItemData): Item;
    getItemById(id: number): Item | null;
    getItemsInScene(sceneId: number): Item[];
    getItemsByCharacter(characterId: number): Item[];
    getAllItems(): Item[];
    pickItem(itemId: number, characterId: number): Item | null;
    dropItem(itemId: number, sceneId: number): Item | null;
    deleteItem(id: number): boolean;
    getItemEffect(itemName: string): ItemEffect | null;
    useItem(itemId: number, characterId: number): {
        item: Item;
        effect: ItemEffect | null;
    } | null;
}
//# sourceMappingURL=ItemService.d.ts.map