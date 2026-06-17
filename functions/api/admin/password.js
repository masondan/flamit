/**
 * Admin password management endpoint
 * GET /api/admin/password — get current password
 * POST /api/admin/password — set new password
 */

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

const DEFAULT_PASSWORD = 'Flam!';
const PASSWORD_KEY = 'app_password';

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
export async function onRequestGet(context) {
	const kv = context.env.COURSE_IDS;
	
	try {
		const stored = await kv.get(PASSWORD_KEY);
		const password = stored || DEFAULT_PASSWORD;
		return json({ password, isDefault: !stored });
	} catch (err) {
		return json({ error: 'Failed to fetch password' }, 500);
	}
}

/**
 * @param {import('@cloudflare/workers-types').EventContext<any, any, any>} context
 */
export async function onRequestPost(context) {
	const kv = context.env.COURSE_IDS;
	const body = await parseBody(context.request);
	const { password } = body;

	if (!password || typeof password !== 'string' || password.trim().length === 0) {
		return json({ success: false, message: 'Password is required' }, 400);
	}

	try {
		await kv.put(PASSWORD_KEY, password.trim());
		return json({ success: true, message: 'Password updated' });
	} catch (err) {
		return json({ success: false, message: 'Failed to update password' }, 500);
	}
}
