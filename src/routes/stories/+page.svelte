<script>
	import { onMount } from 'svelte';
	import {
		fetchStoriesOrdered,
		fetchSubmissions,
		submitStories,
		approveSubmissions,
		deleteSubmissions,
		deleteStories
	} from '$lib/data/stories.js';

	let isAdmin = false;
	let submissions = [];
	let approvedStories = [];

	let name = '';
	let entries = [{ headline: '', url: '' }];
	let submitted = false;
	let errorMsg = '';
	let submitting = false;

	// Admin: story management
	let dangerOpen = false;
	let selectedStoryIds = [];
	let showDeleteModal = false;
	let showResetModal = false;

	function addEntry() {
		if (entries.length < 3) {
			entries = [...entries, { headline: '', url: '' }];
		}
	}

	function removeEntry(index) {
		entries = entries.filter((_, i) => i !== index);
	}

	async function handleSubmit() {
		errorMsg = '';

		if (!name.trim()) {
			errorMsg = 'Please enter your name.';
			return;
		}

		const validEntries = entries
			.filter(e => e.headline.trim() && e.url.trim())
			.map(e => ({
				headline: e.headline.trim(),
				url: e.url.trim().match(/^https?:\/\//) ? e.url.trim() : `https://${e.url.trim()}`
			}));
		if (validEntries.length === 0) {
			errorMsg = 'Please add at least one story with headline and URL.';
			return;
		}

		submitting = true;
		try {
			await submitStories(name.trim(), validEntries);
			submitted = true;
		} catch {
			errorMsg = 'Failed to submit. Please try again.';
		}
		submitting = false;
	}

	function toggleApproval(id) {
		submissions = submissions.map(s =>
			s.id === id ? { ...s, approved: !s.approved } : s
		);
	}

	async function addToFlamIt() {
		const selected = submissions.filter(s => s.approved);
		if (selected.length === 0) return;

		try {
			await approveSubmissions(selected);
			submissions = submissions.filter(s => !s.approved);
			approvedStories = await fetchStoriesOrdered();
		} catch {
			alert('Failed to approve stories.');
		}
	}

	async function clearAll() {
		if (confirm('Clear all submissions?')) {
			try {
				await deleteSubmissions();
				submissions = [];
			} catch {
				alert('Failed to clear submissions.');
			}
		}
	}

	function toggleStorySelect(id) {
		if (selectedStoryIds.includes(id)) {
			selectedStoryIds = selectedStoryIds.filter(sid => sid !== id);
		} else {
			selectedStoryIds = [...selectedStoryIds, id];
		}
	}

	function downloadAll() {
		const blob = new Blob([JSON.stringify(approvedStories, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'flamit-stories.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	async function deleteSelected() {
		try {
			await deleteStories(selectedStoryIds);
			approvedStories = await fetchStoriesOrdered();
			selectedStoryIds = [];
			showDeleteModal = false;
		} catch {
			alert('Failed to delete stories.');
		}
	}

	async function resetFlamIt() {
		try {
			await deleteStories();
			approvedStories = [];
			selectedStoryIds = [];
			showResetModal = false;
		} catch {
			alert('Failed to reset.');
		}
	}

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		isAdmin = params.has('admin');

		if (isAdmin) {
			submissions = await fetchSubmissions();
			approvedStories = await fetchStoriesOrdered();
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
					Clear
				</button>
			</div>
		{/if}

		{#if approvedStories.length > 0}
			<div class="current-stories">
				<h2 class="section-title">Current FlamIt Stories ({approvedStories.length})</h2>
				{#each approvedStories as story (story.id)}
					<div class="story-item" class:selectable={dangerOpen}>
						{#if dangerOpen}
							<label class="story-check">
								<input
									type="checkbox"
									checked={selectedStoryIds.includes(story.id)}
									on:change={() => toggleStorySelect(story.id)}
								/>
							</label>
						{/if}
						<div class="story-content">
							<a class="story-link" href={story.url} target="_blank" rel="noopener noreferrer">{story.headline}</a>
							<span class="story-by">— {story.submittedBy}</span>
						</div>
					</div>
				{/each}

				<div class="story-actions">
					<button class="btn-outline" on:click={downloadAll}>
						Download All
					</button>
				</div>

				<button class="danger-toggle" on:click={() => { dangerOpen = !dangerOpen; if (!dangerOpen) selectedStoryIds = []; }}>
					Danger zone
					<span class="chevron" class:open={dangerOpen}>▸</span>
				</button>

				{#if dangerOpen}
					<div class="danger-actions">
						<button class="btn-danger" on:click={() => { showDeleteModal = true; }}>
							Delete selected
						</button>
						<button class="btn-danger" on:click={() => { showResetModal = true; }}>
							Reset FlamIt
						</button>
					</div>
				{/if}
			</div>
		{/if}

	{:else}
		<header class="page-header">
			<h1 class="page-title">Story Stack</h1>
		</header>

		{#if submitted}
			<div class="success-state">
				<img class="success-image" src="/logos/logo-media-cluster.png" alt="" />
				<p class="success-heading">Thank you</p>
				<p class="success-text">Your stories have been submitted</p>
			</div>
		{:else}
			<div class="form-section">
				<p class="form-intro">
					Choose <strong>up to three stories</strong> published in the last month spotlighting topical issues or topics that cry out for more explanation and context; stories that leave your audience asking <em>how</em> and <em>why</em>.
				</p>
				<p class="form-intro">
					Don't limit your choice to 'breaking news' — consider culture, health, social inclusion, tech, family, migration, education, politics, entertainment, business, sport etc across news, opinion, reports and features.
				</p>

				<div class="input-group">
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

				<button class="btn-primary submit-btn" on:click={handleSubmit} disabled={submitting}>
					{submitting ? 'Submitting...' : 'Submit Stories'}
				</button>
			</div>
		{/if}
	{/if}
</div>

{#if showDeleteModal}
	<div class="modal-overlay" on:click={() => { showDeleteModal = false; }}>
		<div class="modal" on:click|stopPropagation>
			<p class="modal-text">Delete selected?</p>
			<div class="modal-actions">
				<button class="btn-outline modal-btn" on:click={() => { showDeleteModal = false; }}>Cancel</button>
				<button class="btn-danger modal-btn" on:click={deleteSelected}>Delete</button>
			</div>
		</div>
	</div>
{/if}

{#if showResetModal}
	<div class="modal-overlay" on:click={() => { showResetModal = false; }}>
		<div class="modal" on:click|stopPropagation>
			<p class="modal-text">Delete all stories from FlamIt. Are you sure?</p>
			<div class="modal-actions">
				<button class="btn-outline modal-btn" on:click={() => { showResetModal = false; }}>Cancel</button>
				<button class="btn-danger modal-btn" on:click={resetFlamIt}>Reset</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.stories-page {
		flex: 1;
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		background: #ffffff;
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
		margin-top: var(--space-4);
		margin-bottom: var(--space-4);
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
		margin-bottom: var(--space-4);
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

	.success-image {
		width: 120px;
		height: auto;
		margin-bottom: var(--space-4);
	}

	.success-heading {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
		margin-bottom: var(--space-2);
	}

	.success-text {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
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

	.btn-outline {
		background: none;
		border: 1px solid var(--color-primary);
		color: var(--color-primary);
		height: var(--touch-target-min);
		padding: 0 var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.btn-outline:hover {
		background: var(--color-primary);
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
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.story-check input {
		width: 18px;
		height: 18px;
		accent-color: var(--color-error);
		flex-shrink: 0;
	}

	.story-content {
		flex: 1;
	}

	.story-link {
		color: var(--color-primary);
		text-decoration: underline;
		text-underline-offset: 2px;
		font-weight: var(--font-weight-semibold);
	}

	.story-link:hover {
		opacity: 0.8;
	}

	.story-by {
		color: var(--color-text-muted);
		font-size: var(--font-size-xs);
	}

	.story-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.story-actions .btn-outline {
		flex: 1;
	}

	.danger-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1);
		width: 100%;
		padding: var(--space-3) 0;
		margin-top: var(--space-3);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-error);
		background: none;
		border: none;
		cursor: pointer;
	}

	.chevron {
		display: inline-block;
		transition: transform var(--transition-fast);
		font-size: var(--font-size-sm);
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	.danger-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}

	.danger-actions .btn-danger {
		flex: 1;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.modal {
		background: #ffffff;
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 320px;
		width: 90%;
		text-align: center;
	}

	.modal-text {
		font-size: var(--font-size-base);
		color: var(--color-text-primary);
		margin-bottom: var(--space-4);
		line-height: var(--line-height-normal);
	}

	.modal-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: center;
	}

	.modal-btn {
		min-width: 100px;
	}

	.form-section {
		display: flex;
		flex-direction: column;
	}
</style>
