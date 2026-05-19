# Advanced filters (tablecn parity)

This document maps [sadmann7/tablecn](https://github.com/sadmann7/tablecn) filtering patterns to **svelte-tablecn**.

## Three filter modes

| Mode | tablecn | svelte-tablecn | URL state |
|------|---------|----------------|-----------|
| **Basic toolbar** | `DataTableToolbar` + per-column `nuqs` params | `DataTableToolbar` + column keys in query string | `?status=Active&department=Sales` |
| **Advanced list** | `filterFlag=advancedFilters` + `DataTableFilterList` | `advancedFilterUi="advancedFilters"` | `?filters=…&joinOperator=and` |
| **Command menu** | `filterFlag=commandFilters` + `DataTableFilterMenu` | `advancedFilterUi="commandFilters"` | same as advanced list |

Enable advanced URL sync with `enableAdvancedFilter: true` on `useDataTable`.

## Client vs server filtering

### Client-side (demo)

When `enableAdvancedFilter` is true and `manualFiltering` is false (default in the showcase), `useDataTable` applies [`filterRows`](../src/lib/filter-rows.ts) before rows reach TanStack Table. That supports:

- Multiple rules on the same column (`filterId`)
- Full operator set (`contains`, `between`, `isAnyOf`, …)
- `joinOperator`: `and` | `or`

### Server-side (production, like tablecn)

tablecn always uses `manualPagination`, `manualSorting`, and `manualFiltering: true`. The server reads serialized filters from the URL and builds SQL with [`filter-columns.ts`](https://github.com/sadmann7/tablecn/blob/main/src/lib/filter-columns.ts).

In svelte-tablecn:

1. Set `manualFiltering: true` (and usually `manualPagination` / `manualSorting`).
2. Pass only the current page of rows into `data`.
3. On the server, parse `filters` + `joinOperator` from the query string (see `getFiltersStateParser`).
4. Map UI operators to SQL with [`map-sql-filter-operators.ts`](../src/lib/map-sql-filter-operators.ts), then implement Drizzle conditions (port `filter-columns.ts` or equivalent).

Example operator mapping:

| UI (client) | SQL (tablecn / Drizzle) |
|-------------|-------------------------|
| `contains` | `iLike` |
| `isAnyOf` | `inArray` |
| `between` | `isBetween` |
| `lessThan` | `lt` |

## Feature flag pattern (tablecn)

tablecn stores `filterFlag` in the URL and derives:

```ts
enableAdvancedFilter =
  filterFlag === 'advancedFilters' || filterFlag === 'commandFilters';
```

The demo on the home page mirrors this with **Filter list** / **Filter menu** toggles when **Advanced Table** is selected.

## Related files

| Purpose | Path |
|---------|------|
| Table hook + URL sync | `src/lib/hooks/use-data-table.svelte.ts` |
| In-memory filter engine | `src/lib/filter-rows.ts` |
| SQL operator mapping | `src/lib/map-sql-filter-operators.ts` |
| Filter list UI | `src/lib/components/data-table/data-table-filter-list.svelte` |
| Filter menu UI | `src/lib/components/data-table/data-table-filter-menu.svelte` |
| Grid filters (10k rows) | `src/lib/components/data-grid/data-grid-filter-menu.svelte` |
| Demo | `src/routes/data-table-showcase.svelte` |
