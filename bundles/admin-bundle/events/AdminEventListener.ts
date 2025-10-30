/**
 * Admin Event Listener
 * Listens to admin and permission-related events
 */

import { EventManager } from '../../core/EventManager.js';

export async function init(eventManager: EventManager): Promise<void> {
  // Log permission changes
  eventManager.on('permission:created', async (identity: any) => {
    console.log(`[AdminEvent] Identity created: ${identity.identity_role} for character ${identity.character_id || 'N/A'}`);
  });

  eventManager.on('permission:updated', async (identity: any) => {
    console.log(`[AdminEvent] Identity updated: ${identity.id} - ${identity.identity_role}`);
  });

  eventManager.on('permission:revoked', async (identity: any) => {
    console.log(`[AdminEvent] Identity revoked: ${identity.id}`);
  });

  console.log('[AdminEventListener] Initialized admin action tracking');
}

export default { init };

