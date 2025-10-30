/**
 * Character Event Listener
 * Listens to character-related events and handles logging
 */
export async function init(eventManager) {
    // Log when characters are created
    eventManager.on('character:created', async (character) => {
        console.log(`[CharacterEvent] Character created: ${character.name} (ID: ${character.id})`);
    });
    // Log when characters are updated
    eventManager.on('character:updated', async (character, oldCharacter) => {
        console.log(`[CharacterEvent] Character updated: ${character.name}`);
    });
    // Log when characters are deleted
    eventManager.on('character:deleted', async (character) => {
        console.log(`[CharacterEvent] Character deleted: ${character.name}`);
    });
    // Log when characters move
    eventManager.on('character:move', async (character, oldSceneId, newSceneId, scene) => {
        console.log(`[CharacterEvent] ${character.name} moved to ${scene.name}`);
    });
}
export default { init };
//# sourceMappingURL=CharacterEventListener.js.map