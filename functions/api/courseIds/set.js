/**
 * Course ID set endpoint
 * POST /api/courseIds/set — admin: set the active course key
 */

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

export async function onRequestOptions() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * @param {import('@cloudflare/workers-types').EventContext<any, any, any>} context
 */
export async function onRequestPost(context) {
	const kv = context.env.COURSE_IDS;
	const body = await parseBody(context.request);
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

	await kv.put('active', JSON.stringify(record));
	return json({ success: true, message: 'Course Key set' });
}
