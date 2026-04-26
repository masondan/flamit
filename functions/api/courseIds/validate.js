/**
 * Course ID validation endpoint
 * POST /api/courseIds/validate — check if a course key is valid
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

	if (!courseId || typeof courseId !== 'string') {
		return json({ valid: false, message: 'Expired Key' }, 400);
	}

	const raw = await kv.get('active');
	if (!raw) {
		return json({ valid: false, message: 'Expired Key' });
	}

	const record = JSON.parse(raw);

	if (!record.active || record.courseId !== courseId.trim()) {
		return json({ valid: false, message: 'Expired Key' });
	}

	return json({ valid: true, message: 'OK' });
}
