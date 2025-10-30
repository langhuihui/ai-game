/**
 * MoveCharacterCommand - Move character to adjacent scene
 */

import { entityManager } from '../../core/EntityManager.js';
import { eventManager } from '../../core/EventManager.js';

export interface MoveCharacterCommandArgs {
  character_id: number;
  target_scene_id: number;
}

export class MoveCharacterCommand {
  static name = 'move_character';
  static description = 'Move a character to an adjacent scene';

  static async execute(args: MoveCharacterCommandArgs): Promise<any> {
    try {
      const character = entityManager.getCharacter(args.character_id);
      if (!character) {
        return {
          success: false,
          error: 'Character not found'
        };
      }

      const targetScene = entityManager.getScene(args.target_scene_id);
      if (!targetScene) {
        return {
          success: false,
          error: 'Target scene not found'
        };
      }

      // Check if scenes are connected
      if (character.current_scene_id) {
        const sceneService = entityManager.getSceneService();
        const connections = sceneService.getConnectionsFromScene(character.current_scene_id);
        const isConnected = connections.some(
          (conn: any) => conn.to_scene_id === args.target_scene_id
        );

        if (!isConnected) {
          return {
            success: false,
            error: 'Target scene is not connected to current scene'
          };
        }
      }

      // Move the character
      const result = await entityManager.moveCharacter(args.character_id, args.target_scene_id);

      if (!result) {
        return {
          success: false,
          error: 'Failed to move character'
        };
      }

      // Add memory about the movement
      const memoryService = entityManager.getMemoryService();
      memoryService.addActionMemory(
        args.character_id,
        'moved to new location',
        `Moved to: ${targetScene.name}`
      );

      return {
        success: true,
        character: result,
        target_scene: targetScene,
        message: `${result.name} moved to ${targetScene.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default MoveCharacterCommand;

