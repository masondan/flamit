<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore.js';

	let courseId = '';
	let loading = false;
	let focused = false;
	/** @type {'idle' | 'success'} */
	let buttonState = 'idle';
	/** @type {{ message: string, type: 'error' | 'success' } | null} */
	let toast = null;
	/** @type {ReturnType<typeof setTimeout> | null} */
	let toastTimer = null;

	/**
	 * @param {string} message
	 * @param {'error' | 'success'} [type]
	 */
	function showToast(message, type = 'error') {
		if (toastTimer) clearTimeout(toastTimer);
		toast = { message, type };
		toastTimer = setTimeout(() => { toast = null; }, 3500);
	}

	async function handleSubmit() {
		const trimmed = courseId.trim();
		if (!trimmed || loading) return;

		loading = true;
		try {
			const res = await fetch('/api/courseIds/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ courseId: trimmed })
			});
			const data = await res.json();

			if (data.valid) {
				buttonState = 'success';
				authStore.setCourseId(trimmed);
				setTimeout(() => goto('/'), 600);
			} else {
				showToast(data.message || 'Expired Key');
				buttonState = 'idle';
			}
		} catch {
			showToast('Connection error. Please try again.');
			buttonState = 'idle';
		}
		loading = false;
	}

	/** @param {KeyboardEvent} e */
	function handleKeydown(e) {
		if (e.key === 'Enter') handleSubmit();
	}

	$: hasInput = courseId.trim().length > 0;
	$: isActive = hasInput && !loading;
</script>

<div class="splash">
	<div class="splash-inner">
		<img class="logo" src="/logos/logo-flamit-logotype-white.png" alt="FlamIt" />

		<div class="form-area">
			<div class="input-row">
				<input
					class="course-input"
					type="text"
					placeholder="Enter your course key"
					bind:value={courseId}
					on:keydown={handleKeydown}
					on:focus={() => (focused = true)}
					on:blur={() => (focused = false)}
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
					disabled={loading}
				/>
				{#if focused || isActive}
					<button
						class="submit-btn"
						class:active={isActive}
						class:success={buttonState === 'success'}
						on:click={handleSubmit}
						disabled={!isActive}
						aria-label="Submit course key"
					>
						{#if buttonState === 'success'}
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
				{/if}
			</div>
		</div>
	</div>

	{#if toast}
		<div class="toast" class:toast-error={toast.type === 'error'} class:toast-success={toast.type === 'success'}>
			{toast.message}
		</div>
	{/if}
</div>

<style>
	.splash {
		min-height: 100dvh;
		background: var(--color-primary);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--space-6);
		position: relative;
		font-family: var(--font-family-saira);
	}

	.splash-inner {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--space-6);
	}

	.logo {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		height: 40px;
		width: auto;
	}

	.form-area {
		position: absolute;
		top: 66.66%;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 320px;
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		background: #ffffff;
		border-radius: var(--radius-lg);
		padding: var(--space-2) var(--space-4);
		border: none;
		min-height: 44px;
	}

	.course-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #1f1f1f;
		font-family: var(--font-family-saira);
		font-size: 16px;
		font-weight: var(--font-weight-medium);
		padding: 0;
		min-width: 0;
	}

	.course-input::placeholder {
		color: #777777;
		font-size: 16px;
		font-family: var(--font-family-base);
	}

	.course-input:disabled {
		opacity: 0.75;
	}

	.submit-btn {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		border: none;
		background: var(--color-primary);
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: opacity var(--transition-normal);
	}

	.submit-btn svg {
		width: 20px;
		height: 20px;
	}

	.submit-btn:hover {
		opacity: 0.9;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.submit-btn.success {
		background: var(--color-success);
		color: #ffffff;
		cursor: default;
	}

	/* Toast */
	.toast {
		position: fixed;
		bottom: var(--space-8);
		left: 50%;
		transform: translateX(-50%);
		padding: var(--space-3) var(--space-6);
		border-radius: var(--radius-full);
		font-family: var(--font-family-base);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
		z-index: 100;
		animation: toast-in 200ms ease;
	}

	.toast-error {
		background: rgba(0, 0, 0, 0.75);
		color: #ffffff;
	}

	.toast-success {
		background: var(--color-success);
		color: #ffffff;
	}

	@keyframes toast-in {
		from { opacity: 0; transform: translateX(-50%) translateY(8px); }
		to   { opacity: 1; transform: translateX(-50%) translateY(0); }
	}
</style>
