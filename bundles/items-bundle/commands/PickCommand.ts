/**
 * PickCommand - Pick up an item from a scene
 */

import { entityManager } from '../../core/EntityManager.js';
import { eventManager } from '../../core/EventManager.js';

export interface PickCommandArgs {
  character_id: number;
  item_id: number;
}

export class PickCommand {
  static name = 'pick_item';
  static description = 'Pick up an item from the current scene';

  static async execute(args: PickCommandArgs): Promise<any> {
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

      // Check if item is in character's current scene
      if (item.scene_id !== character.current_scene_id) {
        return {
          success: false,
          error: 'Item is not in your current location'
        };
      }

      // Pick up the item
      const result = await entityManager.pickItem(args.item_id, args.character_id);

      if (!result) {
        return {
          success: false,
          error: 'Failed to pick up item'
        };
      }

      return {
        success: true,
        item: result,
        character,
        message: `${character.name} picked up: ${result.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default PickCommand;

