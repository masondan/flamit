<script>
	import { onMount } from 'svelte';

	export let items = [];
	export let selectedIndex = null;
	export let spinning = false;
	export let label = '';

	let reelEl;
	let offset = 0;
	let animationFrame;
	let resolveStop;
	const ITEM_HEIGHT = 64;

	$: displayItems = items.length > 0 ? [...items, ...items, ...items] : [];
	$: baseOffset = items.length * ITEM_HEIGHT;

	export function spin(duration) {
		return new Promise((resolve) => {
			resolveStop = resolve;
			const startTime = performance.now();
			const totalDuration = duration || 5000;
			offset = baseOffset;

			function frame(now) {
				const elapsed = now - startTime;
				const progress = Math.min(elapsed / totalDuration, 1);

				if (progress >= 1) {
					snapToSelected();
					return;
				}

				// Speed curve: fast for first 40%, then decelerate
				let speed;
				if (progress < 0.4) {
					speed = 25 + Math.random() * 5;
				} else {
					const decelProgress = (progress - 0.4) / 0.6;
					const ease = 1 - decelProgress * decelProgress;
					speed = Math.max(1, 25 * ease);
				}

				offset += speed;

				if (offset >= baseOffset + items.length * ITEM_HEIGHT) {
					offset -= items.length * ITEM_HEIGHT;
				}

				animationFrame = requestAnimationFrame(frame);
			}

			animationFrame = requestAnimationFrame(frame);
		});
	}

	function snapToSelected() {
		if (selectedIndex === null || selectedIndex === undefined) {
			if (resolveStop) resolveStop();
			return;
		}
		const targetOffset = baseOffset + selectedIndex * ITEM_HEIGHT;
		offset = targetOffset;
		if (resolveStop) resolveStop();
	}

	onMount(() => {
		offset = baseOffset;
		return () => {
			if (animationFrame) cancelAnimationFrame(animationFrame);
		};
	});
</script>

<div class="reel-container">
	{#if label}
		<div class="reel-label">{label}</div>
	{/if}
	<div class="reel-viewport">
		<div class="reel-highlight"></div>
		<div
			class="reel-strip"
			bind:this={reelEl}
			style="transform: translateY(-{offset - ITEM_HEIGHT}px)"
			class:snapping={!spinning && selectedIndex !== null}
		>
			{#each displayItems as item, i}
				<div
					class="reel-item"
					class:selected={!spinning && selectedIndex !== null && (i % items.length) === selectedIndex}
					class:free-go={item.label === 'FREE GO'}
				>
					{#if item.icon && item.icon.startsWith('/')}
						<img class="reel-icon" src={item.icon} alt="" />
					{:else}
						<span class="reel-icon">{item.icon || ''}</span>
					{/if}
					<span class="reel-text">{item.label}</span>
				</div>
			{/each}
		</div>
		<div class="reel-fade reel-fade-top"></div>
		<div class="reel-fade reel-fade-bottom"></div>
	</div>
</div>

<style>
	.reel-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.reel-label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: #ffffff;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-2);
	}

	.reel-viewport {
		width: 100%;
		height: 192px;
		overflow: hidden;
		position: relative;
		background: #ffffff;
		border-radius: var(--radius-lg);
		border: 2px solid var(--color-accent);
		box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1), 0 0 12px rgba(255, 215, 0, 0.2);
	}

	.reel-highlight {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 64px;
		transform: translateY(-50%);
		border-top: 2px solid var(--color-accent);
		border-bottom: 2px solid var(--color-accent);
		background: rgba(84, 34, 176, 0.08);
		z-index: 2;
		pointer-events: none;
	}

	.reel-strip {
		display: flex;
		flex-direction: column;
		will-change: transform;
	}

	.reel-strip.snapping {
		transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.reel-item {
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		color: var(--color-primary);
		font-family: var(--font-family-saira);
		font-stretch: 87.5%;
		font-weight: 500;
		font-size: var(--font-size-lg);
		flex-shrink: 0;
	}

	.reel-item.selected {
		color: var(--color-primary);
		font-weight: 600;
	}

	.reel-item.free-go {
		font-stretch: 75%;
		font-weight: 700;
	}

	.reel-icon {
		font-size: 1.4rem;
	}

	img.reel-icon {
		width: 1.4rem;
		height: 1.4rem;
		filter: brightness(0) saturate(100%) invert(14%) sepia(60%) saturate(5000%) hue-rotate(260deg) brightness(80%) contrast(100%);
	}

	.reel-text {
		font-size: var(--font-size-base);
	}

	.reel-fade {
		position: absolute;
		left: 0;
		right: 0;
		height: 48px;
		z-index: 1;
		pointer-events: none;
	}

	.reel-fade-top {
		top: 0;
		background: linear-gradient(to bottom, var(--color-primary-light) 0%, transparent 100%);
	}

	.reel-fade-bottom {
		bottom: 0;
		background: linear-gradient(to top, var(--color-primary-light) 0%, transparent 100%);
	}
</style>
