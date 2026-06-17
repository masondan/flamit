/**
 * Admin authentication endpoint
 * POST /api/admin/auth — validate admin password
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
	const { password } = body;

	if (!password || typeof password !== 'string') {
		return json({ success: false, message: 'Password is required' }, 400);
	}

	try {
		const stored = await kv.get('app_password');
		const appPassword = stored || 'Flam!'; // Default to Flam! if not set in KV

		if (password !== appPassword) {
			return json({ success: false, message: 'Incorrect password' }, 401);
		}

		return json({ success: true, message: 'OK' });
	} catch (err) {
		return json({ success: false, message: 'Authentication error' }, 500);
	}
}
