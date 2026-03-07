<script>
	import { onMount } from 'svelte';
	import RopeLights from '$lib/components/RopeLights.svelte';
	import SlotReel from '$lib/components/SlotReel.svelte';
	import SpinButton from '$lib/components/SpinButton.svelte';
	import ResultPanel from '$lib/components/ResultPanel.svelte';
	import Timer from '$lib/components/Timer.svelte';
	import { gameState, isSpinning, isLocked } from '$lib/stores/gameStore.js';
	import { FORMAT_REEL, getDuration } from '$lib/data/storyForms.js';
	import { getStories } from '$lib/data/stories.js';

	let storyReel;
	let formReel;
	let stories = [];
	let storyReelItems = [];
	let formReelItems = [];
	let currentStory = null;
	let currentForm = null;
	let timerDuration = 30;

	let spinAudio = null;

	function stopSpinAudio() {
		if (spinAudio) {
			spinAudio.pause();
			spinAudio.currentTime = 0;
			spinAudio.onended = null;
			spinAudio = null;
		}
	}

	function buildStoryReelItems(storyList) {
		return storyList.map((s, i) => ({
			label: `Story ${i + 1}`,
			icon: '/icons/icon-story-spinner.svg',
			story: s
		}));
	}

	function buildFormReelItems() {
		return FORMAT_REEL.map(f => ({
			label: f.label,
			icon: f.icon,
			form: f
		}));
	}

	function getNextStoryIndex(usedIndices, total) {
		const available = [];
		for (let i = 0; i < total; i++) {
			if (!usedIndices.includes(i)) available.push(i);
		}
		if (available.length === 0) return Math.floor(Math.random() * total);
		return available[Math.floor(Math.random() * available.length)];
	}

	$: if ($gameState.timerRunning) stopSpinAudio();

	async function handleSpin() {
		if ($isSpinning || $gameState.timerRunning || ($isLocked && !$gameState.isFreeChoice)) return;

		const state = $gameState;
		const storyIdx = getNextStoryIndex(state.usedStoryIndices, stories.length);

		gameState.update(s => ({ ...s, spinning: true }));

		stopSpinAudio();
		try {
			spinAudio = new Audio('/sounds/wheel-of-fortune.mp3');
			spinAudio.onended = () => { spinAudio = null; };
			spinAudio.play().catch(() => {});
		} catch {}

		// Story reel: targeted spin to a specific story
		const storyPromise = storyReel?.spin(4700, storyIdx);
		await new Promise(r => setTimeout(r, 300));
		// Format reel: natural spin — no target, lands wherever it stops
		const formPromise = formReel?.spin(5000);

		await storyPromise;
		const landedFormIdx = await formPromise;

		const landedFormItem = formReelItems[landedFormIdx];
		const form = landedFormItem?.form || FORMAT_REEL[0];
		const isFreeChoice = form.id === 'free';

		currentStory = stories[storyIdx];
		currentForm = form;
		timerDuration = getDuration(form.id);

		gameState.update(s => ({
			...s,
			spinning: false,
			locked: !isFreeChoice,
			isFreeChoice,
			spinCount: s.spinCount + 1,
			usedStoryIndices: [...s.usedStoryIndices, storyIdx],
			usedFormIds: [...s.usedFormIds, form.id],
			currentStoryIndex: storyIdx,
			currentFormIndex: landedFormIdx
		}));
	}

	function handleSpinAgain() {
		gameState.update(s => ({
			...s,
			locked: false,
			isFreeChoice: false
		}));
		handleSpin();
	}

	function handleReset() {
		stopSpinAudio();
		gameState.reset();
		currentStory = null;
		currentForm = null;
		localStorage.removeItem('flamit_timer');
	}

	onMount(() => {
		stories = getStories();
		storyReelItems = buildStoryReelItems(stories);
		formReelItems = buildFormReelItems();

		const state = $gameState;
		if (state.currentStoryIndex !== null && state.currentFormIndex !== null) {
			currentStory = stories[state.currentStoryIndex];
			const formItem = formReelItems[state.currentFormIndex];
			currentForm = formItem?.form || null;
			timerDuration = currentForm ? getDuration(currentForm.id) : 30;
		}
	});
</script>

<RopeLights spinning={$isSpinning} />

<div class="content">
	<header class="header">
		<img class="logo" src="/logos/logo-flamit-logotype-white.png" alt="FlamIt" />
		<p class="subtitle">Spin to create</p>
	</header>

	<div class="reels-row">
		<SlotReel
			bind:this={storyReel}
			items={storyReelItems}
			selectedIndex={$gameState.currentStoryIndex}
			spinning={$isSpinning}
			label="Story"
		/>
		<SlotReel
			bind:this={formReel}
			items={formReelItems}
			selectedIndex={$gameState.currentFormIndex}
			spinning={$isSpinning}
			label="Format"
		/>
	</div>

	<div class="spin-area">
		<SpinButton
			spinning={$isSpinning}
			disabled={$gameState.timerRunning || ($isLocked && !$gameState.isFreeChoice)}
			onClick={handleSpin}
		/>
	</div>

	<ResultPanel
		story={currentStory}
		form={currentForm}
		isFreeChoice={$gameState.isFreeChoice}
		onSpinAgain={handleSpinAgain}
	/>

	{#if currentForm && ($isLocked || $gameState.isFreeChoice)}
		<Timer durationMinutes={timerDuration} />
	{/if}

	<div class="footer-actions">
		<button class="reset-btn" on:click={handleReset}>
			Reset FlamIt
		</button>
	</div>
</div>

<style>
	.content {
		position: relative;
		z-index: 1;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-6);
		padding-top: var(--space-10);
	}

	.header {
		text-align: center;
	}

	.logo {
		width: 31%;
		max-width: 160px;
		height: auto;
		margin-bottom: var(--space-1);
	}

	.subtitle {
		font-size: var(--font-size-sm);
		color: rgba(255, 255, 255, 0.8);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.reels-row {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}

	.spin-area {
		display: flex;
		justify-content: center;
		padding: var(--space-6) 0;
	}

	.footer-actions {
		display: flex;
		justify-content: center;
		padding: var(--space-2) 0;
		margin-top: auto;
	}

	.reset-btn {
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.6);
		text-decoration: underline;
		text-underline-offset: 2px;
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-2);
		transition: color var(--transition-fast);
	}

	.reset-btn:hover {
		color: #ffffff;
	}
</style>
