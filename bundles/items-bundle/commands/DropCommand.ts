/**
 * DropCommand - Drop an item in current scene
 */

import { entityManager } from '../../core/EntityManager.js';
import { eventManager } from '../../core/EventManager.js';

export interface DropCommandArgs {
  character_id: number;
  item_id: number;
}

export class DropCommand {
  static name = 'drop_item';
  static description = 'Drop an item in the current scene';

  static async execute(args: DropCommandArgs): Promise<any> {
    try {
      const character = entityManager.getCharacter(args.character_id);
      if (!character) {
        return {
          success: false,
          error: 'Character not found'
        };
      }

      const item = entityManager.getItem(args.item_id);
      if (!item) {
        return {
          success: false,
          error: 'Item not found'
        };
      }

      // Check if character owns the item
      if (item.character_id !== args.character_id) {
        return {
          success: false,
          error: 'You do not own this item'
        };
      }

      if (!character.current_scene_id) {
        return {
          success: false,
          error: 'Character is not in any scene'
        };
      }

      // Drop the item
      const result = await entityManager.dropItem(args.item_id, character.current_scene_id);

      if (!result) {
        return {
          success: false,
          error: 'Failed to drop item'
        };
      }

      return {
        success: true,
        item: result,
        character,
        message: `${character.name} dropped: ${result.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default DropCommand;

