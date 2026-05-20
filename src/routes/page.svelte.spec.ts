import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		await render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toHaveTextContent('svelte-tablecn');
	});

	it('should render data grid after switching to grid demo', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = page.getByRole('grid', { name: 'Data grid' });
		await expect.element(grid).toBeInTheDocument();
	});
});
