/**
 * Admin Event Listener
 * Listens to admin and permission-related events
 */
export async function init(eventManager) {
    // Log permission changes
    eventManager.on('permission:created', async (identity) => {
        console.log(`[AdminEvent] Identity created: ${identity.identity_role} for character ${identity.character_id || 'N/A'}`);
    });
    eventManager.on('permission:updated', async (identity) => {
        console.log(`[AdminEvent] Identity updated: ${identity.id} - ${identity.identity_role}`);
    });
    eventManager.on('permission:revoked', async (identity) => {
        console.log(`[AdminEvent] Identity revoked: ${identity.id}`);
    });
    console.log('[AdminEventListener] Initialized admin action tracking');
}
export default { init };
//# sourceMappingURL=AdminEventListener.js.map