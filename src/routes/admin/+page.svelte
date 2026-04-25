<script>
	import { onMount } from 'svelte';

	let courseKeyInput = '';
	let originalKey = '';
	/** @type {'idle' | 'active' | 'confirmed'} */
	let buttonState = 'idle';
	/** @type {ReturnType<typeof setTimeout> | null} */
	let confirmTimer = null;
	/** @type {{ message: string, type: 'error' | 'success' } | null} */
	let toast = null;
	/** @type {ReturnType<typeof setTimeout> | null} */
	let toastTimer = null;

	/**
	 * @param {string} message
	 * @param {'error' | 'success'} [type]
	 */
	function showToast(message, type = 'success') {
		if (toastTimer) clearTimeout(toastTimer);
		toast = { message, type };
		toastTimer = setTimeout(() => { toast = null; }, 3000);
	}

	async function handleSet() {
		const trimmed = courseKeyInput.trim();
		if (!trimmed || buttonState !== 'active') return;

		try {
			const res = await fetch('/api/courseIds/set', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ courseId: trimmed })
			});
			const data = await res.json();

			if (data.success) {
				originalKey = trimmed;
				buttonState = 'confirmed';
				showToast('Course Key set');
				if (confirmTimer) clearTimeout(confirmTimer);
				confirmTimer = setTimeout(() => {
					buttonState = courseKeyInput.trim() !== originalKey ? 'active' : 'idle';
				}, 2000);
			} else {
				showToast(data.message || 'Failed to set key', 'error');
			}
		} catch {
			showToast('Connection error', 'error');
		}
	}

	async function handleReset() {
		try {
			const res = await fetch('/api/courseIds/reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await res.json();

			if (data.success) {
				courseKeyInput = '';
				originalKey = '';
				buttonState = 'idle';
				showToast('Course Key cleared');
			} else {
				showToast(data.message || 'Failed to clear key', 'error');
			}
		} catch {
			showToast('Connection error', 'error');
		}
	}

	function handleInput() {
		if (buttonState === 'confirmed') return;
		const trimmed = courseKeyInput.trim();
		buttonState = trimmed.length > 0 ? 'active' : 'idle';
	}

	onMount(async () => {
		// Load current key from backend
		try {
			const res = await fetch('/api/courseIds/current');
			if (res.ok) {
				const data = await res.json();
				if (data.courseId) {
					courseKeyInput = data.courseId;
					originalKey = data.courseId;
				}
			}
		} catch {
			// silently ignore — field stays empty
		}
	});
</script>

<svelte:head>
	<title>FlamIt Admin</title>
	<script src="/flam-nav.js"></script>
</svelte:head>

<div class="admin-page">
	<header class="admin-header">
		<flam-nav current="flamit" style="color: #333;"></flam-nav>
		<img class="header-logo" src="/logos/logo-flamit-logotype.png" alt="FlamIt" />
	</header>

	<main class="admin-content">
		<div class="field-group">
			<label class="field-label" for="course-key-input">Course Key</label>
			<div class="input-row">
				<input
					id="course-key-input"
					class="key-input"
					type="text"
					placeholder="Enter course key"
					bind:value={courseKeyInput}
					on:input={handleInput}
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
				/>
				<button
					class="set-btn"
					class:set-btn--active={buttonState === 'active'}
					class:set-btn--confirmed={buttonState === 'confirmed'}
					on:click={handleSet}
					disabled={buttonState !== 'active'}
					aria-label="Set course key"
				>
					{#if buttonState === 'confirmed'}
						<!-- Checkmark -->
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="20 6 9 17 4 12" />
						</svg>
					{:else}
						<!-- Chevron right -->
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<polyline points="9 18 15 12 9 6" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<button class="reset-btn" on:click={handleReset}>
			Reset Course Key
		</button>
	</main>

	{#if toast}
		<div class="toast" class:toast-error={toast.type === 'error'} class:toast-success={toast.type === 'success'}>
			{toast.message}
		</div>
	{/if}
</div>

<style>
	.admin-page {
		width: 100%;
		min-height: 100dvh;
		background: #ffffff;
		display: flex;
		flex-direction: column;
		font-family: var(--font-family-base);
	}

	.admin-header {
		height: 56px;
		background: #ffffff;
		border-bottom: 1px solid var(--color-border-light);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;
	}

	.admin-header :global(flam-nav) {
		position: absolute;
		left: var(--space-4);
		top: 50%;
		transform: translateY(-50%);
	}

	.header-logo {
		height: 28px;
		width: auto;
	}

	.admin-content {
		flex: 1;
		padding: var(--space-8) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field-label {
		font-size: 16px;
		font-weight: var(--font-weight-semibold);
		color: #333333;
		font-family: var(--font-family-base);
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: #ffffff;
		padding: var(--space-1);
		transition: border-color var(--transition-fast);
	}

	.input-row:focus-within {
		border-color: var(--color-primary);
	}

	.key-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-family: var(--font-family-base);
		font-size: var(--font-size-base);
		color: var(--color-text-primary);
		padding: var(--space-3) var(--space-2);
		min-width: 0;
	}

	.key-input::placeholder {
		color: var(--color-text-muted);
	}

	/* Circular set button */
	.set-btn {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		border: none;
		background: #d9cce8;
		color: #9b7fc7;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: not-allowed;
		transition: background var(--transition-normal), color var(--transition-normal);
	}

	.set-btn svg {
		width: 16px;
		height: 16px;
	}

	.set-btn--active {
		background: var(--color-primary);
		color: #ffffff;
		cursor: pointer;
	}

	.set-btn--active:hover {
		opacity: 0.9;
	}

	.set-btn--confirmed {
		background: var(--color-success);
		color: #ffffff;
		cursor: default;
	}

	/* Reset button */
	.reset-btn {
		width: 100%;
		height: var(--touch-target-min);
		background: #555555;
		color: #ffffff;
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-family-base);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: opacity var(--transition-fast);
	}

	.reset-btn:hover {
		opacity: 0.85;
	}

	/* Toast */
	.toast {
		position: fixed;
		bottom: var(--space-8);
		left: 50%;
		transform: translateX(-50%);
		padding: var(--space-3) var(--space-6);
		border-radius: var(--radius-full);
		font-family: var(--font-family-saira);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
		z-index: 100;
		animation: toast-in 200ms ease;
	}

	.toast-success {
		background: rgba(0, 0, 0, 0.75);
		color: #ffffff;
	}

	.toast-error {
		background: var(--color-error);
		color: #ffffff;
	}

	@keyframes toast-in {
		from { opacity: 0; transform: translateX(-50%) translateY(8px); }
		to   { opacity: 1; transform: translateX(-50%) translateY(0); }
	}
</style>
