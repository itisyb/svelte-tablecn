import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

async function waitFor<T>(callback: () => T | undefined | null, timeout = 5_000): Promise<T> {
	const startedAt = Date.now();

	while (Date.now() - startedAt < timeout) {
		const result = callback();
		if (result) return result;
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	throw new Error('Timed out waiting for condition');
}

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

	it('should keep select cell editor inside the cell box', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));
		grid.scrollLeft = 1190;
		await new Promise((resolve) => setTimeout(resolve, 100));

		const departmentCell = await waitFor(() => {
			const row = document.querySelector('[data-slot="grid-row"][data-index="0"]');
			return row?.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(7);
		});
		const wrapper = await waitFor(() =>
			departmentCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		wrapper.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));

		const trigger = await waitFor(() =>
			departmentCell.querySelector<HTMLElement>('[data-slot="select-trigger"]')
		);
		const content = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="select-content"]')
		);
		const { wrapperRect, triggerRect, contentRect } = await waitFor(() => {
			const wrapperRect = wrapper.getBoundingClientRect();
			const triggerRect = trigger.getBoundingClientRect();
			const contentRect = content.getBoundingClientRect();
			const isPlaced = Math.abs(contentRect.width - wrapperRect.width) <= 2;

			return isPlaced ? { wrapperRect, triggerRect, contentRect } : null;
		});

		expect(triggerRect.top).toBeGreaterThanOrEqual(wrapperRect.top);
		expect(triggerRect.bottom).toBeLessThanOrEqual(wrapperRect.bottom);
		expect(contentRect.top).toBeGreaterThanOrEqual(wrapperRect.bottom);
		expect(Math.round(contentRect.left)).toBe(Math.round(wrapperRect.left));
		expect(Math.abs(contentRect.width - wrapperRect.width)).toBeLessThanOrEqual(2);
	});
});
