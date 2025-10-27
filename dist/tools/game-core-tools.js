import { CharacterService } from '../services/CharacterService.js';
import { SceneService } from '../services/SceneService.js';
import { ItemService } from '../services/ItemService.js';
import { MemoryService } from '../services/MemoryService.js';
import { LoggingService } from '../services/LoggingService.js';
export class GameCoreTools {
    characterService = new CharacterService();
    sceneService = new SceneService();
    itemService = new ItemService();
    memoryService = new MemoryService();
    loggingService = new LoggingService();
    getTools() {
        return [
            // 角色管理工具
            {
                name: 'create_character',
                description: 'Create a new character in the game',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Character name (must be unique)'
                        },
                        description: {
                            type: 'string',
                            description: 'Physical description of the character'
                        },
                        personality: {
                            type: 'string',
                            description: 'Personality traits and background'
                        },
                        health: {
                            type: 'number',
                            description: 'Initial health (0-100, default: 100)',
                            minimum: 0,
                            maximum: 100
                        },
                        mental_state: {
                            type: 'number',
                            description: 'Initial mental state (0-100, default: 100)',
                            minimum: 0,
                            maximum: 100
                        },
                        current_scene_id: {
                            type: 'number',
                            description: 'ID of the scene where character starts (optional)'
                        }
                    },
                    required: ['name', 'description', 'personality']
                }
            },
            {
                name: 'update_character',
                description: 'Update character information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: {
                            type: 'number',
                            description: 'Character ID'
                        },
                        name: {
                            type: 'string',
                            description: 'New character name'
                        },
                        description: {
                            type: 'string',
                            description: 'New character description'
                        },
                        personality: {
                            type: 'string',
                            description: 'New personality description'
                        },
                        health: {
                            type: 'number',
                            description: 'New health value (0-100)',
                            minimum: 0,
                            maximum: 100
                        },
                        mental_state: {
                            type: 'number',
                            description: 'New mental state value (0-100)',
                            minimum: 0,
                            maximum: 100
                        },
                        current_scene_id: {
                            type: 'number',
                            description: 'New current scene ID'
                        }
                    },
                    required: ['character_id']
                }
            },
            // 场景管理工具
            {
                name: 'create_scene',
                description: 'Create a new scene in the game world',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Scene name (must be unique)'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of the scene'
                        }
                    },
                    required: ['name', 'description']
                }
            },
            {
                name: 'connect_scenes',
                description: 'Create a connection between two scenes',
                inputSchema: {
                    type: 'object',
                    properties: {
                        from_scene_id: {
                            type: 'number',
                            description: 'Source scene ID'
                        },
                        to_scene_id: {
                            type: 'number',
                            description: 'Destination scene ID'
                        },
                        connection_type: {
                            type: 'string',
                            enum: ['door', 'road'],
                            description: 'Type of connection'
                        },
                        description: {
                            type: 'string',
                            description: 'Description of the connection'
                        }
                    },
                    required: ['from_scene_id', 'to_scene_id', 'connection_type', 'description']
                }
            },
            // 角色行为工具
            {
                name: 'move_character',
                description: 'Move a character to an adjacent scene',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: {
                            type: 'number',
                            description: 'Character ID'
                        },
                        target_scene_id: {
                            type: 'number',
                            description: 'Target scene ID'
                        }
                    },
                    required: ['character_id', 'target_scene_id']
                }
            },
            {
                name: 'speak_public',
                description: 'Make a public announcement that all characters in the same scene can hear',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: {
                            type: 'number',
                            description: 'Character ID'
                        },
                        message: {
                            type: 'string',
                            description: 'Message to speak publicly'
                        }
                    },
                    required: ['character_id', 'message']
                }
            },
            {
                name: 'speak_private',
                description: 'Send a private message to another character',
                inputSchema: {
                    type: 'object',
                    properties: {
                        from_character_id: {
                            type: 'number',
                            description: 'Sender character ID'
                        },
                        to_character_id: {
                            type: 'number',
                            description: 'Recipient character ID'
                        },
                        message: {
                            type: 'string',
                            description: 'Private message'
                        }
                    },
                    required: ['from_character_id', 'to_character_id', 'message']
                }
            },
            // 物品操作工具
            {
                name: 'pick_item',
                description: 'Pick up an item from the current scene',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: {
                            type: 'number',
                            description: 'Character ID'
                        },
                        item_id: {
                            type: 'number',
                            description: 'Item ID to pick up'
                        }
                    },
                    required: ['character_id', 'item_id']
                }
            },
            {
                name: 'drop_item',
                description: 'Drop an item in the current scene',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: {
                            type: 'number',
                            description: 'Character ID'
                        },
                        item_id: {
                            type: 'number',
                            description: 'Item ID to drop'
                        }
                    },
                    required: ['character_id', 'item_id']
                }
            },
            {
                name: 'use_item',
                description: 'Use an item (consumes the item and may affect character stats)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: {
                            type: 'number',
                            description: 'Character ID'
                        },
                        item_id: {
                            type: 'number',
                            description: 'Item ID to use'
                        }
                    },
                    required: ['character_id', 'item_id']
                }
            },
            {
                name: 'create_item',
                description: 'Create a new item in a scene or give it to a character',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Item name'
                        },
                        description: {
                            type: 'string',
                            description: 'Item description'
                        },
                        scene_id: {
                            type: 'number',
                            description: 'Scene ID where to place the item (optional)'
                        },
                        character_id: {
                            type: 'number',
                            description: 'Character ID to give the item to (optional)'
                        }
                    },
                    required: ['name', 'description']
                }
            }
        ];
    }
    async handleToolCall(name, args, context) {
        switch (name) {
            case 'create_character':
                try {
                    const character = this.characterService.createCharacter(args);
                    return {
                        success: true,
                        character,
                        message: `Character "${character.name}" created successfully with ID ${character.id}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'update_character':
                try {
                    const updatedCharacter = this.characterService.updateCharacter(args.character_id, args);
                    if (!updatedCharacter) {
                        return {
                            success: false,
                            error: 'Character not found'
                        };
                    }
                    return {
                        success: true,
                        character: updatedCharacter,
                        message: `Character "${updatedCharacter.name}" updated successfully`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'create_scene':
                try {
                    const scene = this.sceneService.createScene(args);
                    return {
                        success: true,
                        scene,
                        message: `Scene "${scene.name}" created successfully with ID ${scene.id}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'connect_scenes':
                try {
                    const connection = this.sceneService.connectScenes(args);
                    return {
                        success: true,
                        connection,
                        message: `Connected scene ${args.from_scene_id} to scene ${args.to_scene_id} via ${args.connection_type}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'move_character':
                try {
                    const character = this.characterService.getCharacterById(args.character_id);
                    if (!character) {
                        return {
                            success: false,
                            error: 'Character not found'
                        };
                    }
                    if (!character.current_scene_id) {
                        return {
                            success: false,
                            error: 'Character is not in any scene'
                        };
                    }
                    // Check if movement is possible
                    if (!this.sceneService.canMoveBetweenScenes(character.current_scene_id, args.target_scene_id)) {
                        return {
                            success: false,
                            error: 'Cannot move to that scene - no connection exists'
                        };
                    }
                    const updatedCharacter = this.characterService.moveCharacter(args.character_id, args.target_scene_id);
                    // Add memory about the movement
                    this.memoryService.addActionMemory(args.character_id, 'moved to a new scene', `Moved from scene ${character.current_scene_id} to scene ${args.target_scene_id}`);
                    // Log the action
                    this.loggingService.logAction({
                        character_id: args.character_id,
                        action_type: 'move_character',
                        action_data: `Moved from scene ${character.current_scene_id} to scene ${args.target_scene_id}`,
                        result: `Successfully moved to scene ${args.target_scene_id}`
                    });
                    return {
                        success: true,
                        character: updatedCharacter,
                        message: `Character moved to scene ${args.target_scene_id}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'speak_public':
                try {
                    const character = this.characterService.getCharacterById(args.character_id);
                    if (!character) {
                        return {
                            success: false,
                            error: 'Character not found'
                        };
                    }
                    if (!character.current_scene_id) {
                        return {
                            success: false,
                            error: 'Character is not in any scene'
                        };
                    }
                    // Get all characters in the same scene
                    const sceneCharacters = this.characterService.getCharactersInScene(character.current_scene_id);
                    // Add memory to all characters in the scene
                    sceneCharacters.forEach(sceneChar => {
                        this.memoryService.addConversationMemory(sceneChar.id, character.name, args.message, true);
                    });
                    // Log the action
                    this.loggingService.logAction({
                        character_id: args.character_id,
                        action_type: 'speak_public',
                        action_data: `Said publicly in scene ${character.current_scene_id}: "${args.message}"`,
                        result: `Message heard by ${sceneCharacters.length} characters: ${sceneCharacters.map(c => c.name).join(', ')}`
                    });
                    return {
                        success: true,
                        message: `"${character.name}" said publicly: "${args.message}"`,
                        audience: sceneCharacters.map(c => c.name),
                        scene_id: character.current_scene_id
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'speak_private':
                try {
                    const fromCharacter = this.characterService.getCharacterById(args.from_character_id);
                    const toCharacter = this.characterService.getCharacterById(args.to_character_id);
                    if (!fromCharacter || !toCharacter) {
                        return {
                            success: false,
                            error: 'One or both characters not found'
                        };
                    }
                    // Add memory to both characters
                    this.memoryService.addConversationMemory(fromCharacter.id, fromCharacter.name, args.message, false);
                    this.memoryService.addConversationMemory(toCharacter.id, fromCharacter.name, args.message, false);
                    return {
                        success: true,
                        message: `"${fromCharacter.name}" said privately to "${toCharacter.name}": "${args.message}"`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'pick_item':
                try {
                    const character = this.characterService.getCharacterById(args.character_id);
                    if (!character) {
                        return {
                            success: false,
                            error: 'Character not found'
                        };
                    }
                    if (!character.current_scene_id) {
                        return {
                            success: false,
                            error: 'Character is not in any scene'
                        };
                    }
                    const item = this.itemService.pickItem(args.item_id, args.character_id);
                    if (!item) {
                        return {
                            success: false,
                            error: 'Failed to pick up item'
                        };
                    }
                    // Add memory about picking up the item
                    this.memoryService.addActionMemory(args.character_id, 'picked up an item', `Picked up: ${item.name}`);
                    return {
                        success: true,
                        item,
                        message: `Character picked up: ${item.name}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'drop_item':
                try {
                    const character = this.characterService.getCharacterById(args.character_id);
                    if (!character) {
                        return {
                            success: false,
                            error: 'Character not found'
                        };
                    }
                    if (!character.current_scene_id) {
                        return {
                            success: false,
                            error: 'Character is not in any scene'
                        };
                    }
                    const item = this.itemService.dropItem(args.item_id, character.current_scene_id);
                    if (!item) {
                        return {
                            success: false,
                            error: 'Failed to drop item'
                        };
                    }
                    // Add memory about dropping the item
                    this.memoryService.addActionMemory(args.character_id, 'dropped an item', `Dropped: ${item.name}`);
                    return {
                        success: true,
                        item,
                        message: `Character dropped: ${item.name}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'use_item':
                try {
                    const character = this.characterService.getCharacterById(args.character_id);
                    if (!character) {
                        return {
                            success: false,
                            error: 'Character not found'
                        };
                    }
                    const result = this.itemService.useItem(args.item_id, args.character_id);
                    if (!result) {
                        return {
                            success: false,
                            error: 'Failed to use item'
                        };
                    }
                    let updatedCharacter = character;
                    let effectMessage = '';
                    // Apply item effects
                    if (result.effect) {
                        if (result.effect.health_change) {
                            updatedCharacter = this.characterService.updateCharacterHealth(args.character_id, result.effect.health_change);
                            effectMessage += ` Health ${result.effect.health_change > 0 ? '+' : ''}${result.effect.health_change}.`;
                        }
                        if (result.effect.mental_state_change) {
                            updatedCharacter = this.characterService.updateCharacterMentalState(args.character_id, result.effect.mental_state_change);
                            effectMessage += ` Mental state ${result.effect.mental_state_change > 0 ? '+' : ''}${result.effect.mental_state_change}.`;
                        }
                    }
                    // Add memory about using the item
                    this.memoryService.addActionMemory(args.character_id, 'used an item', `Used: ${result.item.name}. ${result.effect?.description || 'No special effect.'}`);
                    return {
                        success: true,
                        item: result.item,
                        effect: result.effect,
                        character: updatedCharacter,
                        message: `Character used: ${result.item.name}.${effectMessage}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            case 'create_item':
                try {
                    const item = this.itemService.createItem(args);
                    return {
                        success: true,
                        item,
                        message: `Item "${item.name}" created successfully with ID ${item.id}`
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }
            default:
                return {
                    success: false,
                    error: `Unknown tool: ${name}`
                };
        }
    }
}
//# sourceMappingURL=game-core-tools.js.map