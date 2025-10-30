/**
 * ListEffectsCommand - 列出角色的所有激活效果
 */
import { entityManager } from '../../core/EntityManager.js';
import { effectStorage } from '../lib/EffectStorage.js';
export class ListEffectsCommand {
    static name = 'list_effects';
    static description = 'List all active effects on a character';
    static inputSchema = {
        type: 'object',
        properties: {
            character_id: {
                type: 'number',
                description: 'Character ID to list effects for'
            }
        },
        required: ['character_id']
    };
    static async execute(args) {
        try {
            const characterService = entityManager.getCharacterService();
            const character = characterService.getCharacterById(args.character_id);
            if (!character) {
                return {
                    success: false,
                    error: 'Character not found'
                };
            }
            // 从效果存储中获取效果列表
            const effectList = effectStorage.hasEffectList(args.character_id)
                ? effectStorage.getEffectList(args.character_id, character)
                : undefined;
            if (!effectList || effectList.getAll().length === 0) {
                return {
                    success: true,
                    character_name: character.name,
                    character_health: character.health,
                    effects: [],
                    buffs: [],
                    debuffs: [],
                    total: 0,
                    summary: {
                        total: 0,
                        buffs: 0,
                        debuffs: 0
                    },
                    message: `${character.name} has no active effects`
                };
            }
            // 清理过期效果
            effectList.cleanup();
            const allEffects = effectList.getAll();
            const buffs = effectList.getBuffs();
            const debuffs = effectList.getDebuffs();
            return {
                success: true,
                character_name: character.name,
                character_health: character.health,
                effects: allEffects.map((e) => e.toJSON()),
                buffs: buffs.map((e) => e.toJSON()),
                debuffs: debuffs.map((e) => e.toJSON()),
                total: allEffects.length,
                summary: {
                    total: allEffects.length,
                    buffs: buffs.length,
                    debuffs: debuffs.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
export default ListEffectsCommand;
//# sourceMappingURL=ListEffectsCommand.js.map