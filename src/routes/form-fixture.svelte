<script lang="ts">
	import {
		Form,
		FormControl,
		FormDescription,
		FormField,
		FormItem,
		FormLabel,
		FormMessage
	} from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';

	const errors = {
		email: { message: 'Email is required' }
	};
</script>

<Form {errors}>
	<FormField name="email">
		<FormItem id="email-field">
			<FormLabel>Email</FormLabel>
			<FormControl>
				{#snippet children(controlProps)}
					<Input {...controlProps} value="" placeholder="Email" />
				{/snippet}
			</FormControl>
			<FormDescription>Used for account updates.</FormDescription>
			<FormMessage />
		</FormItem>
	</FormField>
</Form>
