/**
 * Course ID current endpoint
 * GET /api/courseIds/current — admin: retrieve the current course key
 */

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
	});
}

export async function onRequestOptions() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * @param {import('@cloudflare/workers-types').EventContext<any, any, any>} context
 */
export async function onRequestGet(context) {
	const kv = context.env.COURSE_IDS;
	const raw = await kv.get('active');
	
	if (!raw) {
		return json({ courseId: null });
	}
	
	const record = JSON.parse(raw);
	return json({ courseId: record.active ? record.courseId : null });
}
