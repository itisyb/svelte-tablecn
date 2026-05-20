import type { Direction } from '$lib/types/data-grid.js';

export const GRID_DIR_CONTEXT_KEY = 'grid-dir';

export type GridDirGetter = () => Direction;
