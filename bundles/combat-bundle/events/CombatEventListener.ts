/**
 * Combat Event Listener
 * Listens to combat-related events (health/mental state changes)
 */

import { EventManager } from '../../core/EventManager.js';

export async function init(eventManager: EventManager): Promise<void> {
  // Monitor health changes
  eventManager.on('character:updated', async (character: any, oldCharacter: any) => {
    if (oldCharacter && character.health !== oldCharacter.health) {
      const change = character.health - oldCharacter.health;
      const changeStr = change > 0 ? `+${change}` : `${change}`;
      console.log(`[CombatEvent] ${character.name} health changed: ${changeStr} (now ${character.health}/100)`);

      if (character.health <= 0) {
        console.log(`[CombatEvent] ⚠️ ${character.name} has fallen! Health at 0`);
      } else if (character.health <= 20) {
        console.log(`[CombatEvent] ⚠️ ${character.name} is in critical condition!`);
      }
    }

    // Monitor mental state changes
    if (oldCharacter && character.mental_state !== oldCharacter.mental_state) {
      const change = character.mental_state - oldCharacter.mental_state;
      const changeStr = change > 0 ? `+${change}` : `${change}`;
      console.log(`[CombatEvent] ${character.name} mental state changed: ${changeStr} (now ${character.mental_state}/100)`);

      if (character.mental_state <= 0) {
        console.log(`[CombatEvent] ⚠️ ${character.name} has lost all mental stability!`);
      } else if (character.mental_state <= 20) {
        console.log(`[CombatEvent] ⚠️ ${character.name} is mentally distressed!`);
      }
    }
  });
}

export default { init };

