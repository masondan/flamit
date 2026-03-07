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
	const { results } = await db.prepare('SELECT * FROM stories ORDER BY id').all();
	return json(results);
}

export async function onRequestPost(context) {
	const db = context.env.DB;
	const body = await context.request.json();
	const { submissions } = body;

	if (!submissions || !submissions.length) {
		return json({ error: 'No submissions provided' }, 400);
	}

	const batch = [];
	for (const sub of submissions) {
		batch.push(
			db.prepare('INSERT INTO stories (headline, url, submitted_by) VALUES (?, ?, ?)').bind(sub.headline, sub.url, sub.name)
		);
		if (sub.id) {
			batch.push(
				db.prepare('DELETE FROM submissions WHERE id = ?').bind(sub.id)
			);
		}
	}

	await db.batch(batch);
	return json({ ok: true });
}

export async function onRequestDelete(context) {
	const db = context.env.DB;
	const body = await context.request.json();

	if (body.all) {
		await db.prepare('DELETE FROM stories').run();
	} else if (body.ids && body.ids.length) {
		const placeholders = body.ids.map(() => '?').join(',');
		await db.prepare(`DELETE FROM stories WHERE id IN (${placeholders})`).bind(...body.ids).run();
	}

	return json({ ok: true });
}
