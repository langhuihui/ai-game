# Changelog

## [2.0.0] - RanvierMUD Architecture Refactoring

### 🎮 Major Changes

This release represents a complete architectural overhaul, implementing a RanvierMUD-inspired design while maintaining full backward compatibility.

### ✨ New Features

#### Core Engine
- **EventManager**: Central event system with priority-based listeners and async support
- **EntityManager**: Unified entity management wrapping existing services
- **BehaviorManager**: Scriptable behavior system for dynamic entity functionality
- **BundleLoader**: Dynamic bundle loading with dependency management
- **GameState**: Singleton state manager with lifecycle control
- **Entity Base Class**: Foundation for all game entities with behavior support

#### Bundle System
- **Modular Architecture**: 6 core bundles organizing game features
  - `items-bundle`: Item system with 5 scriptable behaviors
  - `core-bundle`: Character and scene management
  - `combat-bundle`: Health/mental state tracking
  - `memory-bundle`: Auto-tracking memory system
  - `social-bundle`: Trading, messaging, citizenship
  - `admin-bundle`: Permission management

#### Scriptable Behaviors
- **Item Behaviors**: 
  - `health-potion`: Restores 20 health
  - `mental-tonic`: Restores 15 mental state
  - `poison`: Damages 30 health
  - `stress-relief`: Restores 25 mental state
  - `energy-drink`: Restores 10 health + 10 mental state

#### Event-Driven Features
- **Auto-tracking**: Automatic memory creation on actions
- **Combat Monitoring**: Real-time health/mental state tracking
- **Social Logging**: Trade and message tracking
- **Admin Auditing**: Permission change logging

#### MCP Integration
- **ToolAdapter**: Smart routing between bundle commands and legacy tools
- **CommandRegistry**: Unified command management
- **MCPServer**: Refactored server using new architecture

### 🔧 Technical Improvements

- **25 New Files**: 
  - 6 core engine files
  - 3 MCP integration files
  - 16 bundle files (commands, behaviors, events)
  
- **Enhanced Modularity**: Clear separation of concerns with bundle isolation
- **Event-Driven**: Decoupled components communicating via events
- **Extensibility**: Add features without modifying core code
- **Maintainability**: Improved code organization and documentation

### 📚 Documentation

- **ARCHITECTURE.md**: Comprehensive architecture guide
  - Core component descriptions
  - Bundle development guide
  - Event system documentation
  - Behavior creation guide
  - Troubleshooting section

- **Updated README.md**: New features, architecture overview, examples
- **REFACTORING_SUMMARY.md**: Complete refactoring details
- **CHANGELOG.md**: This file

### 🔄 Backward Compatibility

- ✅ All existing MCP tools work unchanged
- ✅ Web interface fully functional
- ✅ Database schema unchanged
- ✅ All legacy services intact
- ✅ Existing clients compatible

### 🏗️ Infrastructure

- **TypeScript**: All new code in TypeScript
- **Compilation**: Clean build with no errors
- **Code Quality**: No linter errors
- **Version**: Bumped to 2.0.0

### 📦 Files Changed

#### Added
```
src/core/
src/mcp/
bundles/
ARCHITECTURE.md
REFACTORING_SUMMARY.md
CHANGELOG.md
```

#### Modified
```
src/index.ts (refactored)
package.json (v2.0.0)
README.md (updated)
```

#### Backed Up
```
src/index_old.ts (original preserved)
```

### 🚀 Performance

- Event system: Async, non-blocking
- Bundle loading: Cached after first load
- Behaviors: Lazy loaded on demand
- Database: No performance impact

### 🎯 Benefits

1. **Modularity**: Features in isolated bundles
2. **Extensibility**: Add behaviors without core changes
3. **Maintainability**: Clear code organization
4. **Flexibility**: Easy to customize and extend
5. **Compatibility**: Works with existing clients

### ⚡ Breaking Changes

None. All existing functionality preserved.

### 🔮 Future Plans

- Hot-reload for bundles
- Bundle marketplace
- Visual behavior editor
- Performance profiling tools
- Entity Component System (ECS)

### 📊 Statistics

- **Lines of Code Added**: ~2,500+
- **New Files**: 25
- **Bundles**: 6
- **Behaviors**: 5
- **Commands**: 4
- **Event Listeners**: 6

### 🙏 Acknowledgments

Inspired by [RanvierMUD](https://ranviermud.com/), an extensible MUD engine built on Node.js.

---

## [1.0.0] - Initial Release

- Basic MCP game server
- Character, scene, and item management
- Memory system
- Trading and messaging
- Web interface
- Permission system

