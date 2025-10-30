/**
 * 中毒效果 - 持续伤害
 */
import { Effect } from '../lib/Effect.js';
export class PoisonEffect extends Effect {
    damagePerTick;
    constructor(duration = 30000, damagePerTick = 2) {
        super({
            name: 'poison',
            description: 'Taking poison damage over time',
            duration: duration,
            type: 'debuff',
            maxStacks: 3,
            refreshes: true,
            tickInterval: 1000 // 每秒 tick
        });
        this.damagePerTick = damagePerTick;
    }
    onActivate(target) {
        console.log(`💀 ${target.name} has been poisoned!`);
    }
    onTick(target) {
        // 每秒造成伤害
        const currentHealth = target.health || 100;
        target.health = Math.max(0, currentHealth - this.damagePerTick);
        console.log(`☠️ Poison damages ${target.name} for ${this.damagePerTick} HP (${target.health}/${100} remaining)`);
        // 如果角色死亡
        if (target.health <= 0) {
            console.log(`💀 ${target.name} died from poison!`);
        }
    }
    onDeactivate(target) {
        console.log(`✅ ${target.name} is no longer poisoned.`);
    }
}
//# sourceMappingURL=PoisonEffect.js.map