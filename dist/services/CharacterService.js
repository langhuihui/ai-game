import { gameDb } from '../database.js';
export class CharacterService {
    db = gameDb.getDatabase();
    createCharacter(data) {
        const stmt = this.db.prepare(`
      INSERT INTO characters (name, description, personality, health, mental_state, currency, current_scene_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const result = stmt.run(data.name, data.description, data.personality, data.health ?? 100, data.mental_state ?? 100, data.currency ?? 1000, data.current_scene_id ?? null);
        return this.getCharacterById(result.lastInsertRowid);
    }
    getCharacterById(id) {
        const stmt = this.db.prepare('SELECT * FROM characters WHERE id = ?');
        return stmt.get(id);
    }
    getCharacterByName(name) {
        const stmt = this.db.prepare('SELECT * FROM characters WHERE name = ?');
        return stmt.get(name);
    }
    getAllCharacters() {
        const stmt = this.db.prepare('SELECT * FROM characters ORDER BY created_at DESC');
        return stmt.all();
    }
    updateCharacter(id, data) {
        const fields = [];
        const values = [];
        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.personality !== undefined) {
            fields.push('personality = ?');
            values.push(data.personality);
        }
        if (data.health !== undefined) {
            fields.push('health = ?');
            values.push(data.health);
        }
        if (data.mental_state !== undefined) {
            fields.push('mental_state = ?');
            values.push(data.mental_state);
        }
        if (data.currency !== undefined) {
            fields.push('currency = ?');
            values.push(data.currency);
        }
        if (data.current_scene_id !== undefined) {
            fields.push('current_scene_id = ?');
            values.push(data.current_scene_id);
        }
        if (fields.length === 0) {
            return this.getCharacterById(id);
        }
        const stmt = this.db.prepare(`UPDATE characters SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values, id);
        return this.getCharacterById(id);
    }
    deleteCharacter(id) {
        const stmt = this.db.prepare('DELETE FROM characters WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
    getCharactersInScene(sceneId) {
        const stmt = this.db.prepare('SELECT * FROM characters WHERE current_scene_id = ?');
        return stmt.all(sceneId);
    }
    moveCharacter(characterId, sceneId) {
        return this.updateCharacter(characterId, { current_scene_id: sceneId });
    }
    updateCharacterHealth(characterId, healthChange) {
        const character = this.getCharacterById(characterId);
        if (!character)
            return null;
        const newHealth = Math.max(0, Math.min(100, character.health + healthChange));
        return this.updateCharacter(characterId, { health: newHealth });
    }
    updateCharacterMentalState(characterId, mentalStateChange) {
        const character = this.getCharacterById(characterId);
        if (!character)
            return null;
        const newMentalState = Math.max(0, Math.min(100, character.mental_state + mentalStateChange));
        return this.updateCharacter(characterId, { mental_state: newMentalState });
    }
    updateCharacterCurrency(characterId, currencyChange) {
        const character = this.getCharacterById(characterId);
        if (!character)
            return null;
        const newCurrency = Math.max(0, character.currency + currencyChange);
        return this.updateCharacter(characterId, { currency: newCurrency });
    }
    // Trade system methods
    createTradeOffer(data) {
        const stmt = this.db.prepare(`
      INSERT INTO trade_offers (from_character_id, to_character_id, currency_amount, item_id, message)
      VALUES (?, ?, ?, ?, ?)
    `);
        const result = stmt.run(data.from_character_id, data.to_character_id, data.currency_amount, data.item_id ?? null, data.message ?? null);
        return this.getTradeOfferById(result.lastInsertRowid);
    }
    getTradeOfferById(id) {
        const stmt = this.db.prepare('SELECT * FROM trade_offers WHERE id = ?');
        return stmt.get(id);
    }
    getTradeOffersByCharacter(characterId) {
        const stmt = this.db.prepare(`
      SELECT * FROM trade_offers 
      WHERE from_character_id = ? OR to_character_id = ?
      ORDER BY created_at DESC
    `);
        return stmt.all(characterId, characterId);
    }
    getPendingTradeOffers(characterId) {
        const stmt = this.db.prepare(`
      SELECT * FROM trade_offers 
      WHERE to_character_id = ? AND status = 'pending'
      ORDER BY created_at DESC
    `);
        return stmt.all(characterId);
    }
    respondToTradeOffer(offerId, response) {
        const offer = this.getTradeOfferById(offerId);
        if (!offer || offer.status !== 'pending') {
            return null;
        }
        const stmt = this.db.prepare(`
      UPDATE trade_offers 
      SET status = ?, responded_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
        stmt.run(response, offerId);
        if (response === 'accepted') {
            // Execute the trade
            this.executeTrade(offer);
        }
        return this.getTradeOfferById(offerId);
    }
    executeTrade(offer) {
        const transaction = this.db.transaction(() => {
            // Transfer currency
            if (offer.currency_amount > 0) {
                const fromCharacter = this.getCharacterById(offer.from_character_id);
                const toCharacter = this.getCharacterById(offer.to_character_id);
                if (fromCharacter && toCharacter && fromCharacter.currency >= offer.currency_amount) {
                    this.updateCharacterCurrency(offer.from_character_id, -offer.currency_amount);
                    this.updateCharacterCurrency(offer.to_character_id, offer.currency_amount);
                }
            }
            // Transfer item if specified
            if (offer.item_id) {
                const stmt = this.db.prepare(`
          UPDATE items 
          SET character_id = ? 
          WHERE id = ? AND character_id = ?
        `);
                stmt.run(offer.to_character_id, offer.item_id, offer.from_character_id);
            }
        });
        transaction();
    }
    cancelTradeOffer(offerId) {
        const offer = this.getTradeOfferById(offerId);
        if (!offer || offer.status !== 'pending') {
            return null;
        }
        const stmt = this.db.prepare(`
      UPDATE trade_offers 
      SET status = 'cancelled', responded_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
        stmt.run(offerId);
        return this.getTradeOfferById(offerId);
    }
    // Direct messaging methods
    sendDirectMessage(fromCharacterId, toCharacterId, message, sceneId) {
        const stmt = this.db.prepare(`
      INSERT INTO direct_messages (from_character_id, to_character_id, message, scene_id)
      VALUES (?, ?, ?, ?)
    `);
        const result = stmt.run(fromCharacterId, toCharacterId, message, sceneId);
        return this.getDirectMessageById(result.lastInsertRowid);
    }
    getDirectMessageById(id) {
        const stmt = this.db.prepare('SELECT * FROM direct_messages WHERE id = ?');
        return stmt.get(id);
    }
    getDirectMessages(characterId, limit = 50) {
        const stmt = this.db.prepare(`
      SELECT * FROM direct_messages 
      WHERE from_character_id = ? OR to_character_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
        return stmt.all(characterId, characterId, limit);
    }
    getUnreadMessages(characterId) {
        const stmt = this.db.prepare(`
      SELECT * FROM direct_messages 
      WHERE to_character_id = ? AND read = FALSE
      ORDER BY created_at DESC
    `);
        return stmt.all(characterId);
    }
    markMessageAsRead(messageId) {
        const stmt = this.db.prepare(`
      UPDATE direct_messages 
      SET read = TRUE 
      WHERE id = ?
    `);
        stmt.run(messageId);
        return this.getDirectMessageById(messageId);
    }
    markAllMessagesAsRead(characterId) {
        const stmt = this.db.prepare(`
      UPDATE direct_messages 
      SET read = TRUE 
      WHERE to_character_id = ? AND read = FALSE
    `);
        stmt.run(characterId);
    }
}
//# sourceMappingURL=CharacterService.js.map