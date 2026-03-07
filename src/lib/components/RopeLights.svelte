<script>
	export let spinning = false;
</script>

<div class="rope-lights" class:spinning>
	<div class="light-border"></div>
</div>

<style>
	.rope-lights {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		border-radius: 0;
	}

	.light-border {
		position: absolute;
		inset: 0;
		border-radius: inherit;
	}

	.light-border::before {
		content: '';
		position: absolute;
		inset: -2px;
		border-radius: inherit;
		background: conic-gradient(
			from 0deg,
			#5422b0 0%,
			#FFD700 15%,
			#5422b0 30%,
			#FFD700 45%,
			#5422b0 60%,
			#FFD700 75%,
			#5422b0 90%,
			#FFD700 100%
		);
		animation: chase 4s linear infinite;
		opacity: 0.6;
	}

	.spinning .light-border::before {
		animation-duration: 0.4s;
		opacity: 1;
	}

	.light-border::after {
		content: '';
		position: absolute;
		inset: 3px;
		background: var(--color-surface);
		border-radius: inherit;
	}

	@keyframes chase {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.light-border::before {
			animation: none;
			opacity: 0.4;
		}
	}
</style>
