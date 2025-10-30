/**
 * Stress Relief Behavior
 * Restores 25 mental state points when used
 */
const stressRelief = {
    name: 'stress-relief',
    description: 'Restores 25 mental state points',
    async execute(entity, character) {
        return {
            health_change: 0,
            mental_state_change: 25,
            description: 'You feel your stress melting away. A sense of calm washes over you.'
        };
    }
};
export default stressRelief;
//# sourceMappingURL=stress-relief.js.map