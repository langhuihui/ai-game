import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CharacterService } from '../services/CharacterService.js';

export class CharacterTools {
  private characterService = new CharacterService();

  getTools(): Tool[] {
    return [
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
        name: 'get_character',
        description: 'Get detailed information about a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            }
          },
          required: ['character_id']
        }
      },
      {
        name: 'get_character_by_name',
        description: 'Get character information by name',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Character name'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'list_characters',
        description: 'List all characters in the game',
        inputSchema: {
          type: 'object',
          properties: {}
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
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    switch (name) {
      case 'create_character':
        try {
          const character = this.characterService.createCharacter(args);
          return {
            success: true,
            character,
            message: `Character "${character.name}" created successfully with ID ${character.id}`
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }

      case 'get_character':
        const character = this.characterService.getCharacterById(args.character_id);
        if (!character) {
          return {
            success: false,
            error: 'Character not found'
          };
        }
        return {
          success: true,
          character
        };

      case 'get_character_by_name':
        const characterByName = this.characterService.getCharacterByName(args.name);
        if (!characterByName) {
          return {
            success: false,
            error: 'Character not found'
          };
        }
        return {
          success: true,
          character: characterByName
        };

      case 'list_characters':
        const characters = this.characterService.getAllCharacters();
        return {
          success: true,
          characters,
          count: characters.length
        };

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
        } catch (error) {
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
