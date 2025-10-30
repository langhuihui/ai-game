/**
 * Poison Behavior
 * Reduces 30 health points when used
 */
const poison = {
    name: 'poison',
    description: 'Damages health by 30 points',
    async execute(entity, character) {
        return {
            health_change: -30,
            mental_state_change: 0,
            description: 'The poison burns through your veins. You feel weaker.'
        };
    }
};
export default poison;
//# sourceMappingURL=poison.js.map