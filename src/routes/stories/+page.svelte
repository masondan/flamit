<script>
	import { onMount } from 'svelte';
	import { getStories, saveStories } from '$lib/data/stories.js';

	let isAdmin = false;
	let submissions = [];
	let approvedStories = [];

	let name = '';
	let entries = [{ headline: '', url: '' }];
	let submitted = false;
	let errorMsg = '';

	const SUBMISSIONS_KEY = 'flamit_submissions';

	function loadSubmissions() {
		try {
			const stored = localStorage.getItem(SUBMISSIONS_KEY);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}

	function saveSubmissions(subs) {
		localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
	}

	function addEntry() {
		if (entries.length < 3) {
			entries = [...entries, { headline: '', url: '' }];
		}
	}

	function removeEntry(index) {
		entries = entries.filter((_, i) => i !== index);
	}

	function handleSubmit() {
		errorMsg = '';

		if (!name.trim()) {
			errorMsg = 'Please enter your name.';
			return;
		}

		const validEntries = entries.filter(e => e.headline.trim() && e.url.trim());
		if (validEntries.length === 0) {
			errorMsg = 'Please add at least one story with headline and URL.';
			return;
		}

		const newSubmissions = validEntries.map((e, i) => ({
			id: Date.now() + i,
			name: name.trim(),
			headline: e.headline.trim(),
			url: e.url.trim(),
			approved: false,
			submittedAt: new Date().toISOString()
		}));

		const allSubs = [...loadSubmissions(), ...newSubmissions];
		saveSubmissions(allSubs);

		submitted = true;
	}

	function toggleApproval(id) {
		submissions = submissions.map(s =>
			s.id === id ? { ...s, approved: !s.approved } : s
		);
		saveSubmissions(submissions);
	}

	function addToFlamIt() {
		const selected = submissions.filter(s => s.approved);
		if (selected.length === 0) return;

		const newStories = selected.map((s, i) => ({
			id: Date.now() + i,
			headline: s.headline,
			url: s.url,
			submittedBy: s.name
		}));

		const existing = getStories();
		const isDefault = existing.length <= 2 && existing[0]?.submittedBy === 'Demo';
		const merged = isDefault ? newStories : [...existing, ...newStories];

		saveStories(merged);

		submissions = submissions.filter(s => !s.approved);
		saveSubmissions(submissions);

		alert(`${selected.length} story/stories added to FlamIt!`);
	}

	function clearAll() {
		if (confirm('Clear all submissions?')) {
			submissions = [];
			saveSubmissions([]);
		}
	}

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		isAdmin = params.has('admin');

		if (isAdmin) {
			submissions = loadSubmissions();
			approvedStories = getStories();
		}
	});
</script>

<div class="stories-page">
	{#if isAdmin}
		<header class="page-header">
			<h1 class="page-title">FlamIt Admin</h1>
			<p class="page-subtitle">Review and select stories</p>
		</header>

		{#if submissions.length === 0}
			<div class="empty-state">
				<p>No submissions yet.</p>
			</div>
		{:else}
			<div class="submissions-list">
				{#each submissions as sub (sub.id)}
					<div class="submission-card" class:approved={sub.approved}>
						<label class="submission-check">
							<input
								type="checkbox"
								checked={sub.approved}
								on:change={() => toggleApproval(sub.id)}
							/>
						</label>
						<div class="submission-content">
							<div class="submission-name">{sub.name}</div>
							<div class="submission-headline">{sub.headline}</div>
							<a class="submission-url" href={sub.url} target="_blank" rel="noopener noreferrer">
								{sub.url}
							</a>
						</div>
					</div>
				{/each}
			</div>

			<div class="admin-actions">
				<button class="btn-primary" on:click={addToFlamIt}>
					Add Selected to FlamIt
				</button>
				<button class="btn-danger" on:click={clearAll}>
					Clear All
				</button>
			</div>
		{/if}

		{#if approvedStories.length > 0}
			<div class="current-stories">
				<h2 class="section-title">Current FlamIt Stories ({approvedStories.length})</h2>
				{#each approvedStories as story}
					<div class="story-item">
						<span>{story.headline}</span>
						<span class="story-by">— {story.submittedBy}</span>
					</div>
				{/each}
			</div>
		{/if}

	{:else}
		<header class="page-header">
			<h1 class="page-title">📰 Story Suggestions</h1>
			<p class="page-subtitle">Help us build a great story list</p>
		</header>

		{#if submitted}
			<div class="success-state">
				<p class="success-icon">✅</p>
				<p class="success-text">Thanks! Your stories have been submitted.</p>
			</div>
		{:else}
			<div class="form-section">
				<p class="form-intro">
					Choose up to three stories published in the last month spotlighting issues or topics that cry out for more explanation and context; that must spark questions like <em>how</em> and <em>why</em>.
				</p>
				<p class="form-intro">
					Don't limit your choice to 'breaking news' — consider culture, social inclusion, family, tech, migration, education, politics, business, sport etc in news, reports and features.
				</p>

				<div class="input-group">
					<label class="input-label">Your name</label>
					<input
						class="text-input"
						type="text"
						placeholder="Enter your name"
						bind:value={name}
					/>
				</div>

				{#each entries as entry, i}
					<div class="story-entry">
						<div class="entry-header">
							<span class="entry-number">Story {i + 1}</span>
							{#if entries.length > 1}
								<button class="remove-btn" on:click={() => removeEntry(i)}>✕</button>
							{/if}
						</div>
						<input
							class="text-input"
							type="text"
							placeholder="Enter headline"
							bind:value={entry.headline}
						/>
						<input
							class="text-input"
							type="url"
							placeholder="Enter URL"
							bind:value={entry.url}
						/>
					</div>
				{/each}

				{#if entries.length < 3}
					<button class="add-more-btn" on:click={addEntry}>
						+ Add another story
					</button>
				{/if}

				{#if errorMsg}
					<p class="error-msg">{errorMsg}</p>
				{/if}

				<button class="btn-primary submit-btn" on:click={handleSubmit}>
					Submit Stories
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.stories-page {
		flex: 1;
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.page-header {
		text-align: center;
		margin-bottom: var(--space-2);
	}

	.page-title {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
	}

	.page-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.form-intro {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--space-2);
	}

	.input-group {
		margin-bottom: var(--space-3);
	}

	.input-label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-1);
	}

	.text-input {
		width: 100%;
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		background: var(--color-surface);
		transition: border-color var(--transition-fast);
	}

	.text-input:focus {
		border-color: var(--color-primary);
	}

	.story-entry {
		background: var(--color-border-light);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.entry-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.entry-number {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
	}

	.remove-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		background: none;
		border: none;
		cursor: pointer;
	}

	.remove-btn:hover {
		color: var(--color-error);
		background: rgba(220, 20, 60, 0.1);
	}

	.add-more-btn {
		font-size: var(--font-size-sm);
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-2) 0;
	}

	.add-more-btn:hover {
		text-decoration: underline;
	}

	.btn-primary {
		width: 100%;
		height: var(--touch-target-min);
		background: var(--color-primary);
		color: var(--color-text-inverse);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: opacity var(--transition-fast);
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.submit-btn {
		margin-top: var(--space-2);
	}

	.error-msg {
		color: var(--color-error);
		font-size: var(--font-size-sm);
		text-align: center;
	}

	.success-state {
		text-align: center;
		padding: var(--space-8) 0;
	}

	.success-icon {
		font-size: 3rem;
		margin-bottom: var(--space-3);
	}

	.success-text {
		font-size: var(--font-size-lg);
		color: var(--color-text-primary);
	}

	/* Admin styles */
	.empty-state {
		text-align: center;
		padding: var(--space-8) 0;
		color: var(--color-text-muted);
	}

	.submissions-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.submission-card {
		display: flex;
		gap: var(--space-3);
		padding: var(--space-3);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-md);
		align-items: flex-start;
		transition: border-color var(--transition-fast);
	}

	.submission-card.approved {
		border-color: var(--color-success);
		background: rgba(16, 185, 129, 0.05);
	}

	.submission-check input {
		width: 20px;
		height: 20px;
		margin-top: 2px;
		accent-color: var(--color-primary);
	}

	.submission-content {
		flex: 1;
		min-width: 0;
	}

	.submission-name {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-bottom: 2px;
	}

	.submission-headline {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin-bottom: 2px;
	}

	.submission-url {
		font-size: var(--font-size-xs);
		color: var(--color-primary);
		word-break: break-all;
	}

	.admin-actions {
		display: flex;
		gap: var(--space-3);
	}

	.admin-actions .btn-primary {
		flex: 1;
	}

	.btn-danger {
		background: none;
		border: 1px solid var(--color-error);
		color: var(--color-error);
		height: var(--touch-target-min);
		padding: 0 var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-danger:hover {
		background: var(--color-error);
		color: white;
	}

	.current-stories {
		border-top: 1px solid var(--color-border-light);
		padding-top: var(--space-4);
	}

	.section-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-primary);
		margin-bottom: var(--space-3);
	}

	.story-item {
		font-size: var(--font-size-sm);
		padding: var(--space-2) 0;
		border-bottom: 1px solid var(--color-border-light);
	}

	.story-by {
		color: var(--color-text-muted);
		font-size: var(--font-size-xs);
	}

	.form-section {
		display: flex;
		flex-direction: column;
	}
</style>
