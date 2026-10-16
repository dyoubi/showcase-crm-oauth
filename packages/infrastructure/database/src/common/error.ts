const DATA_VALIDATION = 'ORM_DATA_VALIDATION';
const MISSING_ENTITY = 'ORM_MISSING_ENTITY';
const CONNECTION = 'ORM_CONNECTION';
const QUERY = 'ORM_QUERY';

export class Exception extends Error {
	constructor(
		message: string,
		public code: string,
		public original?: Error,
		options?: ErrorOptions,
	) {
		super(message);
	}
}

export class DataValidationException extends Exception {
	constructor(message: string, original?: Error,) {
		super(message, DATA_VALIDATION, original);
	}
}

export class QueryException extends Exception {
	constructor(message: string, original?: Error,) {
		super(message, QUERY, original);
	}
}

export class MissingEntityException extends Exception {
	constructor(message: string, original?: Error,) {
		super(message, MISSING_ENTITY, original);
	}
}

export class ConnectionException extends Exception {
	constructor(message: string, original?: Error,) {
		super(message, CONNECTION, original);
	}
}