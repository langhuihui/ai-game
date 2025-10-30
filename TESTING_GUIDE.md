# Testing Guide - Matrix Game v2.0

This guide will help you test the refactored RanvierMUD-inspired architecture.

## Quick Start Testing

### 1. Build the Project

```bash
cd /Users/dexter/project/matrix-game
npm run build
```

Expected: Clean build with no errors ✅ (Already verified)

### 2. Start the Server

```bash
npm start
```

Expected output:
```
🎮 Initializing Matrix Game Server with RanvierMUD Architecture...
✅ Game server initialized successfully
📦 Loaded bundles: items-bundle, core-bundle, combat-bundle, memory-bundle, social-bundle, admin-bundle
🌐 Web server running on http://localhost:3000
🚀 Starting Matrix Game Server (Web + MCP)...
✅ Server started successfully
   - Web interface: http://localhost:3000
   - MCP SSE: http://localhost:3000/mcp
   - MCP Info: http://localhost:3000/mcp-info
```

### 3. Test Web Interface

Open browser and visit:

#### Dashboard
- URL: http://localhost:3000
- Should show: Game statistics, recent logs
- Test: Navigate between pages

#### Characters Page
- URL: http://localhost:3000/characters
- Should show: All characters with memories and items
- Test: View character details

#### Scenes Page
- URL: http://localhost:3000/scenes
- Should show: All scenes with connections and inhabitants
- Test: View scene details

#### Items Page
- URL: http://localhost:3000/items
- Should show: All items and their locations
- Test: View item list

#### MCP Config Page
- URL: http://localhost:3000/mcp-config
- Should show: All available MCP tools organized by category
- Test: Browse tool categories

### 4. Test MCP Info Endpoint

```bash
curl http://localhost:3000/mcp-info | jq
```

Expected:
```json
{
  "name": "matrix-game",
  "version": "2.0.0",
  "architecture": "RanvierMUD-inspired",
  "bundles": [
    "items-bundle",
    "core-bundle",
    "combat-bundle",
    "memory-bundle",
    "social-bundle",
    "admin-bundle"
  ],
  "tools": 53,
  "status": "running",
  ...
}
```

## Testing Bundle System

### Test 1: Bundle Loading

**What to test**: Bundles load correctly on startup

**How to test**:
1. Start server with `npm start`
2. Check console output for bundle loading messages
3. Visit http://localhost:3000/mcp-info
4. Verify all 6 bundles are listed

**Expected result**:
- ✅ All bundles load without errors
- ✅ Console shows "Loaded bundles: ..." message
- ✅ MCP info endpoint lists all bundles

### Test 2: Item Behaviors

**What to test**: Item behaviors execute correctly when items are used

**How to test via MCP**:

1. Create a character:
```json
{
  "tool": "create_character",
  "arguments": {
    "name": "TestHero",
    "description": "A test character",
    "personality": "Brave and curious"
  }
}
```

2. Create a health potion:
```json
{
  "tool": "create_item",
  "arguments": {
    "name": "health potion",
    "description": "Restores health",
    "character_id": 1
  }
}
```

3. Damage the character:
```json
{
  "tool": "update_character",
  "arguments": {
    "character_id": 1,
    "health": 50
  }
}
```

4. Use the health potion:
```json
{
  "tool": "use_item",
  "arguments": {
    "character_id": 1,
    "item_id": 1
  }
}
```

**Expected result**:
- ✅ Character health increases by 20 (50 → 70)
- ✅ Effect description: "You feel your wounds healing..."
- ✅ Item is consumed (deleted)
- ✅ Memory auto-created about using item

### Test 3: Event System

**What to test**: Events are emitted and listeners respond

**How to test**:
1. Start server and watch console output
2. Create a character via MCP
3. Move character to a scene
4. Use an item

**Expected console output**:
```
[CharacterEvent] Character created: TestHero (ID: 1)
[CharacterEvent] TestHero moved to Town Square
[ItemEvent] TestHero used health potion with effect: You feel your wounds healing...
[CombatEvent] TestHero health changed: +20 (now 70/100)
[MemoryEventListener] Initialized memory auto-tracking
```

**Expected result**:
- ✅ All event listeners respond
- ✅ Logs show event processing
- ✅ Memory auto-created for actions

## Testing Event-Driven Features

### Test 4: Auto-Memory Creation

**What to test**: Memory bundle automatically creates memories

**Test scenario**:
1. Create character
2. Move character to scene
3. Use an item
4. Check character memories

**Expected result**:
- ✅ Memory for character birth
- ✅ Memory for location movement
- ✅ Memory for item usage
- ✅ All memories have correct timestamps

**Verify via API**:
```bash
curl http://localhost:3000/api/characters/1/memories
```

### Test 5: Combat Monitoring

**What to test**: Combat bundle tracks health changes

**Test scenario**:
1. Create character with 100 health
2. Update health to 15 (critical)
3. Update health to 0 (fallen)
4. Check console logs

**Expected console output**:
```
[CombatEvent] TestHero health changed: -85 (now 15/100)
[CombatEvent] ⚠️ TestHero is in critical condition!
[CombatEvent] TestHero health changed: -15 (now 0/100)
[CombatEvent] ⚠️ TestHero has fallen! Health at 0
```

**Expected result**:
- ✅ Health changes logged
- ✅ Warnings for critical health
- ✅ Alert when health reaches 0

## Testing Command System

### Test 6: Command Routing

**What to test**: Commands route correctly through ToolAdapter

**Test scenario**:
Test a command implemented in a bundle (e.g., `pick_item`)

**How to test**:
1. Create scene, character, and item in scene
2. Call `pick_item` via MCP
3. Verify item moved to character inventory

**Expected result**:
- ✅ Command executes via PickCommand in items-bundle
- ✅ Item ownership transferred
- ✅ Event emitted: `item:picked`
- ✅ Response returned to MCP client

### Test 7: Legacy Tool Compatibility

**What to test**: Legacy tools still work via ToolAdapter

**Test scenario**:
Call a tool not yet migrated to bundles (e.g., `list_characters`)

**Expected result**:
- ✅ Tool executes via legacy handler
- ✅ Returns correct data
- ✅ No errors in console

## Performance Testing

### Test 8: Bundle Load Time

**What to test**: Bundles load quickly

**How to measure**:
```bash
time npm start
```

**Expected result**:
- ✅ Server starts in < 5 seconds
- ✅ All bundles load successfully
- ✅ No lag in web interface

### Test 9: Event Performance

**What to test**: Event system doesn't slow down operations

**Test scenario**:
1. Create 10 characters rapidly
2. Move all characters
3. Use multiple items

**Expected result**:
- ✅ Operations complete quickly
- ✅ No noticeable lag
- ✅ All events processed correctly

## Regression Testing

### Test 10: Existing MCP Tools

**What to test**: All original MCP tools still work

**Tools to test**:
- ✅ `create_character`
- ✅ `create_scene`
- ✅ `create_item`
- ✅ `move_character`
- ✅ `pick_item`
- ✅ `drop_item`
- ✅ `use_item`
- ✅ `add_short_memory`
- ✅ `add_long_memory`
- ✅ `create_trade_offer`
- ✅ `send_direct_message`

**Expected result**:
- ✅ All tools return success
- ✅ Data persists to database
- ✅ Web interface reflects changes

### Test 11: Web Interface API

**What to test**: All web API endpoints work

**Endpoints to test**:
```bash
curl http://localhost:3000/api/characters
curl http://localhost:3000/api/scenes
curl http://localhost:3000/api/items
curl http://localhost:3000/api/logs
curl http://localhost:3000/api/stats
curl http://localhost:3000/api/tools
```

**Expected result**:
- ✅ All endpoints return 200 OK
- ✅ Data format correct
- ✅ No errors in console

## Stress Testing

### Test 12: Multiple Concurrent Requests

**What to test**: Server handles concurrent requests

**How to test**:
```bash
# Create 10 characters concurrently
for i in {1..10}; do
  curl -X POST http://localhost:3000/mcp \
    -H "Content-Type: application/json" \
    -d '{
      "jsonrpc": "2.0",
      "method": "tools/call",
      "params": {
        "name": "create_character",
        "arguments": {
          "name": "Hero'$i'",
          "description": "Test character",
          "personality": "Brave"
        }
      },
      "id": '$i'
    }' &
done
wait
```

**Expected result**:
- ✅ All requests complete successfully
- ✅ 10 characters created
- ✅ No race conditions
- ✅ Events processed for all

## Troubleshooting

### Issue: Bundles not loading

**Symptoms**: Console shows bundle load errors

**Check**:
1. Bundle manifest.json syntax
2. File paths in manifest
3. TypeScript compilation errors

**Fix**:
```bash
npm run build
# Check for errors
```

### Issue: Behaviors not executing

**Symptoms**: Item use has no effect

**Check**:
1. Behavior file exported correctly
2. Behavior name matches item name
3. BehaviorManager registered behavior

**Debug**:
```typescript
// Add to UseCommand
console.log('Looking for behavior:', behaviorName);
console.log('Has behavior:', behaviorManager.has('item', behaviorName));
```

### Issue: Events not firing

**Symptoms**: No console logs from event listeners

**Check**:
1. Event listener init function called
2. Event name spelling
3. EventManager.on() called

**Debug**:
```typescript
// Add to event listener
console.log('Event listener initialized');
eventManager.on('test:event', () => {
  console.log('Test event fired!');
});
```

## Success Criteria

### ✅ Core Functionality
- [ ] Server starts without errors
- [ ] All 6 bundles load successfully
- [ ] Web interface fully functional
- [ ] MCP tools work correctly

### ✅ Bundle System
- [ ] Item behaviors execute correctly
- [ ] Commands route through bundles
- [ ] Event listeners respond to events
- [ ] Bundle manifests valid

### ✅ Event System
- [ ] Events emitted on actions
- [ ] Listeners process events
- [ ] Auto-tracking works (memory, combat)
- [ ] No event-related errors

### ✅ Performance
- [ ] Server starts quickly (< 5 seconds)
- [ ] Operations complete promptly
- [ ] No lag in web interface
- [ ] Handles concurrent requests

### ✅ Compatibility
- [ ] All original MCP tools work
- [ ] Web API endpoints functional
- [ ] Database operations unchanged
- [ ] Existing clients compatible

## Reporting Issues

If you find issues during testing:

1. **Document the issue**:
   - What were you testing?
   - What did you expect?
   - What actually happened?
   - Console error messages?

2. **Check the logs**:
   - Console output
   - Browser console (F12)
   - Network requests

3. **Verify the setup**:
   - `npm run build` successful?
   - All dependencies installed?
   - Correct Node version?

4. **Create a minimal reproduction**:
   - Simplest steps to reproduce
   - Expected vs actual behavior
   - Screenshots if relevant

## Next Steps After Testing

Once testing is complete:

1. **If successful**:
   - Ready for production deployment
   - Consider gradual rollout
   - Monitor for issues

2. **If issues found**:
   - Document all issues
   - Prioritize fixes
   - Test fixes before deployment

3. **Future development**:
   - Create custom bundles
   - Add more behaviors
   - Implement hot-reload
   - Build visual tools

---

**Happy Testing! 🎮**

