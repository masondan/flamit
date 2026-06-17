import { writable } from 'svelte/store';

const STORAGE_KEY = 'flamit_authenticated';

/** @typedef {{ authenticated: boolean }} AuthState */

function createAuthStore() {
	/** @type {import('svelte/store').Writable<AuthState>} */
	const store = writable({ authenticated: false });
	const { subscribe, set } = store;

	return {
		subscribe,

		/** Call once on mount to hydrate from localStorage */
		init() {
			if (typeof localStorage === 'undefined') return;
			const stored = localStorage.getItem(STORAGE_KEY);
			set({ authenticated: stored === 'true' });
		},

		/** Mark as authenticated after password verification
		 * @param {boolean} isAuthenticated
		 */
		setAuthenticated(isAuthenticated) {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, isAuthenticated ? 'true' : 'false');
			}
			set({ authenticated: isAuthenticated });
		},

		/** Clear authentication (logout) */
		logout() {
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
			set({ authenticated: false });
		}
	};
}

export const authStore = createAuthStore();
