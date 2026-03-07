<script>
	export let story = null;
	export let form = null;
	export let isPickOrSpin = false;
	export let onSpinAgain = null;
</script>

{#if story && form}
	<div class="result-panel">
		{#if isPickOrSpin}
			<p class="result-instruction">
				🔄 <strong>Pick or Spin!</strong> Check the story below. You can <strong>keep it</strong> and choose your own format, or <strong>spin again</strong>.
			</p>
			<div class="story-link">
				<a href={story.url} target="_blank" rel="noopener noreferrer">
					{story.headline}
				</a>
			</div>
			<button class="spin-again-btn" on:click={onSpinAgain}>
				🔄 Spin Again
			</button>
		{:else}
			<p class="result-instruction">
				Create a <strong class="form-highlight">{form.label}</strong> story based on:
			</p>
			<div class="story-link">
				<a href={story.url} target="_blank" rel="noopener noreferrer">
					{story.headline}
				</a>
			</div>
		{/if}
	</div>
{/if}

<style>
	.result-panel {
		background: var(--color-primary-light);
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		text-align: center;
	}

	.result-instruction {
		font-size: var(--font-size-base);
		color: var(--color-text-primary);
		margin-bottom: var(--space-3);
		line-height: var(--line-height-normal);
	}

	.form-highlight {
		color: var(--color-primary);
		text-transform: uppercase;
		font-size: var(--font-size-lg);
	}

	.story-link {
		margin-bottom: var(--space-3);
	}

	.story-link a {
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
		text-decoration: underline;
		text-underline-offset: 2px;
		font-size: var(--font-size-base);
		line-height: var(--line-height-normal);
	}

	.story-link a:hover {
		opacity: 0.8;
	}

	.spin-again-btn {
		background: var(--color-primary);
		color: var(--color-text-inverse);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		border: none;
		cursor: pointer;
		transition: opacity var(--transition-fast);
	}

	.spin-again-btn:hover {
		opacity: 0.9;
	}
</style>
