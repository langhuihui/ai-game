/**
 * Energy Drink Behavior
 * Restores 10 health and 10 mental state points when used
 */
const energyDrink = {
    name: 'energy-drink',
    description: 'Restores 10 health and 10 mental state points',
    async execute(entity, character) {
        return {
            health_change: 10,
            mental_state_change: 10,
            description: 'The energy drink invigorates you. You feel refreshed and alert.'
        };
    }
};
export default energyDrink;
//# sourceMappingURL=energy-drink.js.map