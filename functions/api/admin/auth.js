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
	const adminPassword = context.env.ADMIN_PASSWORD;
	const body = await parseBody(context.request);
	const { password } = body;

	if (!adminPassword) {
		return json({ success: false, message: 'Admin password not configured' }, 500);
	}

	if (!password || typeof password !== 'string') {
		return json({ success: false, message: 'Password is required' }, 400);
	}

	if (password !== adminPassword) {
		return json({ success: false, message: 'Incorrect password' }, 401);
	}

	return json({ success: true, message: 'OK' });
}
