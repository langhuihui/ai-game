/**
 * ApplyEffectCommand - 对角色施加效果
 */

import { entityManager } from '../../core/EntityManager.js';
import { PoisonEffect } from '../effects/PoisonEffect.js';
import { RegenerationEffect } from '../effects/RegenerationEffect.js';
import { EffectList } from '../lib/Effect.js';
import { effectStorage } from '../lib/EffectStorage.js';

export class ApplyEffectCommand {
  static name = 'apply_effect';
  static description = 'Apply an effect (buff/debuff) to a character';
  static inputSchema = {
    type: 'object' as const,
    properties: {
      character_id: {
        type: 'number',
        description: 'Character ID to apply effect to'
      },
      effect_name: {
        type: 'string',
        description: 'Effect name (poison, regeneration)',
        enum: ['poison', 'regeneration', 'regen']
      },
      duration: {
        type: 'number',
        description: 'Effect duration in milliseconds (optional)',
        minimum: 0
      },
      power: {
        type: 'number',
        description: 'Effect power/strength (optional)',
        minimum: 0
      }
    },
    required: ['character_id', 'effect_name']
  };

  static async execute(args: {
    character_id: number;
    effect_name: string;
    duration?: number;
    power?: number;
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

      // 从效果存储中获取或创建效果列表
      const effectList = effectStorage.getEffectList(args.character_id, character);
      
      // 确保角色对象也引用效果列表（用于兼容性）
      (character as any).effects = effectList;

      // 根据效果名称创建效果
      let effect;
      switch (args.effect_name.toLowerCase()) {
        case 'poison':
          effect = new PoisonEffect(args.duration || 30000, args.power || 2);
          break;
        case 'regeneration':
        case 'regen':
          effect = new RegenerationEffect(args.duration || 60000, args.power || 3);
          break;
        default:
          return {
            success: false,
            error: `Unknown effect: ${args.effect_name}. Available: poison, regeneration`
          };
      }

      // 添加效果
      const added = effectList.add(effect);

      if (!added) {
        return {
          success: false,
          error: `Could not apply effect (already active or max stacks reached)`
        };
      }

      // 重新获取角色（可能已被修改）
      character = characterService.getCharacterById(args.character_id);
      if (!character) {
        throw new Error('Character not found after effect application');
      }

      return {
        success: true,
        effect: effect.toJSON(),
        character: character,
        active_effects: effectList.toJSON(),
        message: `Applied ${effect.config.name} to ${character.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default ApplyEffectCommand;

