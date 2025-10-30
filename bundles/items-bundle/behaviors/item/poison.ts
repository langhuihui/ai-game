/**
 * Poison Behavior
 * Reduces 30 health points when used
 */

import { Entity } from '../../../core/Entity.js';
import { BehaviorDefinition } from '../../../core/BehaviorManager.js';

const poison: BehaviorDefinition = {
  name: 'poison',
  description: 'Damages health by 30 points',

  async execute(entity: Entity, character: any): Promise<any> {
    return {
      health_change: -30,
      mental_state_change: 0,
      description: 'The poison burns through your veins. You feel weaker.'
    };
  }
};

export default poison;

