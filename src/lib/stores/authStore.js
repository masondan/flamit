import { writable } from 'svelte/store';

const STORAGE_KEY = 'flamit_course_id';

/** @typedef {{ courseId: string | null }} AuthState */

function createAuthStore() {
	/** @type {import('svelte/store').Writable<AuthState>} */
	const store = writable({ courseId: null });
	const { subscribe, set } = store;

	return {
		subscribe,

		/** Call once on mount to hydrate from localStorage */
		init() {
			if (typeof localStorage === 'undefined') return;
			const stored = localStorage.getItem(STORAGE_KEY);
			set({ courseId: stored ?? null });
		},

		/** Persist a valid course ID
		 * @param {string} id
		 */
		setCourseId(id) {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, id);
			}
			set({ courseId: id });
		},

		/** Clear the stored course ID (e.g. on revocation) */
		clear() {
			if (typeof localStorage !== 'undefined') {
				localStorage.removeItem(STORAGE_KEY);
			}
			set({ courseId: null });
		}
	};
}

export const authStore = createAuthStore();
