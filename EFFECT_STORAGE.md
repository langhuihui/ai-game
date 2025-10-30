# Effect Storage System

## Overview

The Effect Storage system (`EffectStorage`) provides persistent in-memory storage for character effects, ensuring that effects remain available even when characters are reloaded from the database.

## Problem

Previously, effects were stored directly on the character object (`character.effects`). However, when `getCharacterById()` was called, it fetched fresh data from the database, losing the in-memory effect list.

## Solution

Created a singleton `EffectStorage` class that maintains a Map of character IDs to their `EffectList` instances. This allows effects to persist across character reloads.

## Implementation

### EffectStorage Class

Location: `bundles/combat-bundle/lib/EffectStorage.ts`

```typescript
class EffectStorage {
  private effects: Map<number, EffectList> = new Map();
  
  getEffectList(characterId: number, character: any): EffectList
  setEffectList(characterId: number, effectList: EffectList): void
  removeEffectList(characterId: number): void
  hasEffectList(characterId: number): boolean
  cleanupAll(): void
  getAllCharacterIds(): number[]
}
```

### Usage in Commands

#### ApplyEffectCommand
```typescript
import { effectStorage } from '../lib/EffectStorage.js';

// Get or create effect list for character
const effectList = effectStorage.getEffectList(args.character_id, character);
(character as any).effects = effectList; // Attach for compatibility

// Add effect
effectList.add(effect);
```

#### ListEffectsCommand
```typescript
import { effectStorage } from '../lib/EffectStorage.js';

// Check if character has effects
if (effectStorage.hasEffectList(args.character_id)) {
  const effectList = effectStorage.getEffectList(args.character_id, character);
  // List effects...
}
```

#### RemoveEffectCommand
```typescript
import { effectStorage } from '../lib/EffectStorage.js';

// Get effect list and remove effect
const effectList = effectStorage.getEffectList(args.character_id, character);
effectList.remove(effectId);
```

## Benefits

1. **Persistence**: Effects survive character reloads from database
2. **Separation**: Effects stored separately from character data
3. **Cleanup**: Easy to clean up expired effects for all characters
4. **Performance**: Fast lookups using Map structure

## Future Enhancements

### Database Persistence (Optional)
For server restart persistence, effects could be serialized to database:

```sql
CREATE TABLE IF NOT EXISTS character_effects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER NOT NULL,
  effect_name TEXT NOT NULL,
  effect_data TEXT NOT NULL, -- JSON serialized effect
  expires_at DATETIME,
  FOREIGN KEY (character_id) REFERENCES characters (id)
);
```

### Effect Tick System
Implement game loop to process effect ticks:

```typescript
// In GameState
setInterval(() => {
  effectStorage.cleanupAll();
  // Process effect ticks
  for (const [characterId, effectList] of effectStorage.getAllCharacterIds()) {
    effectList.tick(character);
  }
}, 1000); // Every second
```

## Testing

Test results show that:
- ✅ Effects are applied correctly
- ✅ Effects persist across character reloads
- ✅ `list_effects` correctly shows all active effects
- ✅ Effects can be removed properly

## Related Files

- `bundles/combat-bundle/lib/EffectStorage.ts` - Storage implementation
- `bundles/combat-bundle/commands/ApplyEffectCommand.ts` - Uses storage
- `bundles/combat-bundle/commands/ListEffectsCommand.ts` - Uses storage
- `bundles/combat-bundle/commands/RemoveEffectCommand.ts` - Uses storage
- `bundles/combat-bundle/lib/Effect.ts` - Effect and EffectList classes

