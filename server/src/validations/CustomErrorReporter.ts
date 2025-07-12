import type { ZodError } from "zod";

interface ZodErrorKeyValue {
	[key: string]: string;
}

interface ZodErrorClassInterface {
	errors: ZodErrorKeyValue;
	hasErrors: boolean;
	createError: () => ZodErrorKeyValue;
}

export class ZodCustomErrorReporter implements ZodErrorClassInterface {
	errors: ZodErrorKeyValue = {};
	hasErrors = false;

	constructor(error: ZodError) {
		this.hasErrors = true;

		for (const issue of error.issues) {
			const field = issue.path.join(".") || "form";
			this.errors[field] = issue.message;
		}
	}

	createError() {
		return this.errors;
	}
}
