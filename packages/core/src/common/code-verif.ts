import { BufferSource } from "stream/web";

const encoder = new TextEncoder();

// constant-time compare
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let res = 0;
	for (let i = 0; i < a.length; i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return res === 0;
}

// HMAC-SHA256 (WebCrypto)
async function hmacSha256(key: BufferSource, data: BufferSource): Promise<Uint8Array> {
	const cryptoKey = await crypto.subtle.importKey(
		"raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
	);
	const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
	return new Uint8Array(sig);
}

// 10^n sans flottants
function pow10(n: number): number {
	let x = 1;
	for (let i = 0; i < n; i++) x *= 10;
	return x;
}

// borne raisonnable (1..10) pour éviter des codes trop longs
function normalizeDigits(digits?: number): number {
	if (!Number.isInteger(digits)) return 6;
	return Math.min(10, Math.max(1, digits as number));
}

export namespace CodeVerification {
	export async function derive(
		secret: BufferSource,
		digits: number,
		...keyspace: string[]
	): Promise<string> {
		const d = normalizeDigits(digits);
		const material = encoder.encode(keyspace.map(v => v.trim()).join("."));
		const mac = await hmacSha256(secret, material);

		const offset = mac[mac.length - 1] & 0x0f;
		const bin =
			((mac[offset] & 0x7f) << 24) |
			(mac[offset + 1] << 16) |
			(mac[offset + 2] << 8) |
			mac[offset + 3];

		const mod = pow10(d);
		return (bin % mod).toString().padStart(d, "0");
	}

	export async function verify(
		code: string,
		secret: ArrayBuffer,
		digits: number,
		...keyspace: string[]
	): Promise<boolean> {
		const d = normalizeDigits(digits);
		if (!new RegExp(`^\\d{${d}}$`).test(code)) return false;
		const expected = await derive(secret, d, ...keyspace);
		return timingSafeEqual(code, expected);
	}
}
