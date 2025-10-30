/**
 * Mental Tonic Behavior
 * Restores 15 mental state points when used
 */

import { Entity } from '../../../core/Entity.js';
import { BehaviorDefinition } from '../../../core/BehaviorManager.js';

const mentalTonic: BehaviorDefinition = {
  name: 'mental-tonic',
  description: 'Restores 15 mental state points',

  async execute(entity: Entity, character: any): Promise<any> {
    return {
      health_change: 0,
      mental_state_change: 15,
      description: 'Your mind clears as the tonic takes effect. You feel more focused.'
    };
  }
};

export default mentalTonic;

