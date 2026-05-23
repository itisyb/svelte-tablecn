import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import DataGridCustomCellFixture from './data-grid-custom-cell-fixture.svelte';

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

	it('should use transform-based virtual row layout by default', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const body = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-body"]')
		);

		const rowStyles = getComputedStyle(row);
		const bodyStyles = getComputedStyle(body);

		expect(row.style.transform).toContain('translateY');
		expect(rowStyles.contentVisibility).toBe('auto');
		expect(bodyStyles.contain).toBe('strict');
	});

	it('should align select cell editor like the original grid', async () => {
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
			const isPlaced = contentRect.width > 0 && contentRect.height > 0;

			return isPlaced ? { wrapperRect, triggerRect, contentRect } : null;
		});

		expect(triggerRect.top).toBeGreaterThanOrEqual(wrapperRect.top);
		expect(triggerRect.bottom).toBeLessThanOrEqual(wrapperRect.bottom);
		expect(Math.round(contentRect.left)).toBe(Math.round(wrapperRect.left));
		expect(Math.round(contentRect.top)).toBeLessThan(Math.round(wrapperRect.bottom));

		const contentStyle = getComputedStyle(content);
		expect(Math.round(Number.parseFloat(contentStyle.width))).toBe(Math.round(wrapperRect.width));

		const contentRadius = Number.parseFloat(contentStyle.borderTopLeftRadius);
		expect(contentRadius).toBeLessThanOrEqual(4);

		let bubbledToGrid = false;
		const onGridKeyDown = () => {
			bubbledToGrid = true;
		};
		grid.addEventListener('keydown', onGridKeyDown);

		const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
		trigger.dispatchEvent(tabEvent);
		grid.removeEventListener('keydown', onGridKeyDown);

		expect(tabEvent.defaultPrevented).toBe(true);
		expect(bubbledToGrid).toBe(false);
		await waitFor(() => document.querySelector<HTMLElement>('[data-slot="select-content"]') === null);
	});

	it('should keep the first typed character when opening long text editor', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));

		const notesCell = await waitFor(() => {
			const row = document.querySelector('[data-slot="grid-row"][data-index="0"]');
			return row?.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(5);
		});
		const wrapper = await waitFor(() =>
			notesCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);
		const initialText = wrapper.textContent ?? '';

		wrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		wrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		wrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		await waitFor(() => wrapper.dataset.focused !== undefined);
		wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true, cancelable: true }));

		const textarea = await waitFor(() => document.querySelector<HTMLTextAreaElement>('textarea'));
		await waitFor(() => textarea.value === `${initialText}z`);

		expect(textarea.value).toBe(`${initialText}z`);
	});

	it('should select the pasted range after clipboard paste', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));

		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				readText: async () => 'Pasted Name\t44'
			}
		});

		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const nameCell = row.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(1);
		const ageCell = row.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(2);
		const nameWrapper = await waitFor(() =>
			nameCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		nameWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true })
		);

		await waitFor(() => nameWrapper.textContent?.trim() === 'Pasted Name');
		const ageWrapper = await waitFor(() =>
			ageCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"][data-selected]')
		);

		expect(ageWrapper.textContent?.trim()).toBe('44');
	});

	it('should close and reset the paste expansion dialog when cancelled', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));

		const oversizedPaste = Array.from({ length: 205 }, (_, index) => `Person ${index}`).join('\n');
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				readText: async () => oversizedPaste
			}
		});

		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const nameCell = row.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(1);
		const nameWrapper = await waitFor(() =>
			nameCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		nameWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true })
		);

		const dialog = await waitFor(() => document.querySelector<HTMLElement>('[role="dialog"]'));
		expect(dialog.textContent).toContain('5');

		await page.getByRole('button', { name: 'Cancel' }).click();
		await waitFor(() => document.querySelector<HTMLElement>('[role="dialog"]') === null);
	});

	it('should render custom data grid cell renderers directly', async () => {
		await render(DataGridCustomCellFixture);

		const cell = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid-cell"]'));

		expect(cell.textContent?.trim()).toBe('Custom Ada');
		expect(cell.querySelector('[data-slot="grid-cell-wrapper"]')).toBeNull();
	});
});
