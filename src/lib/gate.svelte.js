// Which password-gated pages have been unlocked in this browser, by the gate's name (a post's
// slug, or "home"). Password.svelte records it; the site layout reads it, so that a gated page
// shows no header or footer until it is unlocked. Empty on the server, so a gated page is
// prerendered locked (see Password.svelte).
export const unlocked = $state({});
