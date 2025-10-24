# MCP Game Server

A multiplayer text-based game server built with Node.js and the Model Context Protocol (MCP). This server provides MCP interfaces for controlling characters, managing scenes, handling actions, and managing character memories in a text-based game world.

## Features

- **Character Management**: Create, update, and manage game characters with health, mental state, and personality
- **Scene System**: Create interconnected scenes with doors and roads
- **Item System**: Create, pick up, drop, and use items with effects on character stats
- **Memory System**: Short-term and long-term memory management for characters
- **Action System**: Move characters, speak publicly/privately, interact with items
- **MCP Integration**: Full MCP tool interface for AI agent control

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

## Server Architecture

The project consists of a single server with two MCP endpoints:

### Main Game Server (Port 3000)
- **Main MCP URL**: `http://localhost:3000/mcp`
- **Super Admin MCP URL**: `http://localhost:3000/admin/mcp`
- **Purpose**: General game operations, character management, scene interactions
- **Tools**: 60+ tools total (53+ game tools + 7 admin tools)
- **Access**: Super Admin tools require Super Admin secret key

## MCP Tools

### Main Game Server Tools (53+ tools)

#### Character Management
- `create_character`: Create a new character
- `get_character`: Get character by ID
- `get_character_by_name`: Get character by name
- `list_characters`: List all characters
- `update_character`: Update character information

### Scene Management
- `create_scene`: Create a new scene
- `get_scene`: Get scene by ID
- `get_scene_by_name`: Get scene by name
- `get_scene_details`: Get detailed scene information (characters, items, connections)
- `list_scenes`: List all scenes
- `connect_scenes`: Connect two scenes with a door or road
- `get_scene_connections`: Get connections from a scene

### Actions
- `move_character`: Move character to adjacent scene
- `speak_public`: Make public announcement
- `speak_private`: Send private message
- `pick_item`: Pick up item from scene
- `drop_item`: Drop item in current scene
- `use_item`: Use item (consumes item, may affect stats)
- `create_item`: Create new item
- `get_character_items`: Get items owned by character

### Memory Management
- `add_short_memory`: Add short-term memory
- `add_long_memory`: Add long-term memory
- `get_short_memories`: Get short-term memories
- `get_long_memories`: Get long-term memories
- `update_short_memory`: Update short-term memory
- `update_long_memory`: Update long-term memory
- `delete_short_memory`: Delete short-term memory
- `delete_long_memory`: Delete long-term memory

### Super Admin Server Tools (7 tools)

#### Permission Management
- `create_character_permission`: Create a permission for a character (requires manager or super admin)
- `update_character_permission`: Update a character's permission level (requires manager or super admin)
- `revoke_character_permission`: Revoke a character's permission (requires manager or super admin)
- `list_all_permissions`: List all permissions (requires manager or super admin)
- `get_permission_stats`: Get permission statistics (requires manager or super admin)

#### Super Admin Operations
- `create_super_admin`: Create a super admin permission (requires super admin)
- `cleanup_expired_permissions`: Clean up expired permissions (requires super admin)

## Database

The server uses SQLite for data persistence. The database file `game.db` will be created automatically when the server starts.

### Database Schema

- **characters**: Character information and stats
- **scenes**: Game world scenes
- **scene_connections**: Connections between scenes
- **items**: Game items and their locations
- **short_memories**: Recent memories (limited to 20 per character)
- **long_memories**: Important long-term memories

## Item Effects

The server includes predefined item effects:
- `health_potion`: +20 health
- `mental_tonic`: +15 mental state
- `poison`: -30 health
- `stress_relief`: +25 mental state
- `energy_drink`: +10 health, +10 mental state

## Web Interface

The server includes a web interface for monitoring and managing the game world:

### Starting the Server

The server provides both MCP tools and Web interface:

**Default mode (Web + MCP info):**
```bash
npm run build
npm start
```

**MCP stdio mode (for AI agents):**
```bash
npm run build
npm run start:stdio
```

**Web only mode:**
```bash
npm run build
npm run start:web
```

This will start:
- **Web Interface**: Available at http://localhost:3000
- **MCP Info**: Available at http://localhost:3000/mcp
- **MCP Tools**: Available via stdio when using `--stdio` mode

Open http://localhost:3000 in your browser to access the web interface and MCP configuration.

### Web Interface Features
- **Dashboard**: Overview of game statistics and recent activity
- **Character Management**: View all characters with detailed information including health, mental state, memories, and inventory
- **Scene Management**: Browse all scenes with details about characters present, items, and connections
- **Item Tracking**: View all items and their current locations
- **Action Logs**: Monitor all character actions with filtering by date and character
- **Real-time Updates**: Refresh data to see the latest game state

## Usage Example

1. Create a scene:
```json
{
  "name": "create_scene",
  "arguments": {
    "name": "Town Square",
    "description": "A bustling town square with a fountain in the center"
  }
}
```

2. Create a character:
```json
{
  "name": "create_character",
  "arguments": {
    "name": "Alice",
    "description": "A young adventurer with bright eyes",
    "personality": "Curious and brave, always seeking new experiences",
    "current_scene_id": 1
  }
}
```

3. Create an item:
```json
{
  "name": "create_item",
  "arguments": {
    "name": "health_potion",
    "description": "A red potion that restores health",
    "scene_id": 1
  }
}
```

4. Have character pick up and use the item:
```json
{
  "name": "pick_item",
  "arguments": {
    "character_id": 1,
    "item_id": 1
  }
}
```

```json
{
  "name": "use_item",
  "arguments": {
    "character_id": 1,
    "item_id": 1
  }
}
```

## Development

- `npm run build`: Compile TypeScript
- `npm run dev`: Watch mode compilation
- `npm start`: Run the server (Web interface + MCP info)
- `npm run start:stdio`: Run MCP server in stdio mode
- `npm run start:web`: Run web interface only

## License

MIT
