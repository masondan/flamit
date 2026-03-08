import { writable, derived } from 'svelte/store';

const STORAGE_KEY = 'flamit_game_state';

function loadState() {
	if (typeof window === 'undefined') return null;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : null;
	} catch {
		return null;
	}
}

function persistState(state) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const defaults = {
	spinning: false,
	spinCount: 0,
	currentStoryIndex: null,
	currentFormIndex: null,
	usedStoryIndices: [],
	usedFormIds: [],
	timerRunning: false,
	timerSeconds: 0,
	timerEndTime: null,
	timerDuration: 0
};

function createGameStore() {
	const initial = loadState() || { ...defaults };
	initial.spinning = false;

	const { subscribe, set, update } = writable(initial);

	return {
		subscribe,
		set: (value) => {
			persistState(value);
			set(value);
		},
		update: (fn) => {
			update(state => {
				const newState = fn(state);
				persistState(newState);
				return newState;
			});
		},
		reset: () => {
			const fresh = { ...defaults };
			persistState(fresh);
			set(fresh);
		}
	};
}

export const gameState = createGameStore();

export const isSpinning = derived(gameState, $s => $s.spinning);
