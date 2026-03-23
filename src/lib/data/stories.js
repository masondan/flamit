const API_BASE = '/api';

const DEFAULT_STORIES = [];

function shuffle(arr) {
	const shuffled = [...arr];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export async function fetchStories() {
	try {
		const res = await fetch(`${API_BASE}/stories`);
		if (!res.ok) throw new Error();
		const stories = await res.json();
		return stories.length > 0 ? shuffle(stories) : shuffle(DEFAULT_STORIES);
	} catch {
		return shuffle(DEFAULT_STORIES);
	}
}

export async function fetchStoriesOrdered() {
	try {
		const res = await fetch(`${API_BASE}/stories`);
		if (!res.ok) throw new Error();
		const stories = await res.json();
		return stories.length > 0 ? stories : DEFAULT_STORIES;
	} catch {
		return DEFAULT_STORIES;
	}
}

export async function fetchSubmissions() {
	const res = await fetch(`${API_BASE}/submissions`);
	if (!res.ok) throw new Error('Failed to fetch submissions');
	return await res.json();
}

export async function submitStories(name, entries) {
	const res = await fetch(`${API_BASE}/submissions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, entries })
	});
	if (!res.ok) throw new Error('Failed to submit');
	return await res.json();
}

export async function approveSubmissions(submissions) {
	const res = await fetch(`${API_BASE}/stories`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ submissions })
	});
	if (!res.ok) throw new Error('Failed to approve');
	return await res.json();
}

export async function deleteSubmissions(ids) {
	const res = await fetch(`${API_BASE}/submissions`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(ids ? { ids } : { all: true })
	});
	if (!res.ok) throw new Error('Failed to delete');
	return await res.json();
}

export async function deleteStories(ids) {
	const res = await fetch(`${API_BASE}/stories`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(ids ? { ids } : { all: true })
	});
	if (!res.ok) throw new Error('Failed to delete');
	return await res.json();
}
