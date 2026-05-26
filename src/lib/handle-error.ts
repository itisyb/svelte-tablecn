const UNKNOWN_ERROR = 'Something went wrong, please try again later.';

interface ZodLikeIssue {
	message?: unknown;
}

interface ZodLikeError {
	issues?: unknown;
}

interface NextRedirectLikeError {
	digest?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function getZodLikeIssues(err: unknown): ZodLikeIssue[] | null {
	if (!isRecord(err)) {
		return null;
	}

	const issues = (err as ZodLikeError).issues;
	if (!Array.isArray(issues)) {
		return null;
	}

	const messages = issues.filter((issue): issue is ZodLikeIssue => {
		return isRecord(issue) && typeof issue.message === 'string';
	});

	return messages.length === issues.length ? messages : null;
}

function isNextRedirectLikeError(err: unknown): err is NextRedirectLikeError {
	return isRecord(err) && typeof err.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT');
}

export function getErrorMessage(err: unknown): string {
	const zodLikeIssues = getZodLikeIssues(err);
	if (zodLikeIssues) {
		return zodLikeIssues.map((issue) => issue.message).join('\n');
	}

	if (err instanceof Error) {
		return err.message;
	}

	if (isNextRedirectLikeError(err)) {
		throw err;
	}

	return UNKNOWN_ERROR;
}
