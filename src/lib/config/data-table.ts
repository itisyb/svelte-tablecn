export const DATA_TABLE_FILTER_VARIANTS = [
	'text',
	'number',
	'range',
	'date',
	'dateRange',
	'boolean',
	'select',
	'multiSelect'
] as const;

export const DATA_TABLE_JOIN_OPERATORS = ['and', 'or'] as const;

export const DATA_TABLE_TEXT_OPERATORS = [
	{ label: 'Contains', value: 'contains' },
	{ label: 'Does not contain', value: 'notContains' },
	{ label: 'Equals', value: 'equals' },
	{ label: 'Does not equal', value: 'notEquals' },
	{ label: 'Starts with', value: 'startsWith' },
	{ label: 'Ends with', value: 'endsWith' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_NUMERIC_OPERATORS = [
	{ label: 'Equals', value: 'equals' },
	{ label: 'Does not equal', value: 'notEquals' },
	{ label: 'Less than', value: 'lessThan' },
	{ label: 'Less than or equal', value: 'lessThanOrEqual' },
	{ label: 'Greater than', value: 'greaterThan' },
	{ label: 'Greater than or equal', value: 'greaterThanOrEqual' },
	{ label: 'Between', value: 'isBetween' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_DATE_OPERATORS = [
	{ label: 'Equals', value: 'equals' },
	{ label: 'Does not equal', value: 'notEquals' },
	{ label: 'Before', value: 'before' },
	{ label: 'After', value: 'after' },
	{ label: 'Between', value: 'isBetween' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_SELECT_OPERATORS = [
	{ label: 'Is', value: 'is' },
	{ label: 'Is not', value: 'isNot' },
	{ label: 'Is any of', value: 'isAnyOf' },
	{ label: 'Is none of', value: 'isNoneOf' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_BOOLEAN_OPERATORS = [
	{ label: 'Is true', value: 'isTrue' },
	{ label: 'Is false', value: 'isFalse' }
] as const;

export const DATA_TABLE_SORT_ORDERS = [
	{ label: 'Asc', value: 'asc' },
	{ label: 'Desc', value: 'desc' }
] as const;

export const DEFAULT_DATA_TABLE_QUERY_KEYS = {
	page: 'page',
	perPage: 'perPage',
	sort: 'sort',
	filters: 'filters',
	joinOperator: 'joinOperator'
} as const;

export const DATA_TABLE_DEFAULTS = {
	debounceMs: 300,
	throttleMs: 50,
	pageSize: 10
} as const;

export const dataTableConfig = {
	filterVariants: DATA_TABLE_FILTER_VARIANTS,
	joinOperators: DATA_TABLE_JOIN_OPERATORS,
	textOperators: DATA_TABLE_TEXT_OPERATORS,
	numericOperators: DATA_TABLE_NUMERIC_OPERATORS,
	dateOperators: DATA_TABLE_DATE_OPERATORS,
	selectOperators: DATA_TABLE_SELECT_OPERATORS,
	multiSelectOperators: DATA_TABLE_SELECT_OPERATORS,
	booleanOperators: DATA_TABLE_BOOLEAN_OPERATORS,
	sortOrders: DATA_TABLE_SORT_ORDERS,
	operators: [
		...new Set(
			[
				...DATA_TABLE_TEXT_OPERATORS,
				...DATA_TABLE_NUMERIC_OPERATORS,
				...DATA_TABLE_DATE_OPERATORS,
				...DATA_TABLE_SELECT_OPERATORS,
				...DATA_TABLE_BOOLEAN_OPERATORS
			].map((operator) => operator.value)
		)
	]
} as const;
