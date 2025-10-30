# 导入 RanvierMUD 模块指南

## 步骤 1: 下载 RanvierMUD 源码

```bash
# 在临时目录下载
cd /tmp
git clone https://github.com/RanvierMUD/ranviermud.git
cd ranviermud
```

## 步骤 2: 识别要移植的模块

### 高价值模块位置

```bash
# Effect 系统
src/Effect.js
src/EffectList.js

# Quest 系统  
src/Quest.js
src/QuestGoal.js
src/QuestReward.js

# Channel 系统
src/Channel.js
src/ChannelAudience.js

# Skill 系统
src/Skill.js
src/SkillType.js

# Party 系统
src/Party.js
```

## 步骤 3: 移植 Effect 系统（示例）

### 3.1 复制源文件

```bash
# 从 RanvierMUD 复制
cp /tmp/ranviermud/src/Effect.js /Users/dexter/project/matrix-game/temp/

# 查看文件内容，理解其结构
cat temp/Effect.js
```

### 3.2 转换为 TypeScript 并适配

创建适配的 TypeScript 版本：

```typescript
// bundles/combat-bundle/lib/Effect.ts

import { eventManager } from '../../../src/core/EventManager.js';

export interface EffectConfig {
  name: string;
  description?: string;
  duration?: number; // 毫秒，-1 表示永久
  type?: 'buff' | 'debuff' | 'neutral';
  hidden?: boolean;
  maxStacks?: number;
  refreshes?: boolean;
  unique?: boolean;
}

export interface EffectModifier {
  attribute: string;
  value: number;
}

export class Effect {
  id: string;
  config: EffectConfig;
  startedAt: number;
  paused: boolean = false;
  elapsed: number = 0;
  modifiers: Map<string, number> = new Map();
  private tickInterval?: NodeJS.Timeout;

  constructor(config: EffectConfig) {
    this.id = `${config.name}-${Date.now()}`;
    this.config = config;
    this.startedAt = Date.now();
  }

  /**
   * 激活效果
   */
  activate(target: any): void {
    console.log(`[Effect] Activating ${this.config.name} on ${target.name || target.id}`);
    
    // 应用修饰符
    this.modifiers.forEach((value, attribute) => {
      const currentValue = target[attribute] || 0;
      target[attribute] = currentValue + value;
    });

    // 发送激活事件
    eventManager.emit('effect:activated', this, target);

    // 如果有持续时间，设置定时器
    if (this.config.duration && this.config.duration > 0) {
      setTimeout(() => {
        this.deactivate(target);
      }, this.config.duration);
    }

    // 调用自定义激活逻辑
    this.onActivate?.(target);
  }

  /**
   * 停用效果
   */
  deactivate(target: any): void {
    console.log(`[Effect] Deactivating ${this.config.name} on ${target.name || target.id}`);
    
    // 移除修饰符
    this.modifiers.forEach((value, attribute) => {
      const currentValue = target[attribute] || 0;
      target[attribute] = currentValue - value;
    });

    // 清理定时器
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }

    // 发送停用事件
    eventManager.emit('effect:deactivated', this, target);

    // 调用自定义停用逻辑
    this.onDeactivate?.(target);
  }

  /**
   * 暂停效果
   */
  pause(): void {
    this.paused = true;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
  }

  /**
   * 恢复效果
   */
  resume(): void {
    this.paused = false;
    this.startTicking();
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
   * 启动 tick
   */
  private startTicking(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }

    this.tickInterval = setInterval(() => {
      if (!this.paused) {
        this.elapsed += 1000;
        this.onTick?.();
      }
    }, 1000);
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
   * 钩子：每秒调用（子类可重写）
   */
  protected onTick?(): void;
}

/**
 * Effect 管理器
 */
export class EffectList {
  private effects: Map<string, Effect> = new Map();

  /**
   * 添加效果
   */
  add(target: any, effect: Effect): void {
    // 检查唯一性
    if (effect.config.unique) {
      const existing = this.findByName(effect.config.name);
      if (existing) {
        // 如果可刷新，刷新现有效果
        if (effect.config.refreshes) {
          existing.elapsed = 0;
          return;
        }
        // 否则不添加
        return;
      }
    }

    // 检查堆叠上限
    if (effect.config.maxStacks) {
      const sameEffects = Array.from(this.effects.values())
        .filter(e => e.config.name === effect.config.name);
      
      if (sameEffects.length >= effect.config.maxStacks) {
        return; // 达到堆叠上限
      }
    }

    this.effects.set(effect.id, effect);
    effect.activate(target);
  }

  /**
   * 移除效果
   */
  remove(target: any, effectId: string): boolean {
    const effect = this.effects.get(effectId);
    if (!effect) {
      return false;
    }

    effect.deactivate(target);
    return this.effects.delete(effectId);
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
   * 清理过期效果
   */
  cleanup(target: any): void {
    const expired = Array.from(this.effects.values())
      .filter(e => e.isExpired());
    
    expired.forEach(e => {
      this.remove(target, e.id);
    });
  }

  /**
   * 清除所有效果
   */
  clear(target: any): void {
    this.effects.forEach(effect => {
      effect.deactivate(target);
    });
    this.effects.clear();
  }
}
```

### 3.3 创建预定义效果

```typescript
// bundles/combat-bundle/effects/PoisonEffect.ts

import { Effect } from '../lib/Effect.js';

export class PoisonEffect extends Effect {
  constructor(duration: number = 30000) {
    super({
      name: 'poison',
      description: 'Taking damage over time',
      duration: duration,
      type: 'debuff',
      maxStacks: 3,
      refreshes: true
    });

    // 每秒造成 2 点伤害
    this.addModifier('health', -2);
  }

  protected onActivate(target: any): void {
    console.log(`${target.name} has been poisoned!`);
  }

  protected onTick(): void {
    // 每秒执行
    console.log('Poison ticks...');
  }

  protected onDeactivate(target: any): void {
    console.log(`${target.name} is no longer poisoned.`);
  }
}

// bundles/combat-bundle/effects/RegenerationEffect.ts

export class RegenerationEffect extends Effect {
  constructor(duration: number = 60000) {
    super({
      name: 'regeneration',
      description: 'Healing over time',
      duration: duration,
      type: 'buff',
      unique: true
    });

    // 每秒恢复 3 点生命
    this.addModifier('health', 3);
  }

  protected onActivate(target: any): void {
    console.log(`${target.name} begins regenerating!`);
  }

  protected onDeactivate(target: any): void {
    console.log(`${target.name}'s regeneration ends.`);
  }
}
```

### 3.4 集成到现有系统

```typescript
// src/models/Character.ts - 扩展 Character 模型

import { EffectList } from '../../bundles/combat-bundle/lib/Effect.js';

export interface Character {
  id: number;
  name: string;
  health: number;
  mental_state: number;
  effects?: EffectList; // 新增
  // ... 其他字段
}

// src/services/CharacterService.ts - 扩展服务

export class CharacterService {
  // ... 现有方法

  /**
   * 添加效果到角色
   */
  addEffect(characterId: number, effect: Effect): void {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    if (!character.effects) {
      character.effects = new EffectList();
    }

    character.effects.add(character, effect);
  }

  /**
   * 移除角色的效果
   */
  removeEffect(characterId: number, effectId: string): boolean {
    const character = this.getCharacterById(characterId);
    if (!character || !character.effects) {
      return false;
    }

    return character.effects.remove(character, effectId);
  }

  /**
   * 获取角色的所有效果
   */
  getEffects(characterId: number): Effect[] {
    const character = this.getCharacterById(characterId);
    if (!character || !character.effects) {
      return [];
    }

    return character.effects.getAll();
  }
}
```

### 3.5 创建 MCP 工具

```typescript
// bundles/combat-bundle/commands/ApplyEffectCommand.ts

import { entityManager } from '../../../src/core/EntityManager.js';
import { PoisonEffect, RegenerationEffect } from '../effects/index.js';

export class ApplyEffectCommand {
  static name = 'apply_effect';
  static description = 'Apply an effect to a character';

  static async execute(args: {
    character_id: number;
    effect_name: string;
    duration?: number;
  }): Promise<any> {
    try {
      const characterService = entityManager.getCharacterService();
      const character = characterService.getCharacterById(args.character_id);

      if (!character) {
        return {
          success: false,
          error: 'Character not found'
        };
      }

      // 根据效果名称创建效果
      let effect;
      switch (args.effect_name.toLowerCase()) {
        case 'poison':
          effect = new PoisonEffect(args.duration);
          break;
        case 'regeneration':
          effect = new RegenerationEffect(args.duration);
          break;
        default:
          return {
            success: false,
            error: `Unknown effect: ${args.effect_name}`
          };
      }

      characterService.addEffect(args.character_id, effect);

      return {
        success: true,
        effect: {
          id: effect.id,
          name: effect.config.name,
          duration: effect.config.duration,
          remaining: effect.getRemainingTime()
        },
        character: character,
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

// bundles/combat-bundle/commands/ListEffectsCommand.ts

export class ListEffectsCommand {
  static name = 'list_effects';
  static description = 'List all active effects on a character';

  static async execute(args: { character_id: number }): Promise<any> {
    try {
      const characterService = entityManager.getCharacterService();
      const effects = characterService.getEffects(args.character_id);

      return {
        success: true,
        effects: effects.map(e => ({
          id: e.id,
          name: e.config.name,
          description: e.config.description,
          type: e.config.type,
          remaining: e.getRemainingTime(),
          modifiers: Array.from(e.modifiers.entries()).map(([attr, val]) => ({
            attribute: attr,
            value: val
          }))
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
```

## 步骤 4: 更新 Bundle Manifest

```json
// bundles/combat-bundle/manifest.json

{
  "name": "combat-bundle",
  "version": "2.0.0",
  "description": "Combat system with health, effects, and damage",
  "author": "Matrix Game",
  "dependencies": ["core-bundle"],
  "commands": [
    "ApplyEffectCommand",
    "RemoveEffectCommand",
    "ListEffectsCommand"
  ],
  "behaviors": {
    "character": [],
    "item": []
  },
  "entities": [],
  "events": [
    "CombatEventListener",
    "EffectEventListener"
  ],
  "lib": [
    "Effect",
    "EffectList"
  ]
}
```

## 步骤 5: 测试

```bash
# 重新编译
npm run build

# 启动服务器
npm start

# 测试效果系统
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "apply_effect",
      "arguments": {
        "character_id": 1,
        "effect_name": "poison",
        "duration": 30000
      }
    },
    "id": 1
  }'
```

## 其他可移植的模块

### Quest 系统

```typescript
// bundles/quest-bundle/lib/Quest.ts
// 类似的移植方式
```

### Channel 系统

```typescript
// bundles/social-bundle/lib/Channel.ts
// 类似的移植方式
```

### Skill 系统

```typescript
// bundles/skill-bundle/lib/Skill.ts
// 类似的移植方式
```

## 注意事项

1. **License 检查**: RanvierMUD 是 MIT License，可以自由使用
2. **归属说明**: 在代码中注明来源于 RanvierMUD
3. **适配调整**: 根据你的项目需求调整实现细节
4. **测试充分**: 移植后需要充分测试

## 推荐移植顺序

1. ✅ **Effect 系统** - 最有用，立即提升游戏性
2. ✅ **Quest 系统** - 增加游戏内容深度
3. ✅ **Channel 系统** - 改善社交体验
4. ⏳ **Skill 系统** - 增加战斗策略性
5. ⏳ **Party 系统** - 支持组队玩法

