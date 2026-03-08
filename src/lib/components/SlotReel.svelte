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

	export function spin(duration, targetIndex) {
		return new Promise((resolve) => {
			resolveStop = resolve;
			const startTime = performance.now();
			const totalDuration = duration || (4900 + Math.random() * 200);
			offset = baseOffset;
			const totalItems = items.length * ITEM_HEIGHT;
			const hasTarget = targetIndex !== null && targetIndex !== undefined;

			// For targeted mode: glide interpolation state
			let finalOffset = hasTarget ? baseOffset + targetIndex * ITEM_HEIGHT : null;
			let glideStartOffset = null;

			// For natural mode: settle to nearest item boundary
			let settleTarget = null;
			let settleStart = null;

			function frame(now) {
				const elapsed = now - startTime;
				const progress = Math.min(elapsed / totalDuration, 1);

				const MAX_SPEED = 7;
				if (progress < 0.3) {
					offset += MAX_SPEED + Math.random() * 2;
				} else if (progress < (hasTarget ? 0.80 : 0.75)) {
					const phaseEnd = hasTarget ? 0.80 : 0.75;
					const decelProgress = (progress - 0.3) / (phaseEnd - 0.3);
					const ease = 1 - decelProgress * decelProgress * decelProgress * decelProgress;
					offset += Math.max(0.5, MAX_SPEED * ease);
				} else if (hasTarget) {
					// Targeted: smooth interpolation to chosen item
					if (glideStartOffset === null) {
						glideStartOffset = offset;
						while (finalOffset <= glideStartOffset) finalOffset += totalItems;
						while (finalOffset - glideStartOffset > totalItems) finalOffset -= totalItems;
					}
					const glideProgress = (progress - 0.80) / 0.20;
					const eased = 1 - Math.pow(1 - glideProgress, 3);
					offset = glideStartOffset + (finalOffset - glideStartOffset) * eased;
				} else {
					// Natural: settle smoothly to nearest item boundary
					if (settleTarget === null) {
						settleStart = offset;
						// Snap to nearest item boundary 1-2 items ahead
						const rawIndex = Math.ceil((offset - baseOffset) / ITEM_HEIGHT) + 1;
						settleTarget = baseOffset + rawIndex * ITEM_HEIGHT;
					}
					const settleProgress = (progress - 0.75) / 0.25;
					const eased = 1 - Math.pow(1 - settleProgress, 3);
					offset = settleStart + (settleTarget - settleStart) * eased;
				}

				if (offset >= baseOffset + totalItems) {
					offset -= totalItems;
				}

				if (progress >= 1) {
					// Snap to exact item boundary
					if (hasTarget && finalOffset !== null) {
						offset = finalOffset % (baseOffset + totalItems);
						if (offset < baseOffset) offset += totalItems;
					} else if (settleTarget !== null) {
						offset = settleTarget % (baseOffset + totalItems);
						if (offset < baseOffset) offset += totalItems;
					}
					// Calculate landed index
					const landedIndex = Math.round((offset - baseOffset) / ITEM_HEIGHT) % items.length;
					if (resolveStop) resolveStop(landedIndex);
					return;
				}

				animationFrame = requestAnimationFrame(frame);
			}

			animationFrame = requestAnimationFrame(frame);
		});
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
		>
			{#each displayItems as item, i}
				<div
					class="reel-item"
					class:selected={!spinning && selectedIndex !== null && (i % items.length) === selectedIndex}
					
				>
					<span class="reel-item-inner">
						<span class="reel-icon-wrap">
							{#if item.icon && item.icon.startsWith('/')}
								<img class="reel-icon-img" src={item.icon} alt="" />
							{:else}
								<span class="reel-icon-emoji">{item.icon || ''}</span>
							{/if}
						</span>
						<span class="reel-text">{item.label}</span>
					</span>
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

	.reel-item {
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary);
		font-family: var(--font-family-saira);
		font-weight: 500;
		font-size: var(--font-size-xl);
		flex-shrink: 0;
	}

	.reel-item-inner {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 130px;
	}

	.reel-item.selected {
		color: var(--color-primary);
		font-weight: 600;
	}

	.reel-icon-wrap {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.reel-icon-emoji {
		font-size: 1.2rem;
		line-height: 1;
	}

	.reel-icon-img {
		width: 20px;
		height: 20px;
		filter: brightness(0) saturate(100%) invert(14%) sepia(60%) saturate(5000%) hue-rotate(260deg) brightness(80%) contrast(100%);
	}

	.reel-text {
		font-size: inherit;
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
