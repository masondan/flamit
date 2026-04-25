/**
 * Course ID API endpoints
 * Uses Cloudflare Workers KV namespace: COURSE_IDS
 * Bound as `COURSE_IDS` in wrangler.toml
 *
 * Endpoints:
 *   POST /api/courseIds/validate  — check if a course key is valid
 *   POST /api/courseIds/set       — admin: set the active course key
 *   POST /api/courseIds/reset     — admin: clear the active course key
 *   GET  /api/courseIds/current   — admin: retrieve the current course key
 */

const KV_KEY = 'active';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
	});
}

/** @param {Request} request */
async function parseBody(request) {
	try {
		return await request.json();
	} catch {
		return {};
	}
}

/**
 * @param {import('@cloudflare/workers-types').EventContext<any, any, any>} context
 */
export async function onRequest(context) {
	const { request, env } = context;
	const url = new URL(request.url);
	const path = url.pathname;

	// Handle CORS preflight
	if (request.method === 'OPTIONS') {
		return new Response(null, { status: 204, headers: CORS_HEADERS });
	}

	const kv = env.COURSE_IDS;

	// ── GET /api/courseIds/current ──────────────────────────────────────────
	if (request.method === 'GET' && path.endsWith('/current')) {
		const raw = await kv.get(KV_KEY);
		if (!raw) {
			return json({ courseId: null });
		}
		const record = JSON.parse(raw);
		return json({ courseId: record.active ? record.courseId : null });
	}

	// ── POST /api/courseIds/validate ────────────────────────────────────────
	if (request.method === 'POST' && path.endsWith('/validate')) {
		const body = await parseBody(request);
		const { courseId } = body;

		if (!courseId || typeof courseId !== 'string') {
			return json({ valid: false, message: 'Expired Key' }, 400);
		}

		const raw = await kv.get(KV_KEY);
		if (!raw) {
			return json({ valid: false, message: 'Expired Key' });
		}

		const record = JSON.parse(raw);

		if (!record.active || record.courseId !== courseId.trim()) {
			return json({ valid: false, message: 'Expired Key' });
		}

		return json({ valid: true, message: 'OK' });
	}

	// ── POST /api/courseIds/set ─────────────────────────────────────────────
	if (request.method === 'POST' && path.endsWith('/set')) {
		const body = await parseBody(request);
		const { courseId } = body;

		if (!courseId || typeof courseId !== 'string' || !courseId.trim()) {
			return json({ success: false, message: 'Course ID is required' }, 400);
		}

		/** @type {object} */
		const record = {
			courseId: courseId.trim(),
			active: true,
			setAt: new Date().toISOString(),
			revokedAt: null
		};

		await kv.put(KV_KEY, JSON.stringify(record));
		return json({ success: true, message: 'Course Key set' });
	}

	// ── POST /api/courseIds/reset ───────────────────────────────────────────
	if (request.method === 'POST' && path.endsWith('/reset')) {
		const raw = await kv.get(KV_KEY);
		if (raw) {
			const record = JSON.parse(raw);
			record.active = false;
			record.revokedAt = new Date().toISOString();
			await kv.put(KV_KEY, JSON.stringify(record));
		}
		return json({ success: true, message: 'Course Key cleared' });
	}

	return json({ error: 'Not found' }, 404);
}
