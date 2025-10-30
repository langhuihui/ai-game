/**
 * RemoveEffectCommand - 移除角色的效果
 */

import { entityManager } from '../../core/EntityManager.js';
import { EffectList } from '../lib/Effect.js';
import { effectStorage } from '../lib/EffectStorage.js';

export class RemoveEffectCommand {
  static name = 'remove_effect';
  static description = 'Remove an effect from a character';

  static async execute(args: {
    character_id: number;
    effect_id?: string;
    effect_name?: string;
  }): Promise<any> {
    try {
      const characterService = entityManager.getCharacterService();
      let character = characterService.getCharacterById(args.character_id);

      if (!character) {
        return {
          success: false,
          error: 'Character not found'
        };
      }

      // 从效果存储中获取效果列表
      if (!effectStorage.hasEffectList(args.character_id)) {
        return {
          success: false,
          error: `${character.name} has no active effects`
        };
      }

      const effectList = effectStorage.getEffectList(args.character_id, character);

      let removed = false;
      let removedCount = 0;

      // 按 ID 移除
      if (args.effect_id) {
        removed = effectList.remove(args.effect_id);
        removedCount = removed ? 1 : 0;
      }
      // 按名称移除
      else if (args.effect_name) {
        removedCount = effectList.removeByName(args.effect_name);
        removed = removedCount > 0;
      }
      else {
        return {
          success: false,
          error: 'Must provide either effect_id or effect_name'
        };
      }

      if (!removed) {
        return {
          success: false,
          error: 'Effect not found or already removed'
        };
      }

      // 重新获取角色
      character = characterService.getCharacterById(args.character_id);
      if (!character) {
        throw new Error('Character not found after effect removal');
      }

      return {
        success: true,
        removed_count: removedCount,
        character: character,
        remaining_effects: effectList.toJSON(),
        message: `Removed ${removedCount} effect(s) from ${character.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default RemoveEffectCommand;

