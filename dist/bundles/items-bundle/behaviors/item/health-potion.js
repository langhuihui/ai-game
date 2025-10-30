/**
 * Health Potion Behavior
 * Restores 20 health points when used
 */
const healthPotion = {
    name: 'health-potion',
    description: 'Restores 20 health points',
    async execute(entity, character) {
        return {
            health_change: 20,
            mental_state_change: 0,
            description: 'You feel your wounds healing as warmth spreads through your body.'
        };
    }
};
export default healthPotion;
//# sourceMappingURL=health-potion.js.map