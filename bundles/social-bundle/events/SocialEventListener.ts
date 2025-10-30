/**
 * Social Event Listener
 * Listens to social interaction events
 */

import { EventManager } from '../../core/EventManager.js';

export async function init(eventManager: EventManager): Promise<void> {
  // Log trade events
  eventManager.on('trade:created', async (trade: any) => {
    console.log(`[SocialEvent] Trade offer created: #${trade.id}`);
  });

  eventManager.on('trade:accepted', async (trade: any) => {
    console.log(`[SocialEvent] Trade offer #${trade.id} accepted`);
  });

  eventManager.on('trade:rejected', async (trade: any) => {
    console.log(`[SocialEvent] Trade offer #${trade.id} rejected`);
  });

  // Log message events
  eventManager.on('message:sent', async (message: any) => {
    console.log(`[SocialEvent] Message sent from character ${message.from_character_id} to ${message.to_character_id}`);
  });

  // Log citizenship events
  eventManager.on('citizenship:applied', async (application: any) => {
    console.log(`[SocialEvent] Citizenship application submitted: ${application.character_name}`);
  });

  eventManager.on('citizenship:approved', async (application: any) => {
    console.log(`[SocialEvent] Citizenship application approved: ${application.character_name}`);
  });

  eventManager.on('citizenship:rejected', async (application: any) => {
    console.log(`[SocialEvent] Citizenship application rejected: ${application.character_name}`);
  });

  console.log('[SocialEventListener] Initialized social interaction tracking');
}

export default { init };

