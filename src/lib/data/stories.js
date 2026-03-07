export const DEFAULT_STORIES = [
	{
		id: 1,
		headline: 'Sample Story 1',
		url: 'https://example.com/story-1',
		submittedBy: 'Demo'
	},
	{
		id: 2,
		headline: 'Sample Story 2',
		url: 'https://example.com/story-2',
		submittedBy: 'Demo'
	}
];

const STORAGE_KEY = 'flamit_stories';

export function getStories() {
	if (typeof window === 'undefined') return DEFAULT_STORIES;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return DEFAULT_STORIES;
		}
	}
	return DEFAULT_STORIES;
}

export function saveStories(stories) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}
