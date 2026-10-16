import { BinaryLike, createHash, randomInt } from "crypto";
const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export function RandomAlphaNumID(
	length: number,
	alphabet: string = DEFAULT_ALPHABET
) {
	let result = '';
	const charactersLength = alphabet.length;
	for (let index = 0; index < length; index++) {
		result += alphabet[randomInt(charactersLength - 1)];
	}
	return result.trim();
}

export function HashID(value: BinaryLike) {
	return createHash("sha256")
		.update(value)
		.digest('base64')
		.replace(/\+/g, '')
		.replace(/\//g, '')
		.replace(/=/g, '');
}

export function base64url(buf: ArrayBuffer | Buffer): string {
	const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
	return b.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function sha256b64u(s: string) { return base64url(createHash("sha256").update(s, "utf8").digest()); };

/** Nettoie récursivement: enlève undefined, vide les clés vides, garde null si présent explicitement */
export function cleanUndefinedDeep<T>(v: T): T {
	if (Array.isArray(v)) {
		return v.map(cleanUndefinedDeep).filter(x => x !== undefined) as any;
	}
	if (v && typeof v === "object") {
		const out: Record<string, unknown> = {};
		for (const k of Object.keys(v as any)) {
			const val = (v as any)[k];
			if (val === undefined) continue;
			const cleaned = cleanUndefinedDeep(val);
			if (cleaned !== undefined) out[k] = cleaned;
		}
		return out as any;
	}
	return v;
}

/** Tri stable des clés d'objet (récursif) pour une représentation canonique */
export function sortKeysDeep<T>(v: T): T {
	if (Array.isArray(v)) {
		// ne pas trier ici: l'ordre est géré par les fonctions de coercition
		return v.map(sortKeysDeep) as any;
	}
	if (v && typeof v === "object") {
		const out: Record<string, unknown> = {};
		for (const k of Object.keys(v as any).sort()) {
			out[k] = sortKeysDeep((v as any)[k]);
		}
		return out as any;
	}
	return v;
}
export function canonicalStringify(v: unknown): string {
	const cleaned = cleanUndefinedDeep(v);
	const sorted = sortKeysDeep(cleaned);
	return JSON.stringify(sorted);
}

export namespace utils {
	// pick
	export function pick<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;
	export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
	export function pick<T extends object, K extends keyof T>(obj: T, ...rest: any[]): Pick<T, K> {
		const keys: K[] = Array.isArray(rest[0]) ? rest[0] : rest;
		const ret = {} as Pick<T, K>;
		keys.forEach(key => { ret[key] = obj[key]; });
		return ret;
	}

	export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K>;
	export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
	export function omit<T extends object, K extends keyof T>(obj: T, ...rest: any[]): Omit<T, K> {
		const keys: K[] = Array.isArray(rest[0]) ? rest[0] : rest;
		const ret: any = {} as Omit<T, K>;
		(Object.keys(obj) as (keyof T)[])
			.filter((k) => !keys.includes(k as K))
			.forEach((k) => {
				ret[k] = obj[k];
			});
		return ret as Omit<T, K>;
	}
}

export function seconds(date?: Date | string | number) {
	if (date) { return typeof date === 'object' ? date.getTime() : new Date(date).getTime(); }
	return seconds.now();
}
export namespace seconds {
	export function now(): number { return Math.ceil(Date.now() / 1000); }
	export function date(sec: number): Date { return new Date(sec * 1000); }
}

export function octets(value: unknown) {
	let len: number = 0;
	switch (typeof value) {
		case 'function':
		case 'symbol':
			throw new TypeError(`invalid input type ${typeof value}`);
		case 'boolean':
			len = 1;
			break;
		case 'object':
			len = (new TextEncoder().encode(JSON.stringify(value))).length;
			break;
		case 'number':
		case 'bigint':
		case 'string':
			const encoder = new TextEncoder();
			len = encoder.encode(String(value)).length;
			break;
		case 'undefined':
			len = 0;
			break;
	}

	return len;
}