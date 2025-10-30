/**
 * Scene Event Listener
 * Listens to scene-related events and handles logging
 */

import { EventManager } from '../../core/EventManager.js';

export async function init(eventManager: EventManager): Promise<void> {
  // Log when scenes are created
  eventManager.on('scene:created', async (scene: any) => {
    console.log(`[SceneEvent] Scene created: ${scene.name} (ID: ${scene.id})`);
  });

  // Log when scenes are connected
  eventManager.on('scene:connected', async (connection: any) => {
    console.log(`[SceneEvent] Scenes connected: ${connection.from_scene_id} -> ${connection.to_scene_id}`);
  });
}

export default { init };

