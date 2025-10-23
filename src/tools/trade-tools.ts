import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CharacterService } from '../services/CharacterService.js';
import { ItemService } from '../services/ItemService.js';
import { LoggingService } from '../services/LoggingService.js';

export class TradeTools {
  private characterService: CharacterService;
  private itemService: ItemService;
  private loggingService: LoggingService;

  constructor() {
    this.characterService = new CharacterService();
    this.itemService = new ItemService();
    this.loggingService = new LoggingService();
  }

  getTools(): Tool[] {
    return [
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
        name: 'get_trade_offers',
        description: 'Get all trade offers for a character',
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
      },
      {
        name: 'get_pending_trade_offers',
        description: 'Get pending trade offers for a character',
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
        name: 'get_direct_messages',
        description: 'Get direct messages for a character',
        inputSchema: {
          type: 'object',
          properties: {
            character_id: {
              type: 'number',
              description: 'ID of the character'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of messages to return (default: 50)'
            }
          },
          required: ['character_id']
        }
      },
      {
        name: 'get_unread_messages',
        description: 'Get unread direct messages for a character',
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
        case 'create_trade_offer':
          return await this.createTradeOffer(args);
        case 'get_trade_offers':
          return await this.getTradeOffers(args);
        case 'get_pending_trade_offers':
          return await this.getPendingTradeOffers(args);
        case 'respond_to_trade_offer':
          return await this.respondToTradeOffer(args);
        case 'cancel_trade_offer':
          return await this.cancelTradeOffer(args);
        case 'send_direct_message':
          return await this.sendDirectMessage(args);
        case 'get_direct_messages':
          return await this.getDirectMessages(args);
        case 'get_unread_messages':
          return await this.getUnreadMessages(args);
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

  private async getTradeOffers(args: any): Promise<any> {
    const { character_id } = args;

    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    const tradeOffers = this.characterService.getTradeOffersByCharacter(character_id);

    return {
      success: true,
      tradeOffers,
      count: tradeOffers.length
    };
  }

  private async getPendingTradeOffers(args: any): Promise<any> {
    const { character_id } = args;

    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    const pendingOffers = this.characterService.getPendingTradeOffers(character_id);

    return {
      success: true,
      pendingOffers,
      count: pendingOffers.length
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

  private async getDirectMessages(args: any): Promise<any> {
    const { character_id, limit = 50 } = args;

    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    const messages = this.characterService.getDirectMessages(character_id, limit);

    return {
      success: true,
      messages,
      count: messages.length
    };
  }

  private async getUnreadMessages(args: any): Promise<any> {
    const { character_id } = args;

    const character = this.characterService.getCharacterById(character_id);
    if (!character) {
      return { success: false, error: 'Character not found' };
    }

    const unreadMessages = this.characterService.getUnreadMessages(character_id);

    return {
      success: true,
      unreadMessages,
      count: unreadMessages.length
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
