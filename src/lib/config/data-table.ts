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
	{ label: 'Is', value: 'equals' },
	{ label: 'Is not', value: 'notEquals' },
	{ label: 'Starts with', value: 'startsWith' },
	{ label: 'Ends with', value: 'endsWith' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_NUMERIC_OPERATORS = [
	{ label: 'Is', value: 'equals' },
	{ label: 'Is not', value: 'notEquals' },
	{ label: 'Is less than', value: 'lessThan' },
	{ label: 'Is less than or equal to', value: 'lessThanOrEqual' },
	{ label: 'Is greater than', value: 'greaterThan' },
	{ label: 'Is greater than or equal to', value: 'greaterThanOrEqual' },
	{ label: 'Is between', value: 'isBetween' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_DATE_OPERATORS = [
	{ label: 'Is', value: 'equals' },
	{ label: 'Is not', value: 'notEquals' },
	{ label: 'Is before', value: 'before' },
	{ label: 'Is after', value: 'after' },
	{ label: 'Is on or before', value: 'onOrBefore' },
	{ label: 'Is on or after', value: 'onOrAfter' },
	{ label: 'Is between', value: 'isBetween' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_SELECT_OPERATORS = [
	{ label: 'Is', value: 'is' },
	{ label: 'Is not', value: 'isNot' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_MULTI_SELECT_OPERATORS = [
	{ label: 'Has any of', value: 'isAnyOf' },
	{ label: 'Has none of', value: 'isNoneOf' },
	{ label: 'Is empty', value: 'isEmpty' },
	{ label: 'Is not empty', value: 'isNotEmpty' }
] as const;

export const DATA_TABLE_BOOLEAN_OPERATORS = [
	{ label: 'Is', value: 'isTrue' },
	{ label: 'Is not', value: 'isFalse' }
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
	multiSelectOperators: DATA_TABLE_MULTI_SELECT_OPERATORS,
	booleanOperators: DATA_TABLE_BOOLEAN_OPERATORS,
	sortOrders: DATA_TABLE_SORT_ORDERS,
	operators: [
		...new Set(
			[
				...DATA_TABLE_TEXT_OPERATORS,
				...DATA_TABLE_NUMERIC_OPERATORS,
				...DATA_TABLE_DATE_OPERATORS,
				...DATA_TABLE_SELECT_OPERATORS,
				...DATA_TABLE_MULTI_SELECT_OPERATORS,
				...DATA_TABLE_BOOLEAN_OPERATORS
			].map((operator) => operator.value)
		)
	]
} as const;
