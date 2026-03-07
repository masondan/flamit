<script>
	export let disabled = false;
	export let spinning = false;
	export let onClick;
</script>

<button
	class="spin-button"
	class:spinning
	disabled={disabled || spinning}
	on:click={onClick}
>
	{#if spinning}
		<span class="spin-icon">🎰</span>
	{:else}
		<span class="spin-label">SPIN!</span>
	{/if}
</button>

<style>
	.spin-button {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, #5422b0 0%, #7b3fe4 50%, #5422b0 100%);
		color: var(--color-text-inverse);
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.05em;
		border: 4px solid var(--color-accent);
		box-shadow:
			0 0 20px rgba(84, 34, 176, 0.4),
			0 0 40px rgba(255, 215, 0, 0.15),
			inset 0 2px 4px rgba(255, 255, 255, 0.2);
		transition: all var(--transition-normal);
		position: relative;
		overflow: hidden;
	}

	.spin-button::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.spin-button:hover:not(:disabled)::before {
		opacity: 1;
	}

	.spin-button:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow:
			0 0 30px rgba(84, 34, 176, 0.6),
			0 0 60px rgba(255, 215, 0, 0.25),
			inset 0 2px 4px rgba(255, 255, 255, 0.2);
	}

	.spin-button:active:not(:disabled) {
		transform: scale(0.97);
	}

	.spin-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.spin-button.spinning {
		animation: pulse 0.6s ease-in-out infinite;
	}

	.spin-label {
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.spin-icon {
		font-size: 2rem;
		animation: wobble 0.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { box-shadow: 0 0 20px rgba(84, 34, 176, 0.4), 0 0 40px rgba(255, 215, 0, 0.15); }
		50% { box-shadow: 0 0 30px rgba(84, 34, 176, 0.7), 0 0 60px rgba(255, 215, 0, 0.4); }
	}

	@keyframes wobble {
		0%, 100% { transform: rotate(-5deg); }
		50% { transform: rotate(5deg); }
	}
</style>
