function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
}

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders() },
	});
}

export async function onRequestOptions() {
	return new Response(null, { headers: corsHeaders() });
}

export async function onRequestGet(context) {
	const db = context.env.DB;
	const { results } = await db.prepare('SELECT * FROM submissions ORDER BY submitted_at DESC').all();
	return json(results);
}

export async function onRequestPost(context) {
	const db = context.env.DB;
	const body = await context.request.json();
	const { name, entries } = body;

	if (!name || !entries || !entries.length) {
		return json({ error: 'Name and entries required' }, 400);
	}

	const now = new Date().toISOString();
	const batch = entries
		.filter(e => e.headline && e.url)
		.map(e => db.prepare('INSERT INTO submissions (name, headline, url, submitted_at) VALUES (?, ?, ?, ?)').bind(name.trim(), e.headline.trim(), e.url.trim(), now));

	await db.batch(batch);
	return json({ ok: true });
}

export async function onRequestDelete(context) {
	const db = context.env.DB;
	const body = await context.request.json();

	if (body.all) {
		await db.prepare('DELETE FROM submissions').run();
	} else if (body.ids && body.ids.length) {
		const placeholders = body.ids.map(() => '?').join(',');
		await db.prepare(`DELETE FROM submissions WHERE id IN (${placeholders})`).bind(...body.ids).run();
	}

	return json({ ok: true });
}
