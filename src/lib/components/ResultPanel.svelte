<script>
	export let story = null;
	export let form = null;
</script>

{#if story && form}
	<div class="result-panel">
		{#if form.id === 'free'}
			<p class="result-instruction">
				Choose <strong>any format</strong> for the story below
			</p>
		{:else}
			<p class="result-instruction">
				Create a <strong class="form-highlight">{form.label}</strong> story based on:
			</p>
		{/if}
		<div class="story-link">
			<a href={story.url} target="_blank" rel="noopener noreferrer">
				{story.headline}
			</a>
		</div>
	</div>
{/if}

<style>
	.result-panel {
		background: var(--color-primary-light);
		border: 2px solid var(--color-accent);
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
</style>
