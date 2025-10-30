/**
 * Energy Drink Behavior
 * Restores 10 health and 10 mental state points when used
 */

import { Entity } from '../../../core/Entity.js';
import { BehaviorDefinition } from '../../../core/BehaviorManager.js';

const energyDrink: BehaviorDefinition = {
  name: 'energy-drink',
  description: 'Restores 10 health and 10 mental state points',

  async execute(entity: Entity, character: any): Promise<any> {
    return {
      health_change: 10,
      mental_state_change: 10,
      description: 'The energy drink invigorates you. You feel refreshed and alert.'
    };
  }
};

export default energyDrink;

