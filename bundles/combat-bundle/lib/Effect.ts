/**
 * Effect System - Adapted from RanvierMUD
 * Original: https://github.com/RanvierMUD/ranviermud
 * License: MIT
 * 
 * 效果系统：支持 Buff/Debuff、DOT/HOT 等游戏效果
 */

import { eventManager } from '../../core/EventManager.js';

export interface EffectConfig {
  name: string;
  description?: string;
  duration?: number; // 毫秒，-1 表示永久
  type?: 'buff' | 'debuff' | 'neutral';
  hidden?: boolean;
  maxStacks?: number;
  refreshes?: boolean;
  unique?: boolean;
  tickInterval?: number; // tick 间隔（毫秒）
}

export class Effect {
  id: string;
  config: EffectConfig;
  startedAt: number;
  paused: boolean = false;
  elapsed: number = 0;
  modifiers: Map<string, number> = new Map();
  private tickInterval?: NodeJS.Timeout;
  private removeTimeout?: NodeJS.Timeout;

  constructor(config: EffectConfig) {
    this.id = `${config.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.config = {
      ...config,
      tickInterval: config.tickInterval || 1000 // 默认每秒 tick
    };
    this.startedAt = Date.now();
  }

  /**
   * 激活效果
   */
  activate(target: any): void {
    console.log(`[Effect] ✨ Activating ${this.config.name} on ${target.name || target.id}`);

    // 应用修饰符
    this.applyModifiers(target);

    // 发送激活事件
    eventManager.emit('effect:activated', this, target);

    // 启动 tick
    this.startTicking(target);

    // 如果有持续时间，设置自动移除
    if (this.config.duration && this.config.duration > 0) {
      this.removeTimeout = setTimeout(() => {
        this.deactivate(target);
      }, this.config.duration);
    }

    // 调用自定义激活逻辑
    if (this.onActivate) {
      this.onActivate(target);
    }
  }

  /**
   * 停用效果
   */
  deactivate(target: any): void {
    console.log(`[Effect] 💨 Deactivating ${this.config.name} on ${target.name || target.id}`);

    // 移除修饰符
    this.removeModifiers(target);

    // 清理定时器
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = undefined;
    }
    if (this.removeTimeout) {
      clearTimeout(this.removeTimeout);
      this.removeTimeout = undefined;
    }

    // 发送停用事件
    eventManager.emit('effect:deactivated', this, target);

    // 调用自定义停用逻辑
    if (this.onDeactivate) {
      this.onDeactivate(target);
    }
  }

  /**
   * 应用修饰符
   */
  private applyModifiers(target: any): void {
    this.modifiers.forEach((value, attribute) => {
      const currentValue = target[attribute] || 0;
      target[attribute] = Math.max(0, Math.min(100, currentValue + value));
    });
  }

  /**
   * 移除修饰符
   */
  private removeModifiers(target: any): void {
    // 注意：对于某些修饰符，移除时不应该反向操作
    // 例如，DOT 伤害不应该在移除时恢复
    // 这里只是示例，实际使用时需要根据具体情况处理
  }

  /**
   * 暂停效果
   */
  pause(): void {
    this.paused = true;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = undefined;
    }
  }

  /**
   * 恢复效果
   */
  resume(target: any): void {
    this.paused = false;
    this.startTicking(target);
  }

  /**
   * 添加修饰符
   */
  addModifier(attribute: string, value: number): void {
    this.modifiers.set(attribute, value);
  }

  /**
   * 获取剩余时间
   */
  getRemainingTime(): number {
    if (!this.config.duration || this.config.duration < 0) {
      return -1;
    }
    const remaining = this.config.duration - this.elapsed;
    return Math.max(0, remaining);
  }

  /**
   * 是否已过期
   */
  isExpired(): boolean {
    if (!this.config.duration || this.config.duration < 0) {
      return false;
    }
    return this.elapsed >= this.config.duration;
  }

  /**
   * 刷新效果持续时间
   */
  refresh(): void {
    this.elapsed = 0;
    this.startedAt = Date.now();
  }

  /**
   * 启动 tick
   */
  private startTicking(target: any): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }

    const interval = this.config.tickInterval || 1000;
    this.tickInterval = setInterval(() => {
      if (!this.paused) {
        this.elapsed += interval;

        // 应用 tick 效果
        this.modifiers.forEach((value, attribute) => {
          const currentValue = target[attribute] || 0;
          target[attribute] = Math.max(0, Math.min(100, currentValue + value));
        });

        // 发送 tick 事件
        eventManager.emit('effect:tick', this, target);

        // 调用自定义 tick 逻辑
        if (this.onTick) {
          this.onTick(target);
        }
      }
    }, interval);
  }

  /**
   * 钩子：激活时调用（子类可重写）
   */
  protected onActivate?(target: any): void;

  /**
   * 钩子：停用时调用（子类可重写）
   */
  protected onDeactivate?(target: any): void;

  /**
   * 钩子：每 tick 调用（子类可重写）
   */
  protected onTick?(target: any): void;

  /**
   * 序列化为 JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.config.name,
      description: this.config.description,
      type: this.config.type,
      duration: this.config.duration,
      remaining: this.getRemainingTime(),
      elapsed: this.elapsed,
      modifiers: Array.from(this.modifiers.entries()).map(([attr, val]) => ({
        attribute: attr,
        value: val
      }))
    };
  }
}

/**
 * Effect 列表管理器
 */
export class EffectList {
  private effects: Map<string, Effect> = new Map();
  private target: any;

  constructor(target: any) {
    this.target = target;
  }

  /**
   * 添加效果
   */
  add(effect: Effect): boolean {
    // 检查唯一性
    if (effect.config.unique) {
      const existing = this.findByName(effect.config.name);
      if (existing) {
        // 如果可刷新，刷新现有效果
        if (effect.config.refreshes) {
          console.log(`[EffectList] 🔄 Refreshing ${effect.config.name}`);
          existing.refresh();
          return false;
        }
        // 否则不添加
        console.log(`[EffectList] ❌ ${effect.config.name} already active (unique)`);
        return false;
      }
    }

    // 检查堆叠上限
    if (effect.config.maxStacks) {
      const sameEffects = Array.from(this.effects.values())
        .filter(e => e.config.name === effect.config.name);

      if (sameEffects.length >= effect.config.maxStacks) {
        console.log(`[EffectList] ❌ ${effect.config.name} max stacks reached`);
        return false;
      }
    }

    this.effects.set(effect.id, effect);
    effect.activate(this.target);
    return true;
  }

  /**
   * 移除效果
   */
  remove(effectId: string): boolean {
    const effect = this.effects.get(effectId);
    if (!effect) {
      return false;
    }

    effect.deactivate(this.target);
    return this.effects.delete(effectId);
  }

  /**
   * 按名称移除所有同名效果
   */
  removeByName(name: string): number {
    const removed: string[] = [];

    this.effects.forEach((effect, id) => {
      if (effect.config.name === name) {
        effect.deactivate(this.target);
        removed.push(id);
      }
    });

    removed.forEach(id => this.effects.delete(id));
    return removed.length;
  }

  /**
   * 按名称查找效果
   */
  findByName(name: string): Effect | undefined {
    return Array.from(this.effects.values())
      .find(e => e.config.name === name);
  }

  /**
   * 获取所有效果
   */
  getAll(): Effect[] {
    return Array.from(this.effects.values());
  }

  /**
   * 获取所有 Buff
   */
  getBuffs(): Effect[] {
    return this.getAll().filter(e => e.config.type === 'buff');
  }

  /**
   * 获取所有 Debuff
   */
  getDebuffs(): Effect[] {
    return this.getAll().filter(e => e.config.type === 'debuff');
  }

  /**
   * 清理过期效果
   */
  cleanup(): number {
    const expired = Array.from(this.effects.values())
      .filter(e => e.isExpired());

    expired.forEach(e => {
      this.remove(e.id);
    });

    return expired.length;
  }

  /**
   * 清除所有效果
   */
  clear(): void {
    this.effects.forEach(effect => {
      effect.deactivate(this.target);
    });
    this.effects.clear();
  }

  /**
   * 暂停所有效果
   */
  pauseAll(): void {
    this.effects.forEach(effect => {
      effect.pause();
    });
  }

  /**
   * 恢复所有效果
   */
  resumeAll(): void {
    this.effects.forEach(effect => {
      effect.resume(this.target);
    });
  }

  /**
   * 获取效果数量
   */
  size(): number {
    return this.effects.size;
  }

  /**
   * 检查是否有特定效果
   */
  has(name: string): boolean {
    return this.findByName(name) !== undefined;
  }

  /**
   * 序列化为 JSON
   */
  toJSON() {
    return {
      count: this.effects.size,
      effects: this.getAll().map(e => e.toJSON())
    };
  }
}

