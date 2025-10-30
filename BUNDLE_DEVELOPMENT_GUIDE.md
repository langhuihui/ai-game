# Bundle Development Guide

Complete guide for creating and developing bundles for Matrix Game v2.0.

## Table of Contents

1. [Overview](#overview)
2. [Bundle Structure](#bundle-structure)
3. [Creating a New Bundle](#creating-a-new-bundle)
4. [Commands](#commands)
5. [Behaviors](#behaviors)
6. [Event Listeners](#event-listeners)
7. [Entities](#entities)
8. [Best Practices](#best-practices)
9. [Testing Bundles](#testing-bundles)

## Overview

Bundles are modular packages that extend the game functionality. Each bundle can contain:
- **Commands**: MCP-exposed game actions
- **Behaviors**: Scriptable entity logic
- **Event Listeners**: React to game events
- **Entities**: Custom entity types

## Bundle Structure

```
bundles/
└── my-bundle/
    ├── manifest.json          # Bundle metadata
    ├── commands/              # MCP commands
    │   └── MyCommand.ts
    ├── behaviors/             # Entity behaviors
    │   └── item/
    │       └── custom-item.ts
    ├── events/                # Event listeners
    │   └── MyEventListener.ts
    └── entities/              # Entity definitions
        └── CustomEntity.ts
```

## Creating a New Bundle

### Step 1: Create Directory Structure

```bash
mkdir -p bundles/my-bundle/{commands,behaviors/item,events,entities}
```

### Step 2: Create manifest.json

```json
{
  "name": "my-bundle",
  "version": "1.0.0",
  "description": "My custom bundle description",
  "author": "Your Name",
  "dependencies": [
    "core-bundle"
  ],
  "commands": [
    "MyCommand"
  ],
  "behaviors": {
    "item": [
      "custom-item"
    ]
  },
  "entities": [],
  "events": [
    "MyEventListener"
  ]
}
```

### Step 3: Register Bundle

Add to `src/index.ts` or `src/mcp/MCPServer.ts`:

```typescript
await this.gameState.initialize({
  bundles: [
    './bundles/core-bundle',
    './bundles/my-bundle',  // Add your bundle
    // ... other bundles
  ]
});
```

## Commands

Commands are MCP-exposed game actions. They execute game logic and return results.

### Command Structure

```typescript
// bundles/my-bundle/commands/MyCommand.ts
import { entityManager } from '../../core/EntityManager.js';

export class MyCommand {
  // Required: Static name property
  static name = 'my_command';
  
  // Required: Static description
  static description = 'Description of what this command does';
  
  // Optional: Input schema for MCP tools
  static inputSchema = {
    type: 'object' as const,
    properties: {
      param1: {
        type: 'string',
        description: 'Parameter description'
      },
      param2: {
        type: 'number',
        description: 'Another parameter',
        minimum: 0
      }
    },
    required: ['param1']
  };

  // Required: Static execute method
  static async execute(args: {
    param1: string;
    param2?: number;
  }): Promise<any> {
    try {
      // Your command logic here
      const result = await doSomething(args.param1, args.param2);
      
      return {
        success: true,
        result: result,
        message: 'Command executed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default MyCommand;
```

### Command Best Practices

1. **Always return success/error format**:
   ```typescript
   {
     success: boolean,
     result?: any,
     error?: string,
     message?: string
   }
   ```

2. **Use EntityManager** for entity operations:
   ```typescript
   const characterService = entityManager.getCharacterService();
   const character = characterService.getCharacterById(id);
   ```

3. **Emit events** for important actions:
   ```typescript
   import { eventManager } from '../../core/EventManager.js';
   await eventManager.emit('my:action', data);
   ```

4. **Validate inputs** before processing

## Behaviors

Behaviors define scriptable logic for entities. They're executed when certain actions occur.

### Behavior Structure

```typescript
// bundles/my-bundle/behaviors/item/custom-item.ts
import { BehaviorDefinition } from '../../../../src/core/BehaviorManager.js';

const customItem: BehaviorDefinition = {
  name: 'custom-item',
  description: 'What this behavior does',
  
  async execute(entity: any, character: any, context?: any): Promise<any> {
    // Behavior logic here
    return {
      health_change: 10,
      mental_state_change: 5,
      description: 'You feel refreshed!'
    };
  }
};

export default customItem;
```

### Behavior Types

Behaviors can be attached to:
- **items**: Item use effects (`behaviors/item/`)
- **characters**: Character abilities (`behaviors/character/`)
- **scenes**: Scene-specific logic (`behaviors/scene/`)

### Item Behavior Example

```typescript
// bundles/my-bundle/behaviors/item/magic-potion.ts
import { BehaviorDefinition } from '../../../../src/core/BehaviorManager.js';

const magicPotion: BehaviorDefinition = {
  name: 'magic-potion',
  description: 'Restores health and mental state',
  
  async execute(entity, character) {
    const healthRestore = Math.min(50, 100 - character.health);
    const mentalRestore = Math.min(30, 100 - character.mental_state);
    
    return {
      health_change: healthRestore,
      mental_state_change: mentalRestore,
      description: 'You feel magical energy coursing through you!'
    };
  }
};

export default magicPotion;
```

### Character Behavior Example

```typescript
// bundles/my-bundle/behaviors/character/regen-ability.ts
import { BehaviorDefinition } from '../../../../src/core/BehaviorManager.js';
import { eventManager } from '../../../../src/core/EventManager.js';

const regenAbility: BehaviorDefinition = {
  name: 'regen-ability',
  description: 'Passive health regeneration',
  
  async execute(entity, character) {
    // This could be called periodically or on specific events
    if (character.health < 100) {
      const regen = Math.min(5, 100 - character.health);
      
      await eventManager.emit('character:heal', {
        character,
        amount: regen,
        source: 'regen-ability'
      });
      
      return {
        health_change: regen,
        description: 'Your wounds slowly heal...'
      };
    }
    
    return null; // No effect if already at full health
  }
};

export default regenAbility;
```

## Event Listeners

Event listeners react to game events and execute side effects.

### Event Listener Structure

```typescript
// bundles/my-bundle/events/MyEventListener.ts
import { eventManager } from '../../core/EventManager.js';
import { entityManager } from '../../core/EntityManager.js';

export class MyEventListener {
  static initialize() {
    // Listen to character creation
    eventManager.on('character:created', async (character: any) => {
      console.log(`[MyBundle] Character created: ${character.name}`);
      
      // Do something when character is created
      const memoryService = entityManager.getMemoryService();
      await memoryService.addLongMemory({
        character_id: character.id,
        content: `Custom memory for ${character.name}`,
        importance: 5
      });
    });

    // Listen to item use
    eventManager.on('item:used', async (item: any, character: any, effect: any) => {
      console.log(`[MyBundle] ${character.name} used ${item.name}`);
      
      // Custom logic here
    });

    // Listen to scene changes
    eventManager.on('character:move', async (character: any, oldSceneId: number, newSceneId: number, scene: any) => {
      console.log(`[MyBundle] ${character.name} moved to ${scene.name}`);
    });
  }
}

export default MyEventListener;
```

### Available Events

#### Character Events
- `character:created` - When a character is created
- `character:updated` - When character data is updated
- `character:move` - When character moves to a new scene
- `character:speak` - When character speaks publicly
- `character:message` - When character sends private message

#### Item Events
- `item:created` - When an item is created
- `item:picked` - When an item is picked up
- `item:dropped` - When an item is dropped
- `item:used` - When an item is used

#### Scene Events
- `scene:created` - When a scene is created
- `scene:connected` - When scenes are connected

#### Combat Events
- `effect:activated` - When an effect is activated
- `effect:deactivated` - When an effect is deactivated
- `effect:tick` - When an effect ticks (DOT/HOT)

### Event Listener Registration

Event listeners are automatically loaded from `events/` directory. The class must export an `initialize()` static method:

```typescript
export class MyEventListener {
  static initialize() {
    // Your event listeners here
  }
}
```

## Entities

Entities define custom entity types (advanced).

### Entity Structure

```typescript
// bundles/my-bundle/entities/CustomEntity.ts
import { Entity } from '../../core/Entity.js';

export class CustomEntity extends Entity {
  constructor(id: number | string, data: any) {
    super(id, 'custom', data);
  }

  // Custom methods
  customMethod() {
    // ...
  }
}

export default CustomEntity;
```

## Best Practices

### 1. Dependency Management

Declare dependencies in `manifest.json`:
```json
{
  "dependencies": ["core-bundle", "combat-bundle"]
}
```

### 2. Error Handling

Always handle errors gracefully:
```typescript
try {
  // Your code
} catch (error) {
  console.error(`[MyBundle] Error:`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

### 3. Logging

Use consistent logging format:
```typescript
console.log(`[MyBundle] Message`);
console.error(`[MyBundle] Error:`, error);
```

### 4. Code Organization

- One command per file
- One behavior per file
- Group related behaviors in subdirectories
- Keep event listeners focused

### 5. TypeScript Types

Use proper TypeScript types:
```typescript
import { Character } from '../../models/Character.js';
import { Item } from '../../models/Item.js';
```

## Testing Bundles

### Manual Testing

1. **Build the bundle**:
   ```bash
   npm run build:bundles
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Test via MCP**:
   ```bash
   node test-mcp-tools.mjs
   ```

### Test Command Example

```typescript
// Test your command
const result = await callMCPTool('my_command', {
  param1: 'test',
  param2: 42
});

console.log('Result:', result);
```

### Testing Behaviors

Behaviors are tested indirectly through commands:
1. Create an item with your behavior
2. Use the item via `use_item` command
3. Verify the behavior executed correctly

## Example: Complete Bundle

See `bundles/combat-bundle/` for a complete example with:
- ✅ Effect system (Effect.ts, EffectList.ts)
- ✅ Effect storage (EffectStorage.ts)
- ✅ Multiple commands (ApplyEffectCommand, ListEffectsCommand, RemoveEffectCommand)
- ✅ Custom effects (PoisonEffect, RegenerationEffect)

## Next Steps

1. **Read existing bundles** for examples
2. **Start small** - Create one command first
3. **Test incrementally** - Test each feature as you add it
4. **Document your bundle** - Add README.md to your bundle directory

## Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture overview
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing guide
- [EFFECT_STORAGE.md](./EFFECT_STORAGE.md) - Effect system details
- Existing bundles in `bundles/` directory

---

Happy Bundle Development! 🎮

