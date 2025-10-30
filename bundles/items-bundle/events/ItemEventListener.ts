/**
 * Item Event Listener
 * Listens to item-related events and handles logging
 */

import { EventManager } from '../../core/EventManager.js';
import { entityManager } from '../../core/EntityManager.js';

export async function init(eventManager: EventManager): Promise<void> {
  // Log when items are created
  eventManager.on('item:created', async (item: any) => {
    const loggingService = entityManager.getCharacterService();
    console.log(`[ItemEvent] Item created: ${item.name} (ID: ${item.id})`);
  });

  // Log when items are picked up
  eventManager.on('item:picked', async (item: any, character: any) => {
    const loggingService = entityManager.getCharacterService();
    console.log(`[ItemEvent] ${character.name} picked up ${item.name}`);
  });

  // Log when items are dropped
  eventManager.on('item:dropped', async (item: any, scene: any) => {
    console.log(`[ItemEvent] ${item.name} dropped in ${scene.name}`);
  });

  // Log when items are used
  eventManager.on('item:used', async (item: any, character: any, effect: any) => {
    const effectDesc = effect ? `with effect: ${effect.description}` : 'with no effect';
    console.log(`[ItemEvent] ${character.name} used ${item.name} ${effectDesc}`);
  });

  // Handle item effects on character
  eventManager.on('item:before-use', async (item: any, character: any) => {
    console.log(`[ItemEvent] ${character.name} is about to use ${item.name}`);
  });
}

export default { init };

