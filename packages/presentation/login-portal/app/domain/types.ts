import EventEmitter from "events";

export type Primitive = string | number | boolean;
export type JSONArray = JSONObject[] | Primitive[];
export type JSONObject = { [k: string]: Primitive | Primitive[] | JSONObject | JSONArray; };

export type Listener = () => void;

export function get(obj: JSONObject, path: string): unknown {
	return path.split(".").reduce<unknown>((acc, key) => {
		if (acc && typeof acc === "object") {
			const v = (acc as Record<string, unknown>)[key];
			return v;
		}
		return undefined;
	}, obj);
}

// --- Interpolation simple: "Hello {name}" ---
export function interpolate(input: string, vars?: Record<string, string | number>) {
	if (!vars) return input;
	return input.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export class Store<T extends JSONObject = JSONObject> {
	private target = new EventTarget();
	private readonly evt = 'update';
	private $state: T = {} as T;

	// ✅ snapshots en flèche (pas de souci de this)
	getState = (): T => this.$state;

	setState = (patch: Partial<T>) => {
		this.$state = Object.assign({}, this.$state, patch);
		this.target.dispatchEvent(new Event(this.evt));
	};

	subscribe = (cb: Listener) => {
		const handler = () => cb();
		this.target.addEventListener(this.evt, handler);
		return () => this.target.removeEventListener(this.evt, handler);
	};
}
