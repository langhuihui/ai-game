# Effect 系统测试指南

## 步骤 1: 启动服务器

```bash
cd /Users/dexter/project/matrix-game
npm start
```

预期输出：
```
🎮 Initializing Matrix Game Server with RanvierMUD Architecture...
✅ Game server initialized successfully
📦 Loaded bundles: items-bundle, core-bundle, combat-bundle, memory-bundle, social-bundle, admin-bundle
🌐 Web server running on http://localhost:3000
✅ Server started successfully
```

## 步骤 2: 创建测试角色

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "create_character",
      "arguments": {
        "name": "EffectTestHero",
        "description": "A hero for testing effects",
        "personality": "Brave and resilient",
        "health": 80
      }
    },
    "id": 1
  }' | jq
```

## 步骤 3: 测试中毒效果（Poison）

### 3.1 施加中毒效果

```bash
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
        "duration": 10000,
        "power": 2
      }
    },
    "id": 2
  }' | jq
```

**观察服务器控制台输出**：
```
[Effect] ✨ Activating poison on EffectTestHero
💀 EffectTestHero has been poisoned!
☠️ Poison damages EffectTestHero for 2 HP (78/100 remaining)
☠️ Poison damages EffectTestHero for 2 HP (76/100 remaining)
☠️ Poison damages EffectTestHero for 2 HP (74/100 remaining)
...
```

### 3.2 查看当前效果

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_effects",
      "arguments": {
        "character_id": 1
      }
    },
    "id": 3
  }' | jq
```

**预期响应**：
```json
{
  "success": true,
  "character_name": "EffectTestHero",
  "character_health": 72,
  "effects": [
    {
      "id": "poison-1730123456-abc",
      "name": "poison",
      "type": "debuff",
      "duration": 10000,
      "remaining": 6000,
      "modifiers": []
    }
  ],
  "summary": {
    "total": 1,
    "buffs": 0,
    "debuffs": 1
  }
}
```

## 步骤 4: 测试再生效果（Regeneration）

### 4.1 施加再生效果

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "apply_effect",
      "arguments": {
        "character_id": 1,
        "effect_name": "regeneration",
        "duration": 15000,
        "power": 5
      }
    },
    "id": 4
  }' | jq
```

**服务器控制台输出**：
```
[Effect] ✨ Activating regeneration on EffectTestHero
✨ EffectTestHero begins regenerating!
💚 EffectTestHero regenerates 5 HP (77/100)
💚 EffectTestHero regenerates 5 HP (82/100)
💚 EffectTestHero regenerates 5 HP (87/100)
...
```

### 4.2 查看双重效果

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_effects",
      "arguments": {
        "character_id": 1
      }
    },
    "id": 5
  }' | jq
```

现在角色同时有：
- 💀 中毒：每秒 -2 HP
- 💚 再生：每秒 +5 HP
- **净效果**：每秒 +3 HP 恢复！

## 步骤 5: 测试效果堆叠

### 5.1 施加第二层中毒

```bash
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
        "duration": 8000,
        "power": 3
      }
    },
    "id": 6
  }' | jq
```

### 5.2 查看堆叠效果

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_effects",
      "arguments": {
        "character_id": 1
      }
    },
    "id": 7
  }' | jq
```

现在应该看到：
- 2 个中毒效果（允许堆叠最多 3 层）
- 1 个再生效果（唯一效果，不能堆叠）

## 步骤 6: 移除特定效果

### 6.1 按名称移除所有中毒

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "remove_effect",
      "arguments": {
        "character_id": 1,
        "effect_name": "poison"
      }
    },
    "id": 8
  }' | jq
```

**服务器控制台输出**：
```
[Effect] 💨 Deactivating poison on EffectTestHero
✅ EffectTestHero is no longer poisoned.
[Effect] 💨 Deactivating poison on EffectTestHero
✅ EffectTestHero is no longer poisoned.
```

## 步骤 7: 测试效果过期

等待 15 秒，再次查看效果：

```bash
# 等待 15 秒后
sleep 15

curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_effects",
      "arguments": {
        "character_id": 1
      }
    },
    "id": 9
  }' | jq
```

再生效果应该已经自动过期并移除！

## 步骤 8: 通过 Web 界面查看

访问 Web 界面：
```
http://localhost:3000/characters
```

点击角色，应该能看到当前激活的所有效果。

## 步骤 9: 测试致命中毒

### 9.1 将角色血量降低

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "update_character",
      "arguments": {
        "character_id": 1,
        "health": 5
      }
    },
    "id": 10
  }' | jq
```

### 9.2 施加强力中毒

```bash
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
        "duration": 10000,
        "power": 3
      }
    },
    "id": 11
  }' | jq
```

**服务器控制台输出**：
```
☠️ Poison damages EffectTestHero for 3 HP (2/100 remaining)
☠️ Poison damages EffectTestHero for 3 HP (0/100 remaining)
💀 EffectTestHero died from poison!
[Effect] 💨 Deactivating poison on EffectTestHero
✅ EffectTestHero is no longer poisoned.
```

## 预期结果总结

### ✅ 功能验证

1. **中毒效果**
   - ✅ 持续造成伤害
   - ✅ 可以堆叠（最多 3 层）
   - ✅ 到达 0 血时触发死亡

2. **再生效果**
   - ✅ 持续恢复生命
   - ✅ 唯一效果（不能堆叠）
   - ✅ 可以刷新持续时间

3. **效果管理**
   - ✅ 查看所有激活效果
   - ✅ 按名称移除效果
   - ✅ 自动清理过期效果

4. **事件系统**
   - ✅ effect:activated 事件
   - ✅ effect:deactivated 事件
   - ✅ effect:tick 事件

## 常见问题

### Q: 中毒没有造成伤害？
A: 检查角色是否存在，ID 是否正确

### Q: 效果立即消失？
A: 检查 duration 参数是否正确设置（毫秒）

### Q: 无法堆叠中毒？
A: 中毒最多堆叠 3 层，达到上限后无法继续添加

### Q: 再生效果可以堆叠？
A: 再生是唯一效果（unique: true），只能有一个实例

## 下一步测试

1. **创建自定义效果**
   - 复制 PoisonEffect.ts
   - 修改逻辑
   - 测试新效果

2. **与物品系统集成**
   - 使用物品时自动施加效果
   - 例如：喝毒药 → 中毒效果

3. **与战斗系统集成**
   - 攻击时有概率施加效果
   - 防御时减少效果持续时间

## 性能监控

观察服务器控制台的日志频率：
- 每个效果每秒应该有 1 次 tick 日志
- 多个效果应该独立 tick
- 效果过期时应该自动清理

---

**享受测试！** 🎮✨

