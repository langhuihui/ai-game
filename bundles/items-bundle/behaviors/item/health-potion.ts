/**
 * Health Potion Behavior
 * Restores 20 health points when used
 */

import { Entity } from '../../../core/Entity.js';
import { BehaviorDefinition } from '../../../core/BehaviorManager.js';

const healthPotion: BehaviorDefinition = {
  name: 'health-potion',
  description: 'Restores 20 health points',

  async execute(entity: Entity, character: any): Promise<any> {
    return {
      health_change: 20,
      mental_state_change: 0,
      description: 'You feel your wounds healing as warmth spreads through your body.'
    };
  }
};

export default healthPotion;

