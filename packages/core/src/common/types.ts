

export type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type Primitive =
	| string
	| boolean
	| number | bigint
	| Date
	| null;

export type JSONType = Primitive | JSONObject | JSONArray;
export type JSONArray = Array<Primitive | JSONObject> | Array<Primitive> | Array<JSONObject>;
export type JSONObject = { [key: string]: JSONType; };

export type ValueOrPromise<T> = Promise<T> | T;

export type Identifier = { username: string; } | { email: string; };
export type PasswordCredential = Identifier & { password: string; };

export class IEvent<T = any, K extends string = string> {
	readonly type: K;
	data: T;
	timestamp: Date = new Date();

	constructor(type: K, data: T) {
		this.type = type;
		this.data = data;
	}
}

export type Relation<T, F extends string> = { [k in F]: T; };