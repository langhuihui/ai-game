# Quick Start Guide

Get up and running with Matrix Game v2.0 in minutes!

## Installation

```bash
# Clone repository (if applicable)
cd matrix-game

# Install dependencies
npm install

# Build the project
npm run build
```

## Starting the Server

```bash
# Start server (Web + MCP)
npm start
```

Server will be available at:
- **Web Interface**: http://localhost:3000
- **MCP Endpoint**: http://localhost:3000/mcp
- **MCP Info**: http://localhost:3000/mcp-info

## Testing the Server

### Option 1: Web Interface

1. Open http://localhost:3000 in your browser
2. Navigate to Dashboard
3. Try creating characters, scenes, and items

### Option 2: MCP Tools Test Script

```bash
# In another terminal
node test-mcp-tools.mjs
```

This will:
- ✅ List all available MCP tools
- ✅ Create a test character
- ✅ Apply poison and regeneration effects
- ✅ List active effects
- ✅ Test movement and scene creation

### Option 3: Manual MCP Testing

Use curl or any HTTP client:

```bash
# List tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'

# Create a character
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "create_character",
      "arguments": {
        "name": "TestHero",
        "description": "A test character",
        "personality": "Brave and curious"
      }
    }
  }'
```

## Key Features to Try

### 1. Character Management
```bash
# Create character
# Use MCP tool: create_character

# List characters
# Use MCP tool: list_characters

# Move character
# Use MCP tool: move_character
```

### 2. Effect System
```bash
# Apply poison effect
# Use MCP tool: apply_effect
# Arguments: { character_id: 1, effect_name: "poison" }

# List effects
# Use MCP tool: list_effects
# Arguments: { character_id: 1 }

# Remove effect
# Use MCP tool: remove_effect
# Arguments: { character_id: 1, effect_id: "poison-..." }
```

### 3. Item System
```bash
# Create item
# Use MCP tool: create_item

# Pick up item
# Use MCP tool: pick_item

# Use item
# Use MCP tool: use_item
```

## Verification Checklist

After starting the server, verify:

- [ ] Server starts without errors
- [ ] Web interface loads at http://localhost:3000
- [ ] MCP info endpoint works: http://localhost:3000/mcp-info
- [ ] Bundles load successfully (check console output)
- [ ] Can create characters via MCP
- [ ] Can apply effects via MCP
- [ ] Effects persist correctly

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

### Build Errors

```bash
# Clean build
rm -rf dist
npm run build
```

### Bundle Loading Issues

1. Check bundle paths in `src/index.ts`
2. Verify bundles compiled: `ls dist/bundles/`
3. Check manifest.json files exist

## Next Steps

1. **Read Documentation**:
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture overview
   - [BUNDLE_DEVELOPMENT_GUIDE.md](./BUNDLE_DEVELOPMENT_GUIDE.md) - Bundle development
   - [EFFECT_STORAGE.md](./EFFECT_STORAGE.md) - Effect system details

2. **Explore Existing Bundles**:
   - `bundles/combat-bundle/` - Effect system
   - `bundles/items-bundle/` - Item behaviors
   - `bundles/core-bundle/` - Core commands

3. **Create Your Own Bundle**:
   - Follow [BUNDLE_DEVELOPMENT_GUIDE.md](./BUNDLE_DEVELOPMENT_GUIDE.md)
   - Start with a simple command
   - Test incrementally

## Getting Help

- Check console logs for errors
- Review [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- See [MCP_TEST_RESULTS.md](./MCP_TEST_RESULTS.md) for test examples

---

**Happy Gaming! 🎮**

