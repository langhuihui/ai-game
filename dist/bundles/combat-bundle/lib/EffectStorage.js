/**
 * EffectStorage - 效果存储系统
 * 在内存中存储角色的效果列表，确保效果在角色重新加载后仍然存在
 */
import { EffectList } from './Effect.js';
class EffectStorage {
    effects = new Map();
    /**
     * 获取角色的效果列表，如果不存在则创建
     */
    getEffectList(characterId, character) {
        if (!this.effects.has(characterId)) {
            this.effects.set(characterId, new EffectList(character));
        }
        return this.effects.get(characterId);
    }
    /**
     * 设置角色的效果列表
     */
    setEffectList(characterId, effectList) {
        this.effects.set(characterId, effectList);
    }
    /**
     * 移除角色的效果列表
     */
    removeEffectList(characterId) {
        const effectList = this.effects.get(characterId);
        if (effectList) {
            // 清理所有效果
            const allEffects = effectList.getAll();
            allEffects.forEach(effect => {
                effectList.remove(effect.id);
            });
            this.effects.delete(characterId);
        }
    }
    /**
     * 检查角色是否有效果列表
     */
    hasEffectList(characterId) {
        return this.effects.has(characterId);
    }
    /**
     * 清理所有过期的效果
     */
    cleanupAll() {
        for (const [characterId, effectList] of this.effects.entries()) {
            effectList.cleanup();
            // 如果清理后效果列表为空，可以选择保留或删除
            // 这里选择保留，以便后续查询时返回空列表
        }
    }
    /**
     * 获取所有角色ID
     */
    getAllCharacterIds() {
        return Array.from(this.effects.keys());
    }
}
// 导出单例
export const effectStorage = new EffectStorage();
//# sourceMappingURL=EffectStorage.js.map