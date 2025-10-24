import { gameDb } from '../database.js';
export class ItemService {
    db = gameDb.getDatabase();
    createItem(data) {
        const stmt = this.db.prepare(`
      INSERT INTO items (name, description, scene_id, character_id)
      VALUES (?, ?, ?, ?)
    `);
        const result = stmt.run(data.name, data.description, data.scene_id ?? null, data.character_id ?? null);
        return this.getItemById(result.lastInsertRowid);
    }
    getItemById(id) {
        const stmt = this.db.prepare('SELECT * FROM items WHERE id = ?');
        return stmt.get(id);
    }
    getItemsInScene(sceneId) {
        const stmt = this.db.prepare('SELECT * FROM items WHERE scene_id = ? AND character_id IS NULL');
        return stmt.all(sceneId);
    }
    getItemsByCharacter(characterId) {
        const stmt = this.db.prepare('SELECT * FROM items WHERE character_id = ?');
        return stmt.all(characterId);
    }
    getAllItems() {
        const stmt = this.db.prepare('SELECT * FROM items ORDER BY created_at DESC');
        return stmt.all();
    }
    pickItem(itemId, characterId) {
        const item = this.getItemById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        if (item.character_id !== null) {
            throw new Error('Item is already owned by someone');
        }
        const stmt = this.db.prepare(`
      UPDATE items 
      SET scene_id = NULL, character_id = ? 
      WHERE id = ?
    `);
        stmt.run(characterId, itemId);
        return this.getItemById(itemId);
    }
    dropItem(itemId, sceneId) {
        const item = this.getItemById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        if (item.character_id === null) {
            throw new Error('Item is not owned by anyone');
        }
        const stmt = this.db.prepare(`
      UPDATE items 
      SET scene_id = ?, character_id = NULL 
      WHERE id = ?
    `);
        stmt.run(sceneId, itemId);
        return this.getItemById(itemId);
    }
    deleteItem(id) {
        const stmt = this.db.prepare('DELETE FROM items WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    // Predefined item effects - can be extended
    getItemEffect(itemName) {
        const effects = {
            'health_potion': {
                health_change: 20,
                description: 'Restores 20 health points'
            },
            'mental_tonic': {
                mental_state_change: 15,
                description: 'Improves mental state by 15 points'
            },
            'poison': {
                health_change: -30,
                description: 'Reduces health by 30 points'
            },
            'stress_relief': {
                mental_state_change: 25,
                description: 'Significantly improves mental state'
            },
            'energy_drink': {
                health_change: 10,
                mental_state_change: 10,
                description: 'Provides a small boost to both health and mental state'
            }
        };
        return effects[itemName.toLowerCase()] || null;
    }
    useItem(itemId, characterId) {
        const item = this.getItemById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }
        if (item.character_id !== characterId) {
            throw new Error('Character does not own this item');
        }
        const effect = this.getItemEffect(item.name);
        // Delete the item after use (consumable)
        this.deleteItem(itemId);
        return { item, effect };
    }
}
//# sourceMappingURL=ItemService.js.map