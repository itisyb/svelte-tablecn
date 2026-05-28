// Maps between UI filter operators (client) and tablecn SQL operators (Drizzle).
// See: https://github.com/sadmann7/tablecn/blob/main/src/lib/filter-columns.ts

import type { FilterOperator } from '$lib/types/data-grid.js';

/** Operators used by tablecn / Drizzle filter-columns.ts */
export type SqlFilterOperator =
	| 'iLike'
	| 'notILike'
	| 'eq'
	| 'ne'
	| 'inArray'
	| 'notInArray'
	| 'lt'
	| 'lte'
	| 'gt'
	| 'gte'
	| 'isBetween'
	| 'isRelativeToToday'
	| 'isEmpty'
	| 'isNotEmpty';

const UI_TO_SQL: Partial<Record<FilterOperator, SqlFilterOperator>> = {
	contains: 'iLike',
	notContains: 'notILike',
	equals: 'eq',
	notEquals: 'ne',
	is: 'eq',
	isNot: 'ne',
	isAnyOf: 'inArray',
	isNoneOf: 'notInArray',
	lessThan: 'lt',
	lessThanOrEqual: 'lte',
	greaterThan: 'gt',
	greaterThanOrEqual: 'gte',
	before: 'lt',
	after: 'gt',
	onOrBefore: 'lte',
	onOrAfter: 'gte',
	isBetween: 'isBetween',
	isRelativeToToday: 'isRelativeToToday',
	isEmpty: 'isEmpty',
	isNotEmpty: 'isNotEmpty',
	isTrue: 'eq',
	isFalse: 'ne'
};

const SQL_TO_UI: Partial<Record<SqlFilterOperator, FilterOperator>> = {
	iLike: 'contains',
	notILike: 'notContains',
	eq: 'equals',
	ne: 'notEquals',
	inArray: 'isAnyOf',
	notInArray: 'isNoneOf',
	lt: 'lessThan',
	lte: 'lessThanOrEqual',
	gt: 'greaterThan',
	gte: 'greaterThanOrEqual',
	isBetween: 'isBetween',
	isRelativeToToday: 'isRelativeToToday',
	isEmpty: 'isEmpty',
	isNotEmpty: 'isNotEmpty'
};

export function toSqlFilterOperator(operator: FilterOperator): SqlFilterOperator | undefined {
	return UI_TO_SQL[operator];
}

export function fromSqlFilterOperator(operator: SqlFilterOperator): FilterOperator | undefined {
	return SQL_TO_UI[operator];
}
