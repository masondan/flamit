<script>
	import { onMount } from 'svelte';
	import RopeLights from '$lib/components/RopeLights.svelte';
	import SlotReel from '$lib/components/SlotReel.svelte';
	import SpinButton from '$lib/components/SpinButton.svelte';
	import ResultPanel from '$lib/components/ResultPanel.svelte';
	import Timer from '$lib/components/Timer.svelte';
	import { gameState, isSpinning, isLocked } from '$lib/stores/gameStore.js';
	import { STORY_FORMS, PICK_OR_SPIN, getDuration } from '$lib/data/storyForms.js';
	import { getStories } from '$lib/data/stories.js';

	let storyReel;
	let formReel;
	let stories = [];
	let storyReelItems = [];
	let formReelItems = [];
	let currentStory = null;
	let currentForm = null;
	let timerDuration = 30;

	function buildStoryReelItems(storyList) {
		return storyList.map((s, i) => ({
			label: `Story ${i + 1}`,
			icon: '📰',
			story: s
		}));
	}

	function buildFormReelItems() {
		const forms = [...STORY_FORMS];
		return forms.map(f => ({
			label: f.label,
			icon: f.icon,
			form: f
		}));
	}

	function shuffleWithVideoFirst(forms, spinCount) {
		const shuffled = [...forms];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}

		if (spinCount < 3) {
			const videoIdx = shuffled.findIndex(f => f.id === 'video');
			if (videoIdx > 0) {
				[shuffled[0], shuffled[videoIdx]] = [shuffled[videoIdx], shuffled[0]];
			}
		}
		return shuffled;
	}

	function getNextStoryIndex(usedIndices, total) {
		const available = [];
		for (let i = 0; i < total; i++) {
			if (!usedIndices.includes(i)) available.push(i);
		}
		if (available.length === 0) return Math.floor(Math.random() * total);
		return available[Math.floor(Math.random() * available.length)];
	}

	function getNextForm(usedFormIds, spinCount) {
		const available = STORY_FORMS.filter(f => !usedFormIds.includes(f.id));
		const pool = available.length > 0 ? available : [...STORY_FORMS];

		if (spinCount < 3) {
			const video = pool.find(f => f.id === 'video');
			if (video) return video;
		}

		const withPickOrSpin = Math.random() < 0.2 && spinCount > 0;
		if (withPickOrSpin) return PICK_OR_SPIN;

		return pool[Math.floor(Math.random() * pool.length)];
	}

	async function handleSpin() {
		if ($isSpinning || ($isLocked && !$gameState.isPickOrSpin)) return;

		const state = $gameState;
		const storyIdx = getNextStoryIndex(state.usedStoryIndices, stories.length);
		const form = getNextForm(state.usedFormIds, state.spinCount);
		const isPickOrSpin = form.id === 'pick-or-spin';

		const formIdx = isPickOrSpin
			? Math.floor(Math.random() * formReelItems.length)
			: formReelItems.findIndex(f => f.form.id === form.id);

		gameState.update(s => ({ ...s, spinning: true }));

		const storyPromise = storyReel?.spin(1800 + Math.random() * 400);
		await new Promise(r => setTimeout(r, 300));
		const formPromise = formReel?.spin(2200 + Math.random() * 400);

		gameState.update(s => ({
			...s,
			currentStoryIndex: storyIdx,
			currentFormIndex: formIdx >= 0 ? formIdx : 0
		}));

		await storyPromise;
		await formPromise;

		currentStory = stories[storyIdx];
		currentForm = isPickOrSpin ? PICK_OR_SPIN : form;
		timerDuration = isPickOrSpin ? 30 : getDuration(form.id);

		gameState.update(s => ({
			...s,
			spinning: false,
			locked: !isPickOrSpin,
			isPickOrSpin,
			spinCount: s.spinCount + 1,
			usedStoryIndices: [...s.usedStoryIndices, storyIdx],
			usedFormIds: isPickOrSpin ? s.usedFormIds : [...s.usedFormIds, form.id],
			currentStoryIndex: storyIdx,
			currentFormIndex: formIdx >= 0 ? formIdx : 0
		}));
	}

	function handleSpinAgain() {
		gameState.update(s => ({
			...s,
			locked: false,
			isPickOrSpin: false
		}));
		handleSpin();
	}

	function handleReset() {
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
			currentForm = state.isPickOrSpin ? PICK_OR_SPIN : formItem?.form || null;
			timerDuration = currentForm ? getDuration(currentForm.id) : 30;
		}
	});
</script>

<RopeLights spinning={$isSpinning} />

<div class="content">
	<header class="header">
		<h1 class="title">🎰 FlamIt</h1>
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
			disabled={$isLocked && !$gameState.isPickOrSpin}
			onClick={handleSpin}
		/>
	</div>

	<ResultPanel
		story={currentStory}
		form={currentForm}
		isPickOrSpin={$gameState.isPickOrSpin}
		onSpinAgain={handleSpinAgain}
	/>

	{#if currentForm && !$gameState.isPickOrSpin && $isLocked}
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
		padding-top: var(--space-4);
	}

	.header {
		text-align: center;
	}

	.title {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
		margin-bottom: var(--space-1);
	}

	.subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.reels-row {
		display: flex;
		gap: var(--space-3);
	}

	.spin-area {
		display: flex;
		justify-content: center;
		padding: var(--space-2) 0;
	}

	.footer-actions {
		display: flex;
		justify-content: center;
		padding: var(--space-2) 0;
		margin-top: auto;
	}

	.reset-btn {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-decoration: underline;
		text-underline-offset: 2px;
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--space-2);
		transition: color var(--transition-fast);
	}

	.reset-btn:hover {
		color: var(--color-text-secondary);
	}
</style>
