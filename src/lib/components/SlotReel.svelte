<script>
	import { onMount } from 'svelte';

	export let items = [];
	export let selectedIndex = null;
	export let spinning = false;
	export let label = '';

	let reelEl;
	let offset = 0;
	let animationFrame;
	let speed = 0;
	let resolveStop;
	const ITEM_HEIGHT = 64;

	$: displayItems = items.length > 0 ? [...items, ...items, ...items] : [];
	$: baseOffset = items.length * ITEM_HEIGHT;

	export function spin(duration) {
		return new Promise((resolve) => {
			resolveStop = resolve;
			speed = 25 + Math.random() * 10;
			offset = baseOffset;
			tick(duration);
		});
	}

	function tick(remainingMs) {
		if (remainingMs <= 0) {
			snapToSelected();
			return;
		}

		const startTime = performance.now();

		function frame(now) {
			const elapsed = now - startTime;
			if (elapsed >= 16) {
				offset += speed;

				if (offset >= baseOffset + items.length * ITEM_HEIGHT) {
					offset -= items.length * ITEM_HEIGHT;
				}

				const remaining = remainingMs - elapsed;
				const progress = 1 - (remaining / (remaining + 500));
				if (remaining < 800) {
					speed = Math.max(2, speed * 0.96);
				}

				if (remaining <= 0) {
					snapToSelected();
					return;
				}

				tick(remaining - elapsed);
				return;
			}
			animationFrame = requestAnimationFrame(frame);
		}

		animationFrame = requestAnimationFrame(frame);
	}

	function snapToSelected() {
		if (selectedIndex === null || selectedIndex === undefined) {
			if (resolveStop) resolveStop();
			return;
		}
		const targetOffset = baseOffset + selectedIndex * ITEM_HEIGHT;
		offset = targetOffset;
		speed = 0;
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
				>
					<span class="reel-icon">{item.icon || ''}</span>
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
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-2);
	}

	.reel-viewport {
		width: 100%;
		height: 192px;
		overflow: hidden;
		position: relative;
		background: linear-gradient(135deg, #1a0a30 0%, #2d1560 50%, #1a0a30 100%);
		border-radius: var(--radius-lg);
		border: 2px solid var(--color-accent);
		box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 215, 0, 0.2);
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
		background: rgba(84, 34, 176, 0.15);
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
		color: rgba(255, 255, 255, 0.7);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		flex-shrink: 0;
	}

	.reel-item.selected {
		color: #ffffff;
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}

	.reel-icon {
		font-size: 1.4rem;
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
		background: linear-gradient(to bottom, #1a0a30 0%, transparent 100%);
	}

	.reel-fade-bottom {
		bottom: 0;
		background: linear-gradient(to top, #1a0a30 0%, transparent 100%);
	}
</style>
