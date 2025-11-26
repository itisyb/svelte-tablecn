<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import Laptop from '@lucide/svelte/icons/laptop';

	type Theme = 'light' | 'dark' | 'system';
	let theme = $state<Theme>('system');

	// Initialize theme from localStorage or system preference
	$effect(() => {
		if (typeof window === 'undefined') return;
		
		const stored = localStorage.getItem('theme') as Theme | null;
		if (stored) {
			theme = stored;
		}
		
		applyTheme(theme);
	});

	function applyTheme(newTheme: Theme) {
		if (typeof window === 'undefined') return;
		
		const root = document.documentElement;
		
		if (newTheme === 'system') {
			const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			root.classList.toggle('dark', systemPrefersDark);
		} else {
			root.classList.toggle('dark', newTheme === 'dark');
		}
	}

	function setTheme(newTheme: Theme) {
		theme = newTheme;
		localStorage.setItem('theme', newTheme);
		applyTheme(newTheme);
	}
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="size-8">
				<Sun class="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon class="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/snippet}
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuItem onclick={() => setTheme('light')}>
			<Sun class="mr-2 size-4" />
			<span>Light</span>
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => setTheme('dark')}>
			<Moon class="mr-2 size-4" />
			<span>Dark</span>
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => setTheme('system')}>
			<Laptop class="mr-2 size-4" />
			<span>System</span>
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
