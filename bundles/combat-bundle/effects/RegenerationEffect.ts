/**
 * 再生效果 - 持续治疗
 */

import { Effect } from '../lib/Effect.js';

export class RegenerationEffect extends Effect {
  private healPerTick: number;

  constructor(duration: number = 60000, healPerTick: number = 3) {
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

  protected onActivate(target: any): void {
    console.log(`✨ ${target.name} begins regenerating!`);
  }

  protected onTick(target: any): void {
    // 每秒恢复生命
    const currentHealth = target.health || 0;
    const maxHealth = 100;

    if (currentHealth < maxHealth) {
      target.health = Math.min(maxHealth, currentHealth + this.healPerTick);
      console.log(`💚 ${target.name} regenerates ${this.healPerTick} HP (${target.health}/${maxHealth})`);
    }
  }

  protected onDeactivate(target: any): void {
    console.log(`✅ ${target.name}'s regeneration ends.`);
  }
}

