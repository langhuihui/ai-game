/**
 * UseCommand - Use/consume an item
 */

import { entityManager } from '../../core/EntityManager.js';
import { eventManager } from '../../core/EventManager.js';
import { behaviorManager } from '../../core/BehaviorManager.js';

export interface UseCommandArgs {
  character_id: number;
  item_id: number;
}

export class UseCommand {
  static name = 'use_item';
  static description = 'Use or consume an item';

  static async execute(args: UseCommandArgs): Promise<any> {
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

      // Check for item behavior based on item name
      const behaviorName = item.name.toLowerCase().replace(/\s+/g, '-');
      let effect = null;

      if (behaviorManager.has('item', behaviorName)) {
        const behavior = behaviorManager.get('item', behaviorName);
        if (behavior) {
          effect = await behavior.execute(null as any, character);
        }
      }

      // Use the item (will delete it)
      const itemService = entityManager.getItemService();
      const useResult = itemService.useItem(args.item_id, args.character_id);

      if (!useResult) {
        return {
          success: false,
          error: 'Failed to use item'
        };
      }

      // Apply effects if any
      let updatedCharacter = character;
      let effectMessage = '';

      if (effect) {
        if (effect.health_change) {
          updatedCharacter = entityManager.getCharacterService().updateCharacterHealth(
            args.character_id,
            effect.health_change
          )!;
          effectMessage += ` Health ${effect.health_change > 0 ? '+' : ''}${effect.health_change}.`;
        }

        if (effect.mental_state_change) {
          updatedCharacter = entityManager.getCharacterService().updateCharacterMentalState(
            args.character_id,
            effect.mental_state_change
          )!;
          effectMessage += ` Mental state ${effect.mental_state_change > 0 ? '+' : ''}${effect.mental_state_change}.`;
        }
      }

      // Emit event for item used
      await eventManager.emit('item:used', useResult.item, updatedCharacter, effect);

      // Add memory about using the item
      const memoryService = entityManager.getMemoryService();
      memoryService.addActionMemory(
        args.character_id,
        'used an item',
        `Used: ${useResult.item.name}. ${effect?.description || 'No special effect.'}`
      );

      return {
        success: true,
        item: useResult.item,
        effect: effect,
        character: updatedCharacter,
        message: `${character.name} used: ${useResult.item.name}.${effectMessage}`,
        effectDescription: effect?.description
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default UseCommand;

