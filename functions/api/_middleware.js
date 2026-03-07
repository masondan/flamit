export async function onRequest(context) {
	const db = context.env.DB;
	await db.exec(`
		CREATE TABLE IF NOT EXISTS submissions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			headline TEXT NOT NULL,
			url TEXT NOT NULL,
			submitted_at TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS stories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			headline TEXT NOT NULL,
			url TEXT NOT NULL,
			submitted_by TEXT NOT NULL
		);
	`);
	return await context.next();
}
