<script>
	import { onMount, onDestroy } from 'svelte';
	import { gameState } from '$lib/stores/gameStore.js';

	export let durationMinutes = 30;

	let interval;
	let remainingSeconds = 0;
	let running = false;

	const TIMER_KEY = 'flamit_timer';

	$: minutes = Math.floor(remainingSeconds / 60);
	$: seconds = remainingSeconds % 60;
	$: display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	$: urgent = remainingSeconds > 0 && remainingSeconds <= 60;
	$: finished = running && remainingSeconds <= 0;

	function loadTimer() {
		if (typeof window === 'undefined') return;
		try {
			const stored = localStorage.getItem(TIMER_KEY);
			if (stored) {
				const data = JSON.parse(stored);
				if (data.endTime && data.running) {
					const now = Date.now();
					const remaining = Math.max(0, Math.ceil((data.endTime - now) / 1000));
					if (remaining > 0) {
						remainingSeconds = remaining;
						running = true;
						startInterval();
						return;
					} else {
						remainingSeconds = 0;
						running = false;
						playAlarm();
					}
				} else if (data.remainingSeconds !== undefined) {
					remainingSeconds = data.remainingSeconds;
					running = false;
				}
			} else {
				remainingSeconds = durationMinutes * 60;
			}
		} catch {
			remainingSeconds = durationMinutes * 60;
		}
	}

	function saveTimer() {
		if (typeof window === 'undefined') return;
		localStorage.setItem(TIMER_KEY, JSON.stringify({
			endTime: running ? Date.now() + remainingSeconds * 1000 : null,
			remainingSeconds,
			running
		}));
	}

	function startInterval() {
		clearInterval(interval);
		interval = setInterval(() => {
			remainingSeconds = Math.max(0, remainingSeconds - 1);
			if (remainingSeconds <= 0) {
				running = false;
				clearInterval(interval);
				playAlarm();
				saveTimer();
			}
		}, 1000);
	}

	function toggleTimer() {
		if (remainingSeconds <= 0) {
			remainingSeconds = durationMinutes * 60;
			running = false;
			saveTimer();
			return;
		}

		running = !running;
		playDing();
		if (running) {
			startInterval();
		} else {
			clearInterval(interval);
		}
		saveTimer();
	}

	function playAlarm() {
		try {
			const audio = new Audio('/sounds/alarm.mp3');
			audio.play().catch(() => {});
		} catch {}
	}

	function playDing() {
		try {
			const audio = new Audio('/sounds/timer.mp3');
			audio.play().catch(() => {});
		} catch {}
	}

	$: if (durationMinutes && !running) {
		const stored = typeof window !== 'undefined' ? localStorage.getItem(TIMER_KEY) : null;
		if (!stored) {
			remainingSeconds = durationMinutes * 60;
		}
	}

	onMount(() => {
		loadTimer();
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="timer-section">
	<div class="timer-header">Deadline</div>
	<p class="timer-info">
		You have <strong>{durationMinutes} minutes</strong> to complete this story.
	</p>
	<div class="timer-panel">
		<div class="timer-row">
			<button class="timer-btn" on:click={toggleTimer}>
				{#if finished}
					Reset
				{:else if running}
					Stop
				{:else}
					Start
				{/if}
			</button>
			<div class="timer-display" class:urgent class:finished>
				{display}
			</div>
		</div>
	</div>
</div>

<style>
	.timer-section {
		text-align: center;
		margin-top: var(--space-4);
	}

	.timer-header {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: #ffffff;
		margin-bottom: var(--space-1);
	}

	.timer-info {
		font-size: var(--font-size-sm);
		color: #ffffff;
		margin-bottom: var(--space-3);
		line-height: var(--line-height-normal);
	}

	.timer-info strong {
		color: #ffffff;
	}

	.timer-panel {
		background: #ffffff;
		border: 2px solid var(--color-accent);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	.timer-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
	}

	.timer-btn {
		background: var(--color-primary);
		color: var(--color-text-inverse);
		padding: var(--space-2) var(--space-5);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		height: var(--touch-target-min);
		min-width: 80px;
		border: none;
		cursor: pointer;
		transition: opacity var(--transition-fast);
	}

	.timer-btn:hover {
		opacity: 0.9;
	}

	.timer-display {
		font-size: 2rem;
		font-weight: var(--font-weight-bold);
		font-variant-numeric: tabular-nums;
		color: var(--color-primary);
		min-width: 100px;
	}

	.timer-display.urgent {
		color: var(--color-error);
		animation: blink 1s ease-in-out infinite;
	}

	.timer-display.finished {
		color: var(--color-error);
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
</style>
