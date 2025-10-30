/**
 * Stress Relief Behavior
 * Restores 25 mental state points when used
 */

import { Entity } from '../../../core/Entity.js';
import { BehaviorDefinition } from '../../../core/BehaviorManager.js';

const stressRelief: BehaviorDefinition = {
  name: 'stress-relief',
  description: 'Restores 25 mental state points',

  async execute(entity: Entity, character: any): Promise<any> {
    return {
      health_change: 0,
      mental_state_change: 25,
      description: 'You feel your stress melting away. A sense of calm washes over you.'
    };
  }
};

export default stressRelief;

