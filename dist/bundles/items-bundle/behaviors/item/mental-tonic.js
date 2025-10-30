/**
 * Mental Tonic Behavior
 * Restores 15 mental state points when used
 */
const mentalTonic = {
    name: 'mental-tonic',
    description: 'Restores 15 mental state points',
    async execute(entity, character) {
        return {
            health_change: 0,
            mental_state_change: 15,
            description: 'Your mind clears as the tonic takes effect. You feel more focused.'
        };
    }
};
export default mentalTonic;
//# sourceMappingURL=mental-tonic.js.map