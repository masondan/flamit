export async function onRequest(context) {
	try {
		const db = context.env.DB;
		await db.prepare(`
			CREATE TABLE IF NOT EXISTS submissions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				headline TEXT NOT NULL,
				url TEXT NOT NULL,
				submitted_at TEXT NOT NULL
			)
		`).run();
		await db.prepare(`
			CREATE TABLE IF NOT EXISTS stories (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				headline TEXT NOT NULL,
				url TEXT NOT NULL,
				submitted_by TEXT NOT NULL
			)
		`).run();
	} catch (err) {
		return new Response(JSON.stringify({ error: err.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	return await context.next();
}
