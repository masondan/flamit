<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/authStore.js';
	import '$lib/styles/global.css';

	// Routes that don't require authentication
	const PUBLIC_ROUTES = ['/splash', '/admin', '/stories'];

	onMount(() => {
		authStore.init();

		const currentPath = get(page).url.pathname;
		const isPublic = PUBLIC_ROUTES.some(r => currentPath.startsWith(r));

		if (!isPublic) {
			const { courseId } = get(authStore);
			if (!courseId) {
				goto('/splash');
			}
		}
	});
</script>

<div class="app">
	<slot />
</div>
