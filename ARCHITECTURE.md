# Matrix Game - RanvierMUD-Inspired Architecture

## Overview

Matrix Game has been refactored to use a RanvierMUD-inspired architecture, featuring:
- **Bundle System**: Modular packages for features
- **Event-Driven Architecture**: Decoupled components communicating via events
- **Behavior System**: Scriptable entity behaviors
- **MCP Integration**: Seamless integration with Model Context Protocol

## Architecture Layers

### 1. Core Engine (`src/core/`)

The core engine provides fundamental game infrastructure:

#### EventManager
- Central event emitter for all game events
- Supports priority-based listeners
- Wildcard event subscriptions
- Async event handling

```typescript
import { eventManager } from './core/EventManager.js';

// Listen to events
eventManager.on('character:move', async (character, oldScene, newScene) => {
  console.log(`${character.name} moved to ${newScene.name}`);
});

// Emit events
await eventManager.emit('character:move', character, oldSceneId, newSceneId, scene);
```

#### EntityManager
- CRUD operations for all game entities
- Wraps existing services
- Emits events for entity changes
- Provides unified entity access

```typescript
import { entityManager } from './core/EntityManager.js';

// Create entities with automatic event emission
const character = await entityManager.createCharacter(data);
const item = await entityManager.createItem(data);

// Move character (emits 'character:move' event)
await entityManager.moveCharacter(characterId, sceneId);
```

#### BehaviorManager
- Register and execute behaviors
- Load behaviors from files
- Attach behaviors to entities
- Dynamic behavior execution

```typescript
import { behaviorManager } from './core/BehaviorManager.js';

// Register a behavior
behaviorManager.register('item', {
  name: 'health-potion',
  execute: async (entity, character) => {
    return { health_change: 20, description: 'Heals 20 HP' };
  }
});

// Execute a behavior
const effect = await behavior.execute(entity, character);
```

#### BundleLoader
- Load bundles from filesystem
- Manage bundle dependencies
- Hot-reload support
- Command and behavior registration

```typescript
import { bundleLoader } from './core/BundleLoader.js';

// Load a bundle
await bundleLoader.load('./bundles/items-bundle');

// Get all commands from bundles
const commands = bundleLoader.getAllCommands();
```

#### GameState
- Singleton game state manager
- Configuration management
- Access to all managers
- Lifecycle management

```typescript
import { getGameState } from './core/GameState.js';

const gameState = getGameState();
await gameState.initialize({ bundles: ['./bundles/core-bundle'] });
await gameState.start();
```

#### Entity Base Class
- Base class for all entities
- Behavior attachment
- Event emission
- Metadata storage

```typescript
import { Entity } from './core/Entity.js';

class Character extends Entity {
  constructor(id: number) {
    super(id, 'character');
  }
  
  toJSON() { /* ... */ }
  fromJSON(data: any) { /* ... */ }
}
```

### 2. Bundle System (`bundles/`)

Bundles are modular packages containing related game features.

#### Bundle Structure

```
bundles/
├── items-bundle/
│   ├── manifest.json          # Bundle metadata
│   ├── commands/              # Command implementations
│   │   ├── PickCommand.ts
│   │   ├── DropCommand.ts
│   │   └── UseCommand.ts
│   ├── behaviors/             # Behavior scripts
│   │   └── item/
│   │       ├── health-potion.ts
│   │       ├── poison.ts
│   │       └── energy-drink.ts
│   ├── entities/              # Entity definitions
│   │   └── Item.ts
│   └── events/                # Event listeners
│       └── ItemEventListener.ts
```

#### Bundle Manifest

```json
{
  "name": "items-bundle",
  "version": "1.0.0",
  "description": "Item system with inventory management",
  "dependencies": ["core-bundle"],
  "commands": ["PickCommand", "DropCommand", "UseCommand"],
  "behaviors": {
    "item": ["health-potion", "poison", "energy-drink"]
  },
  "entities": ["Item"],
  "events": ["ItemEventListener"]
}
```

#### Available Bundles

1. **core-bundle**: Characters, scenes, movement
2. **items-bundle**: Item system, inventory, item behaviors
3. **combat-bundle**: Health/mental state management
4. **memory-bundle**: Memory system with auto-tracking
5. **social-bundle**: Trading, messaging, citizenship
6. **admin-bundle**: Permission management, admin tools

### 3. Event System

Events connect bundles and enable reactive programming:

#### Event Naming Convention
- `entity:action` format (e.g., `character:move`, `item:used`)
- Entities emit events automatically
- Bundles listen to relevant events

#### Common Events

- **Character Events**:
  - `character:created` - Character was created
  - `character:updated` - Character was modified
  - `character:deleted` - Character was deleted
  - `character:move` - Character moved to new scene

- **Item Events**:
  - `item:created` - Item was created
  - `item:picked` - Item was picked up
  - `item:dropped` - Item was dropped
  - `item:used` - Item was used/consumed
  - `item:before-use` - Before item use (can modify behavior)

- **Scene Events**:
  - `scene:created` - Scene was created
  - `scene:connected` - Scenes were connected

- **Game Events**:
  - `game:initialized` - Game state initialized
  - `game:start` - Game started
  - `game:stop` - Game stopped
  - `bundle:loaded` - Bundle was loaded

### 4. Behavior System

Behaviors are scriptable functions that define entity functionality.

#### Behavior Definition

```typescript
// bundles/items-bundle/behaviors/item/health-potion.ts
import { BehaviorDefinition } from '../../../../src/core/BehaviorManager.js';

const healthPotion: BehaviorDefinition = {
  name: 'health-potion',
  description: 'Restores 20 health points',
  
  async execute(entity: Entity, character: any): Promise<any> {
    return {
      health_change: 20,
      mental_state_change: 0,
      description: 'You feel your wounds healing.'
    };
  }
};

export default healthPotion;
```

#### Using Behaviors

```typescript
// In UseCommand
const behaviorName = item.name.toLowerCase().replace(/\s+/g, '-');

if (behaviorManager.has('item', behaviorName)) {
  const behavior = behaviorManager.get('item', behaviorName);
  const effect = await behavior.execute(null, character);
  
  // Apply effect to character
  if (effect.health_change) {
    characterService.updateCharacterHealth(characterId, effect.health_change);
  }
}
```

### 5. MCP Integration (`src/mcp/`)

The MCP layer wraps the new architecture and maintains compatibility.

#### ToolAdapter
- Maps MCP tools to bundle commands
- Provides backward compatibility
- Routes tool calls to appropriate handlers

```typescript
import { toolAdapter } from './mcp/ToolAdapter.js';

// Execute a tool (routes to bundle command or legacy implementation)
const result = await toolAdapter.executeTool('pick_item', args, context);

// Get tools by permission level
const tools = toolAdapter.getToolsByPermission('citizen');
```

#### CommandRegistry
- Registry of all commands from bundles
- Execute commands by name
- Load commands from bundles

```typescript
import { commandRegistry } from './mcp/CommandRegistry.js';

// Register a command
commandRegistry.register({
  name: 'pick_item',
  description: 'Pick up an item',
  execute: async (args) => { /* ... */ }
});

// Execute a command
const result = await commandRegistry.execute('pick_item', args);
```

#### MCPServer
- Refactored MCP server using new architecture
- Initializes GameState and loads bundles
- Handles MCP protocol requests

## Data Flow

### Example: Using an Item

1. **MCP Tool Call** → `toolAdapter.executeTool('use_item', args)`
2. **Command Routing** → `commandRegistry.execute('use_item', args)`
3. **UseCommand** → Gets item, checks ownership
4. **Behavior Lookup** → `behaviorManager.get('item', 'health-potion')`
5. **Behavior Execution** → Returns effect `{ health_change: 20 }`
6. **Apply Effect** → Update character health via EntityManager
7. **Event Emission** → `eventManager.emit('item:used', item, character, effect)`
8. **Event Listeners** → Memory bundle auto-creates memory, Combat bundle logs health change
9. **Response** → Return result to MCP client

## Benefits

### Modularity
- Features isolated in bundles
- Easy to add/remove features
- Clear separation of concerns

### Extensibility
- Add behaviors without core changes
- Create new bundles for new features
- Override behaviors dynamically

### Decoupling
- Event system reduces dependencies
- Bundles don't know about each other
- Easy to test components in isolation

### Maintainability
- Clear code organization
- Single responsibility principle
- Easier debugging and troubleshooting

### Compatibility
- MCP interface unchanged
- Existing clients work as-is
- Gradual migration path

## Development

### Creating a New Bundle

1. Create bundle directory structure:
```bash
mkdir -p bundles/my-bundle/{commands,behaviors,entities,events}
```

2. Create manifest.json:
```json
{
  "name": "my-bundle",
  "version": "1.0.0",
  "description": "My custom bundle",
  "dependencies": [],
  "commands": [],
  "behaviors": {},
  "entities": [],
  "events": []
}
```

3. Add commands, behaviors, and event listeners

4. Load bundle in GameState:
```typescript
await gameState.initialize({
  bundles: ['./bundles/my-bundle']
});
```

### Creating a Behavior

```typescript
// bundles/my-bundle/behaviors/entity-type/behavior-name.ts
import { BehaviorDefinition } from '../../../../src/core/BehaviorManager.js';

const myBehavior: BehaviorDefinition = {
  name: 'my-behavior',
  description: 'Does something cool',
  
  async execute(entity: Entity, ...args: any[]): Promise<any> {
    // Your behavior logic here
    return { /* result */ };
  }
};

export default myBehavior;
```

### Creating a Command

```typescript
// bundles/my-bundle/commands/MyCommand.ts
import { entityManager } from '../../../src/core/EntityManager.js';

export class MyCommand {
  static name = 'my_command';
  static description = 'My custom command';

  static async execute(args: any): Promise<any> {
    try {
      // Command logic here
      return {
        success: true,
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

### Creating Event Listeners

```typescript
// bundles/my-bundle/events/MyEventListener.ts
import { EventManager } from '../../../src/core/EventManager.js';

export async function init(eventManager: EventManager): Promise<void> {
  eventManager.on('character:move', async (character, oldScene, newScene) => {
    console.log(`[MyBundle] ${character.name} moved`);
  });
  
  // Add more listeners...
}

export default { init };
```

## Migration from Old Architecture

The refactoring maintains backward compatibility:

- **Services**: Still available via EntityManager
- **Tools**: Gradually migrated to Commands
- **MCP Interface**: Unchanged, uses ToolAdapter
- **Web Interface**: Works as before
- **Database**: No changes required

## Performance Considerations

- Event listeners execute asynchronously
- Behaviors loaded lazily
- Bundles cached after initial load
- Database operations unchanged

## Future Enhancements

- Hot-reload bundles without restart
- Bundle marketplace/repository
- Visual bundle editor
- Performance profiling tools
- Behavior composition and inheritance
- Entity component system (ECS)

## Troubleshooting

### Bundle Not Loading
- Check manifest.json syntax
- Verify bundle path in GameState config
- Check console for error messages

### Behavior Not Found
- Ensure behavior file exported correctly
- Check behavior name matches item name
- Verify behavior registered in BehaviorManager

### Event Not Firing
- Check event name spelling
- Ensure event listener registered
- Verify event emission code

### Command Not Available
- Check bundle manifest includes command
- Verify command exported correctly
- Reload commands with `toolAdapter.reloadFromBundles()`

## Resources

- [RanvierMUD Documentation](https://ranviermud.com/)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Behavior Pattern](https://en.wikipedia.org/wiki/Strategy_pattern)
- [Model Context Protocol](https://modelcontextprotocol.io/)

