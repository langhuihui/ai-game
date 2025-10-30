/**
 * 再生效果 - 持续治疗
 */
import { Effect } from '../lib/Effect.js';
export class RegenerationEffect extends Effect {
    healPerTick;
    constructor(duration = 60000, healPerTick = 3) {
        super({
            name: 'regeneration',
            description: 'Healing over time',
            duration: duration,
            type: 'buff',
            unique: true,
            refreshes: true,
            tickInterval: 1000
        });
        this.healPerTick = healPerTick;
    }
    onActivate(target) {
        console.log(`✨ ${target.name} begins regenerating!`);
    }
    onTick(target) {
        // 每秒恢复生命
        const currentHealth = target.health || 0;
        const maxHealth = 100;
        if (currentHealth < maxHealth) {
            target.health = Math.min(maxHealth, currentHealth + this.healPerTick);
            console.log(`💚 ${target.name} regenerates ${this.healPerTick} HP (${target.health}/${maxHealth})`);
        }
    }
    onDeactivate(target) {
        console.log(`✅ ${target.name}'s regeneration ends.`);
    }
}
//# sourceMappingURL=RegenerationEffect.js.map