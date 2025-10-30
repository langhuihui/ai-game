/**
 * Memory Event Listener
 * Listens to memory-related events and handles automatic memory creation
 */

import { EventManager } from '../../core/EventManager.js';
import { entityManager } from '../../core/EntityManager.js';

export async function init(eventManager: EventManager): Promise<void> {
  const memoryService = entityManager.getMemoryService();

  // Auto-create memory when character moves
  eventManager.on('character:move', async (character: any, oldSceneId: number, newSceneId: number, scene: any) => {
    memoryService.addActionMemory(
      character.id,
      'moved location',
      `Traveled to ${scene.name}`
    );
  });

  // Auto-create memory when item is used
  eventManager.on('item:used', async (item: any, character: any, effect: any) => {
    const effectDesc = effect?.description || 'No special effect';
    memoryService.addActionMemory(
      character.id,
      'used item',
      `Used ${item.name}. ${effectDesc}`
    );
  });

  // Auto-create memory when character is created
  eventManager.on('character:created', async (character: any) => {
    memoryService.addLongMemory({
      character_id: character.id,
      content: `Born into the world as ${character.name}`,
      importance: 10
    });
  });

  console.log('[MemoryEventListener] Initialized memory auto-tracking');
}

export default { init };

