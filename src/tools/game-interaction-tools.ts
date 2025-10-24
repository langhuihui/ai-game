import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CharacterService } from '../services/CharacterService.js';
import { ItemService } from '../services/ItemService.js';
import { MemoryService } from '../services/MemoryService.js';
import { LoggingService } from '../services/LoggingService.js';

export class GameInteractionTools {
  private characterService: CharacterService;
  private itemService: ItemService;
  private memoryService: MemoryService;
  private loggingService: LoggingService;

  constructor() {
    this.characterService = new CharacterService();
    this.itemService = new ItemService();
    this.memoryService = new MemoryService();
    this.loggingService = new LoggingService();
  }

  getTools(): Tool[] {
    return [
      // 记忆管理工具
      {
        name: 'add_short_memory',
        description: 'Add a short-term memory to a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            },
            content: {
              type: 'string',
              description: 'Memory content'
            }
          },
          required: ['character_id', 'content']
        }
      },
      {
        name: 'add_long_memory',
        description: 'Add a long-term memory to a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'Character ID'
            },
            content: {
              type: 'string',
              description: 'Memory content'
            },
            importance: {
              type: 'number',
              description: 'Memory importance (1-10, default: 5)',
              minimum: 1,
              maximum: 10
            }
          },
          required: ['character_id', 'content']
        }
      },
      {
        name: 'update_short_memory',
        description: 'Update a short-term memory',
        inputSchema: {
          type: 'object',
          properties: {
            memory_id: {
              type: 'number',
              description: 'Memory ID'
            },
            content: {
              type: 'string',
              description: 'New memory content'
            }
          },
          required: ['memory_id']
        }
      },
      {
        name: 'update_long_memory',
        description: 'Update a long-term memory',
        inputSchema: {
          type: 'object',
          properties: {
            memory_id: {
              type: 'number',
              description: 'Memory ID'
            },
            content: {
              type: 'string',
              description: 'New memory content'
            },
            importance: {
              type: 'number',
              description: 'New importance level (1-10)',
              minimum: 1,
              maximum: 10
            }
          },
          required: ['memory_id']
        }
      },
      {
        name: 'delete_short_memory',
        description: 'Delete a short-term memory',
        inputSchema: {
          type: 'object',
          properties: {
            memory_id: {
              type: 'number',
              description: 'Memory ID'
            }
          },
          required: ['memory_id']
        }
      },
      {
        name: 'delete_long_memory',
        description: 'Delete a long-term memory',
        inputSchema: {
          type: 'object',
          properties: {
            memory_id: {
              type: 'number',
              description: 'Memory ID'
            }
          },
          required: ['memory_id']
        }
      },
      {
        name: 'delete_all_memories',
        description: 'Delete all memories for a character',
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

      // 交易工具
      {
        name: 'create_trade_offer',
        description: 'Create a trade offer to another character',
        inputSchema: {
          type: 'object',
          properties: {
            from_character_id: {
              type: 'number',
              description: 'ID of the character making the offer'
            },
            to_character_id: {
              type: 'number',
              description: 'ID of the character receiving the offer'
            },
            currency_amount: {
              type: 'number',
              description: 'Amount of currency to offer (0 if no currency)'
            },
            item_id: {
              type: 'number',
              description: 'ID of the item to offer (optional)'
            },
            message: {
              type: 'string',
              description: 'Optional message with the trade offer'
            }
          },
          required: ['from_character_id', 'to_character_id', 'currency_amount']
        }
      },
      {
        name: 'respond_to_trade_offer',
        description: 'Accept or reject a trade offer',
        inputSchema: {
          type: 'object',
          properties: {
            offer_id: {
              type: 'number',
              description: 'ID of the trade offer'
            },
            response: {
              type: 'string',
              enum: ['accepted', 'rejected'],
              description: 'Response to the trade offer'
            }
          },
          required: ['offer_id', 'response']
        }
      },
      {
        name: 'cancel_trade_offer',
        description: 'Cancel a pending trade offer',
        inputSchema: {
          type: 'object',
          properties: {
            offer_id: {
              type: 'number',
              description: 'ID of the trade offer to cancel'
            }
          },
          required: ['offer_id']
        }
      },

      // 直接消息工具
      {
        name: 'send_direct_message',
        description: 'Send a direct message to another character in the same scene',
        inputSchema: {
          type: 'object',
          properties: {
            from_character_id: {
              type: 'number',
              description: 'ID of the character sending the message'
            },
            to_character_id: {
              type: 'number',
              description: 'ID of the character receiving the message'
            },
            message: {
              type: 'string',
              description: 'Message content'
            },
            scene_id: {
              type: 'number',
              description: 'ID of the scene where the message is sent'
            }
          },
          required: ['from_character_id', 'to_character_id', 'message', 'scene_id']
        }
      },
      {
        name: 'mark_message_as_read',
        description: 'Mark a direct message as read',
        inputSchema: {
          type: 'object',
          properties: {
            message_id: {
              type: 'number',
              description: 'ID of the message to mark as read'
            }
          },
          required: ['message_id']
        }
      },
      {
        name: 'mark_all_messages_as_read',
        description: 'Mark all direct messages as read for a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'ID of the character'
            }
          },
          required: ['character_id']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'add_short_memory':
          return await this.addShortMemory(args);
        case 'add_long_memory':
          return await this.addLongMemory(args);
        case 'update_short_memory':
          return await this.updateShortMemory(args);
        case 'update_long_memory':
          return await this.updateLongMemory(args);
        case 'delete_short_memory':
          return await this.deleteShortMemory(args);
        case 'delete_long_memory':
          return await this.deleteLongMemory(args);
        case 'delete_all_memories':
          return await this.deleteAllMemories(args);
        case 'create_trade_offer':
          return await this.createTradeOffer(args);
        case 'respond_to_trade_offer':
          return await this.respondToTradeOffer(args);
        case 'cancel_trade_offer':
          return await this.cancelTradeOffer(args);
        case 'send_direct_message':
          return await this.sendDirectMessage(args);
        case 'mark_message_as_read':
          return await this.markMessageAsRead(args);
        case 'mark_all_messages_as_read':
          return await this.markAllMessagesAsRead(args);
        default:
          return { success: false, error: `Unknown tool: ${name}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 记忆管理方法
  private async addShortMemory(args: any): Promise<any> {
    try {
      const memory = this.memoryService.addShortMemory(args);
      return {
        success: true,
        memory,
        message: 'Short-term memory added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async addLongMemory(args: any): Promise<any> {
    try {
      const memory = this.memoryService.addLongMemory(args);
      return {
        success: true,
        memory,
        message: 'Long-term memory added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async updateShortMemory(args: any): Promise<any> {
    try {
      const memory = this.memoryService.updateShortMemory(args.memory_id, args);
      if (!memory) {
        return {
          success: false,
          error: 'Memory not found'
        };
      }
      return {
        success: true,
        memory,
        message: 'Short-term memory updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async updateLongMemory(args: any): Promise<any> {
    try {
      const memory = this.memoryService.updateLongMemory(args.memory_id, args);
      if (!memory) {
        return {
          success: false,
          error: 'Memory not found'
        };
      }
      return {
        success: true,
        memory,
        message: 'Long-term memory updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async deleteShortMemory(args: any): Promise<any> {
    const shortDeleted = this.memoryService.deleteShortMemory(args.memory_id);
    return {
      success: shortDeleted,
      message: shortDeleted ? 'Short-term memory deleted successfully' : 'Memory not found'
    };
  }

  private async deleteLongMemory(args: any): Promise<any> {
    const longDeleted = this.memoryService.deleteLongMemory(args.memory_id);
    return {
      success: longDeleted,
      message: longDeleted ? 'Long-term memory deleted successfully' : 'Memory not found'
    };
  }

  private async deleteAllMemories(args: any): Promise<any> {
    const allDeleted = this.memoryService.deleteAllMemories(args.character_id);
    return {
      success: allDeleted,
      message: allDeleted ? 'All memories deleted successfully' : 'No memories found'
    };
  }

  // 交易管理方法
  private async createTradeOffer(args: any): Promise<any> {
    const { from_character_id, to_character_id, currency_amount, item_id, message } = args;

    // Validate characters exist
    const fromCharacter = this.characterService.getCharacterById(from_character_id);
    const toCharacter = this.characterService.getCharacterById(to_character_id);

    if (!fromCharacter) {
      return { success: false, error: 'From character not found' };
    }
    if (!toCharacter) {
      return { success: false, error: 'To character not found' };
    }

    // Validate currency amount
    if (currency_amount < 0) {
      return { success: false, error: 'Currency amount cannot be negative' };
    }

    // Check if character has enough currency
    if (currency_amount > 0 && fromCharacter.currency < currency_amount) {
      return { success: false, error: 'Insufficient currency' };
    }

    // Validate item if specified
    if (item_id) {
      const item = this.itemService.getItemById(item_id);
      if (!item || item.character_id !== from_character_id) {
        return { success: false, error: 'Item not found or not owned by character' };
      }
    }

    const tradeOffer = this.characterService.createTradeOffer({
      from_character_id,
      to_character_id,
      currency_amount,
      item_id,
      message
    });

    this.loggingService.logAction({
      character_id: from_character_id,
      action_type: 'create_trade_offer',
      action_data: JSON.stringify({ to_character_id, currency_amount, item_id, message }),
      result: `Trade offer created with ID ${tradeOffer.id}`
    });

    return {
      success: true,
      tradeOffer,
      message: `Trade offer created successfully. Offer ID: ${tradeOffer.id}`
    };
  }

  private async respondToTradeOffer(args: any): Promise<any> {
    const { offer_id, response } = args;

    const updatedOffer = this.characterService.respondToTradeOffer(offer_id, response);
    if (!updatedOffer) {
      return { success: false, error: 'Trade offer not found or not pending' };
    }

    this.loggingService.logAction({
      character_id: updatedOffer.to_character_id,
      action_type: 'respond_to_trade_offer',
      action_data: JSON.stringify({ offer_id, response }),
      result: `Trade offer ${offer_id} ${response}`
    });

    return {
      success: true,
      tradeOffer: updatedOffer,
      message: `Trade offer ${response} successfully`
    };
  }

  private async cancelTradeOffer(args: any): Promise<any> {
    const { offer_id } = args;

    const cancelledOffer = this.characterService.cancelTradeOffer(offer_id);
    if (!cancelledOffer) {
      return { success: false, error: 'Trade offer not found or not pending' };
    }

    this.loggingService.logAction({
      character_id: cancelledOffer.from_character_id,
      action_type: 'cancel_trade_offer',
      action_data: JSON.stringify({ offer_id }),
      result: `Trade offer ${offer_id} cancelled`
    });

    return {
      success: true,
      tradeOffer: cancelledOffer,
      message: 'Trade offer cancelled successfully'
    };
  }

  // 直接消息方法
  private async sendDirectMessage(args: any): Promise<any> {
    const { from_character_id, to_character_id, message, scene_id } = args;

    // Validate characters exist
    const fromCharacter = this.characterService.getCharacterById(from_character_id);
    const toCharacter = this.characterService.getCharacterById(to_character_id);

    if (!fromCharacter) {
      return { success: false, error: 'From character not found' };
    }
    if (!toCharacter) {
      return { success: false, error: 'To character not found' };
    }

    // Check if both characters are in the same scene
    if (fromCharacter.current_scene_id !== scene_id || toCharacter.current_scene_id !== scene_id) {
      return { success: false, error: 'Both characters must be in the same scene to send direct messages' };
    }

    const directMessage = this.characterService.sendDirectMessage(
      from_character_id,
      to_character_id,
      message,
      scene_id
    );

    this.loggingService.logAction({
      character_id: from_character_id,
      action_type: 'send_direct_message',
      action_data: JSON.stringify({ to_character_id, message, scene_id }),
      result: `Direct message sent to character ${to_character_id}`
    });

    return {
      success: true,
      directMessage,
      message: 'Direct message sent successfully'
    };
  }

  private async markMessageAsRead(args: any): Promise<any> {
    const { message_id } = args;

    const message = this.characterService.markMessageAsRead(message_id);
    if (!message) {
      return { success: false, error: 'Message not found' };
    }

    return {
      success: true,
      message: 'Message marked as read',
      directMessage: message
    };
  }

  private async markAllMessagesAsRead(args: any): Promise<any> {
    const { character_id } = args;

    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    this.characterService.markAllMessagesAsRead(character_id);

    return {
      success: true,
      message: 'All messages marked as read'
    };
  }
}
