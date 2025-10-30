/**
 * Character Event Listener
 * Listens to character-related events and handles logging
 */

import { EventManager } from '../../core/EventManager.js';
import { entityManager } from '../../core/EntityManager.js';

export async function init(eventManager: EventManager): Promise<void> {
  // Log when characters are created
  eventManager.on('character:created', async (character: any) => {
    console.log(`[CharacterEvent] Character created: ${character.name} (ID: ${character.id})`);
  });

  // Log when characters are updated
  eventManager.on('character:updated', async (character: any, oldCharacter: any) => {
    console.log(`[CharacterEvent] Character updated: ${character.name}`);
  });

  // Log when characters are deleted
  eventManager.on('character:deleted', async (character: any) => {
    console.log(`[CharacterEvent] Character deleted: ${character.name}`);
  });

  // Log when characters move
  eventManager.on('character:move', async (character: any, oldSceneId: number, newSceneId: number, scene: any) => {
    console.log(`[CharacterEvent] ${character.name} moved to ${scene.name}`);
  });
}

export default { init };

