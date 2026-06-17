<script>
	import { onMount } from 'svelte';

	// Course Key state
	let courseKeyInput = '';
	let originalKey = '';
	/** @type {'idle' | 'active' | 'confirmed'} */
	let courseKeyButtonState = 'idle';
	/** @type {ReturnType<typeof setTimeout> | null} */
	let courseKeyConfirmTimer = null;

	// App Password state
	let appPasswordInput = '';
	let appPasswordLoading = false;
	let appPasswordFocused = false;
	/** @type {'idle' | 'active' | 'confirmed'} */
	let appPasswordButtonState = 'idle';
	let isDefaultPassword = false;

	// Toast state
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

	// ===== Course Key Functions =====
	async function handleCourseKeySet() {
		const trimmed = courseKeyInput.trim();
		if (!trimmed || courseKeyButtonState !== 'active') return;

		try {
			const res = await fetch('/api/courseIds/set', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ courseId: trimmed })
			});
			const data = await res.json();

			if (data.success) {
				originalKey = trimmed;
				courseKeyButtonState = 'confirmed';
				showToast('Course Key set');
				if (courseKeyConfirmTimer) clearTimeout(courseKeyConfirmTimer);
				courseKeyConfirmTimer = setTimeout(() => {
					courseKeyButtonState = courseKeyInput.trim() !== originalKey ? 'active' : 'idle';
				}, 2000);
			} else {
				showToast(data.message || 'Failed to set key', 'error');
			}
		} catch {
			showToast('Connection error', 'error');
		}
	}

	async function handleCourseKeyReset() {
		try {
			const res = await fetch('/api/courseIds/reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			const data = await res.json();

			if (data.success) {
				courseKeyInput = '';
				originalKey = '';
				courseKeyButtonState = 'idle';
				showToast('Course Key cleared');
			} else {
				showToast(data.message || 'Failed to clear key', 'error');
			}
		} catch {
			showToast('Connection error', 'error');
		}
	}

	function handleCourseKeyInput() {
		if (courseKeyButtonState === 'confirmed') return;
		const trimmed = courseKeyInput.trim();
		courseKeyButtonState = trimmed.length > 0 ? 'active' : 'idle';
	}

	// ===== App Password Functions =====
	async function handleAppPasswordSet() {
		const trimmed = appPasswordInput.trim();
		if (!trimmed || appPasswordButtonState !== 'active' || appPasswordLoading) return;

		appPasswordLoading = true;
		try {
			const res = await fetch('/api/admin/password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: trimmed })
			});
			const data = await res.json();

			if (data.success) {
				appPasswordButtonState = 'confirmed';
				showToast('App password updated');
				setTimeout(() => {
					appPasswordButtonState = 'idle';
					appPasswordInput = '';
					appPasswordFocused = false;
				}, 1500);
				// Reload current password
				await loadAppPassword();
			} else {
				showToast(data.message || 'Failed to update password', 'error');
				appPasswordButtonState = 'idle';
			}
		} catch {
			showToast('Connection error', 'error');
			appPasswordButtonState = 'idle';
		}
		appPasswordLoading = false;
	}

	function handleAppPasswordInput() {
		if (appPasswordButtonState === 'confirmed') return;
		const trimmed = appPasswordInput.trim();
		appPasswordButtonState = trimmed.length > 0 ? 'active' : 'idle';
	}

	async function loadAppPassword() {
		try {
			const res = await fetch('/api/admin/password');
			if (res.ok) {
				const data = await res.json();
				isDefaultPassword = data.isDefault;
			}
		} catch {
			// silently ignore
		}
	}

	// ===== Lifecycle =====
	onMount(async () => {
		// Load current course key
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
			// silently ignore
		}

		// Load app password status
		await loadAppPassword();
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
		<!-- App Password Section -->
		<div class="section">
			<h2 class="section-title">App Password</h2>
			<p class="section-subtitle">Users must enter this password to access FlamIt</p>
			<div class="field-group">
				<label class="field-label" for="app-password-input">Password</label>
				<p class="field-hint">{isDefaultPassword ? 'Currently using default password' : 'Custom password set'}</p>
				<div class="input-row">
					<input
						id="app-password-input"
						class="password-input"
						type="password"
						placeholder="Enter new password"
						bind:value={appPasswordInput}
						on:input={handleAppPasswordInput}
						on:focus={() => (appPasswordFocused = true)}
						on:blur={() => (appPasswordFocused = false)}
						autocomplete="off"
						disabled={appPasswordLoading}
					/>
					{#if appPasswordFocused || (appPasswordInput && appPasswordButtonState !== 'confirmed')}
						<button
							class="set-btn"
							class:set-btn--active={appPasswordButtonState === 'active'}
							class:set-btn--confirmed={appPasswordButtonState === 'confirmed'}
							on:click={handleAppPasswordSet}
							disabled={appPasswordButtonState !== 'active' || appPasswordLoading}
							aria-label="Set app password"
						>
							{#if appPasswordButtonState === 'confirmed'}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							{/if}
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Course Key Section -->
		<div class="section">
			<h2 class="section-title">Course Key</h2>
			<p class="section-subtitle">Rotating key for training sessions (optional)</p>
			<div class="field-group">
				<label class="field-label" for="course-key-input">Key</label>
				<div class="input-row">
					<input
						id="course-key-input"
						class="key-input"
						type="text"
						placeholder="Enter course key"
						bind:value={courseKeyInput}
						on:input={handleCourseKeyInput}
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
					/>
					<button
						class="set-btn"
						class:set-btn--active={courseKeyButtonState === 'active'}
						class:set-btn--confirmed={courseKeyButtonState === 'confirmed'}
						on:click={handleCourseKeySet}
						disabled={courseKeyButtonState !== 'active'}
						aria-label="Set course key"
					>
						{#if courseKeyButtonState === 'confirmed'}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="9 18 15 12 9 6" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<button class="reset-btn" on:click={handleCourseKeyReset}>
				Reset Course Key
			</button>
		</div>
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
		gap: var(--space-10);
		width: 100%;
		max-width: 500px;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-border-light);
	}

	.section:last-child {
		border-bottom: none;
	}

	.section-title {
		font-size: 18px;
		font-weight: var(--font-weight-bold);
		color: #1f1f1f;
		margin: 0;
		font-family: var(--font-family-base);
	}

	.section-subtitle {
		font-size: 14px;
		color: var(--color-text-muted);
		margin: 0;
		font-family: var(--font-family-base);
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field-label {
		font-size: 14px;
		font-weight: var(--font-weight-semibold);
		color: #333333;
		font-family: var(--font-family-base);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.field-hint {
		font-size: 12px;
		color: var(--color-text-muted);
		margin: 0;
		font-style: italic;
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

	.key-input,
	.password-input {
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

	.key-input::placeholder,
	.password-input::placeholder {
		color: var(--color-text-muted);
	}

	.key-input:disabled,
	.password-input:disabled {
		opacity: 0.75;
	}

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
