/**
 * Course ID reset endpoint
 * POST /api/courseIds/reset — admin: clear the active course key
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

export async function onRequestOptions() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * @param {import('@cloudflare/workers-types').EventContext<any, any, any>} context
 */
export async function onRequestPost(context) {
	const kv = context.env.COURSE_IDS;
	const raw = await kv.get('active');
	
	if (raw) {
		const record = JSON.parse(raw);
		record.active = false;
		record.revokedAt = new Date().toISOString();
		await kv.put('active', JSON.stringify(record));
	}
	
	return json({ success: true, message: 'Course Key cleared' });
}
