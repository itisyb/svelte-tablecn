<script lang="ts">
	import { Toaster as Sonner, type ToasterProps } from 'svelte-sonner';
	import { cn } from '$lib/utils.js';

	type $$Props = ToasterProps;

	let {
		class: className,
		style,
		theme = 'system',
		toastOptions,
		...restProps
	}: ToasterProps = $props();

	const toasterStyle = $derived(
		`--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border); ${style ?? ''}`
	);
	const toastClasses = $derived({
		...toastOptions?.classes,
		toast: cn(
			'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
			toastOptions?.classes?.toast
		),
		description: cn('group-[.toast]:text-muted-foreground', toastOptions?.classes?.description),
		actionButton: cn(
			'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
			toastOptions?.classes?.actionButton
		),
		cancelButton: cn(
			'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
			toastOptions?.classes?.cancelButton
		)
	});
</script>

<Sonner
	{theme}
	class={cn('toaster group', className)}
	style={toasterStyle}
	toastOptions={{
		...toastOptions,
		classes: {
			...toastClasses
		}
	}}
	{...restProps}
/>
