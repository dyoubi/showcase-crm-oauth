import { webcrypto, createHash, JsonWebKey } from 'node:crypto';
import type { JWTPayload, ProtectedHeaderParameters } from 'jose';

import { base64url } from './utils';

export enum EJwtSignAlg {
	RS256 = 'RS256',
	RS384 = 'RS384',
	RS512 = 'RS512',
	PS256 = 'PS256',
	PS384 = 'PS384',
	PS512 = 'PS512',
	ES256 = 'ES256',
	ES384 = 'ES384',
	ES512 = 'ES512',
}
export type JwtSignAlg = `${EJwtSignAlg}` | EJwtSignAlg;
export type JweAlg =
	| 'RSA-OAEP-256'
	| 'ECDH-ES+A128KW'
	| 'ECDH-ES+A192KW'
	| 'ECDH-ES+A256KW';
export type JweEncAlg =
	| 'A128GCM'
	| 'A192GCM'
	| 'A256GCM'
	| 'A128CBC-HS256'
	| 'A192CBC-HS384'
	| 'A256CBC-HS512';

export enum EJwkUse {
	SIG = 'sig',
	ENC = 'enc',
}
export type JwkUse = `sig` | 'enc';

export enum EKty {
	RSA = 'RSA',
	EC = 'EC',
	OKP = 'OKP',
}
export type Kty = `${EKty}` | EKty;
export interface JsonWebKeyOptions {
	alg?: JwtSignAlg;
	sig?: boolean;
	use?: JwkUse;
	kid_namespace: string[];
	modulus?: number;
}

export interface JWTUsage {
	not_before?: number;
	expires_at?: number;
	first_usage_at?: Date;
	last_usage_at?: number;
	[p: string]: unknown;
}

export interface JsonWebKeyPair {
	kid: string;
	kty: Kty;
	use?: JwkUse;
	alg: JwtSignAlg | JweEncAlg;
	pub: JsonWebKey;
	priv: JsonWebKey;
	thumbprint: string;
}

export interface JsonWebKeySigKeyPair extends JsonWebKeyPair { use: 'sig'; }
export interface JsonWebKeyEncKeyPair extends JsonWebKeyPair { use: 'enc'; }

export type JWKSet<Alg extends JwtSignAlg> = { [Use in JwkUse]: JsonWebKeyPair & { use: Use; alg: Alg; } & JWTUsage };
export type JsonWebKeyPairRing = { [Alg in JwtSignAlg]: JWKSet<Alg>[] | undefined; };

export interface IJsonWebKeyProvider {
	generate(p: JsonWebKeyOptions): Promise<JsonWebKeyPair>;
}

export type JWKS = (JsonWebKey & { kid: string; });
export type PublicJWKSItem = JsonWebKey & { kid: string; alg?: string; use?: JwkUse; };

export type JwtClaims = JWTPayload & Record<string, unknown>;
export type JwtHeader = ProtectedHeaderParameters & Record<string, unknown>;

/**
 * RFC 7638: ordre des champs dépend de kty
 * @param jwk
 * @returns 
 */
export function JwkThumbprint(jwk: JsonWebKey): string {
	let json = '';
	if (jwk.kty === 'RSA') {
		if (!jwk.e || !jwk.n) throw new TypeError('Invalid RSA JWK: missing e/n');
		json = `{"e":"${jwk.e}","kty":"RSA","n":"${jwk.n}"}`;
	} else if (jwk.kty === 'EC') {
		if (!jwk.crv || !jwk.x || !jwk.y) throw new TypeError('Invalid EC JWK: missing crv/x/y');
		json = `{"crv":"${jwk.crv}","kty":"EC","x":"${jwk.x}","y":"${jwk.y}"}`;
	} else if (jwk.kty === 'OKP') {
		if (!jwk.crv || !jwk.x) throw new TypeError('Invalid OKP JWK: missing crv/x');
		json = `{"crv":"${jwk.crv}","kty":"OKP","x":"${jwk.x}"}`;
	} else {
		throw new TypeError(`Unsupported kty for thumbprint: ${jwk.kty}`);
	}
	return base64url(createHash('sha256').update(json).digest());
}

export function sanitizeKidNamespace(namespace: string): string {
	return namespace
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48);
}

function assertValidOptions(p: JsonWebKeyOptions) {
	if (!Array.isArray(p.kid_namespace) || p.kid_namespace.length === 0) {
		throw new Error('`kid_namespace` must be a non-empty string array');
	}
	const cleaned = p.kid_namespace.map(sanitizeKidNamespace).filter(Boolean);
	if (cleaned.length !== p.kid_namespace.length) {
		throw new Error('`kid_namespace` contains empty/invalid parts after sanitization');
	}
	if (p.modulus !== undefined) {
		const ok = [2048, 3072, 4096, 6144, 8192];
		if (!ok.includes(p.modulus)) {
			throw new Error('`modulus` must be one of 2048|3072|4096|6144|8192');
		}
	}
}

function KidNamespace(namespace: string[], alg: string): string {
	const ns = namespace.map(sanitizeKidNamespace).filter(Boolean).join(':');
	const parts = [ns, alg].filter(Boolean);
	return parts.join(':').slice(0, 96);
}

async function kidSuffixFromPublicKey(pub: webcrypto.CryptoKey): Promise<string> {
	const spki = await webcrypto.subtle.exportKey('spki', pub);
	const h = createHash('sha256').update(Buffer.from(spki)).digest();
	return base64url(h).slice(0, 12);
}

async function genSigKeyPair(alg: JwtSignAlg, rsaModulusLength = 2048): Promise<webcrypto.CryptoKeyPair> {
	switch (alg) {
		case 'RS256':
		case 'RS384':
		case 'RS512': {
			const hash = alg === 'RS256' ? 'SHA-256' : alg === 'RS384' ? 'SHA-384' : 'SHA-512';
			return webcrypto.subtle.generateKey(
				{ name: 'RSASSA-PKCS1-v1_5', modulusLength: rsaModulusLength, publicExponent: new Uint8Array([1, 0, 1]), hash },
				true,
				['sign', 'verify']
			);
		}
		case 'PS256':
		case 'PS384':
		case 'PS512': {
			const hash = alg === 'PS256' ? 'SHA-256' : alg === 'PS384' ? 'SHA-384' : 'SHA-512';
			return webcrypto.subtle.generateKey(
				{ name: 'RSA-PSS', modulusLength: rsaModulusLength, publicExponent: new Uint8Array([1, 0, 1]), hash },
				true,
				['sign', 'verify']
			);
		}
		case 'ES256':
			return webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
		case 'ES384':
			return webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-384' }, true, ['sign', 'verify']);
		case 'ES512':
			return webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-521' }, true, ['sign', 'verify']);
		default:
			throw new TypeError(`Unsupported JWS alg: ${alg}`);
	}
}

async function genEncKeyPair(target: JweAlg, rsaModulusLength = 2048): Promise<webcrypto.CryptoKeyPair> {
	switch (target) {
		case 'RSA-OAEP-256':
			return webcrypto.subtle.generateKey(
				{ name: 'RSA-OAEP', modulusLength: rsaModulusLength, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
				true,
				['encrypt', 'decrypt']
			);
		case 'ECDH-ES+A128KW':
		case 'ECDH-ES+A192KW':
		case 'ECDH-ES+A256KW': {
			const crv = target === 'ECDH-ES+A128KW' ? 'P-256' : target === 'ECDH-ES+A192KW' ? 'P-384' : 'P-521';
			return webcrypto.subtle.generateKey(
				{ name: 'ECDH', namedCurve: crv },
				true,
				['deriveBits']
			);
		}
		default:
			throw new TypeError(`Unsupported JWE alg for generation: ${target}`);
	}
}

export function mapJWKS(pair: JsonWebKeyPair): PublicJWKSItem {
	const { pub, kid } = pair;
	const { d, p, q, dp, dq, qi, oth, k, ...safe } = pub as any;
	const jwk: any = { ...safe, kid };
	if (pair.use) jwk.use = pair.use;
	jwk.alg = pub.alg ?? pair.alg;
	return jwk as PublicJWKSItem;
}


export function ensurePrivateJwkHasD(jwk: JsonWebKey) {
	if (!('d' in jwk)) throw new Error('Private JWK is missing key material ("d").');
}

function digestAlgForIdTokenAlg(alg: JwtSignAlg): 'sha256' | 'sha384' | 'sha512' {
	if (alg.endsWith('256')) return 'sha256';
	if (alg.endsWith('384')) return 'sha384';
	return 'sha512';
}

export function HalfHash(value: string, alg: JwtSignAlg): string {
	const dig = digestAlgForIdTokenAlg(alg);
	const full = createHash(dig).update(value, 'utf8').digest();
	const half = full.subarray(0, Math.floor(full.length / 2));
	return base64url(half);
}


export function inferJweHeaderFromJwk(keypairOrPub: JsonWebKeyPair | JsonWebKey): { alg: JweAlg; enc: JweEncAlg; } {
	const jwk = (keypairOrPub as any).pub ? (keypairOrPub as any).pub : (keypairOrPub as JsonWebKey);

	if (jwk.kty === 'RSA') {
		const nB = jwk.n ? Buffer.from(jwk.n, 'base64url') : undefined;
		const nBits = nB ? nB.length * 8 : 2048;
		const enc: JweEncAlg = nBits >= 4096 ? 'A256GCM' : nBits >= 3072 ? 'A192GCM' : 'A128GCM';
		return { alg: 'RSA-OAEP-256', enc };
	}

	if (jwk.kty === 'EC') {
		const crv: string = (jwk as any).crv;
		const enc: JweEncAlg = crv === 'P-521' ? 'A256GCM' : crv === 'P-384' ? 'A192GCM' : 'A128GCM';
		const kw = enc === 'A128GCM' ? 'A128KW' : enc === 'A192GCM' ? 'A192KW' : 'A256KW';
		return { alg: (`ECDH-ES+${kw}` as JweAlg), enc };
	}

	if (jwk.kty === 'OKP' && (jwk as any).crv === 'X25519') {
		return { alg: 'ECDH-ES+A256KW', enc: 'A256GCM' };
	}

	throw new Error('Type de clé non pris en charge pour JWE');
}

function inferJweHeaderFromAlgOrKeyChoice(signAlg: JwtSignAlg): { alg: JweAlg; enc: JweEncAlg; } {
	if (signAlg.startsWith('RS') || signAlg.startsWith('PS')) return { alg: 'RSA-OAEP-256', enc: 'A256GCM' };
	if (signAlg === 'ES256') return { alg: 'ECDH-ES+A128KW', enc: 'A128GCM' };
	if (signAlg === 'ES384') return { alg: 'ECDH-ES+A192KW', enc: 'A192GCM' };
	return { alg: 'ECDH-ES+A256KW', enc: 'A256GCM' };
}


export class JsonWebKeyProvider implements IJsonWebKeyProvider {
	async generate(options: JsonWebKeyOptions): Promise<JsonWebKeyPair> {
		assertValidOptions(options);

		const alg: JwtSignAlg = options.alg ?? 'RS256';
		const use: JwkUse = options.use ?? (options.sig === false ? 'enc' : 'sig');
		const rsaLen = options.modulus ?? 2048;

		const kpair = use === 'sig' ? await genSigKeyPair(alg, rsaLen)
			: await genEncKeyPair(inferJweHeaderFromAlgOrKeyChoice(alg).alg, rsaLen);

		const [pub, priv] = (await Promise.all([
			webcrypto.subtle.exportKey('jwk', kpair.publicKey),
			webcrypto.subtle.exportKey('jwk', kpair.privateKey),
		])) as [JsonWebKey, JsonWebKey];

		const prefix = KidNamespace(options.kid_namespace, use === 'sig' ? alg : inferJweHeaderFromJwk(pub).alg);
		const suffix = await kidSuffixFromPublicKey(kpair.publicKey);
		const kid = `${prefix}:${suffix}`;

		const thumbprint = JwkThumbprint(pub);

		(pub as any).use = use;
		(priv as any).use = use;
		pub.kid = kid;
		if (use === 'sig') {
			(pub as any).alg = alg;
			(priv as any).alg = alg;
			pub.key_ops = ['verify'];
			priv.key_ops = ['sign'];
		} else {
			const jwe = inferJweHeaderFromJwk(pub);
			(pub as any).alg = jwe.alg;
			(pub as any).enc = jwe.enc;
			(priv as any).alg = jwe.alg;
			(priv as any).enc = jwe.enc;
			if (pub.kty === 'RSA') {
				pub.key_ops = ['encrypt'];
				priv.key_ops = ['decrypt'];
			} else if (pub.kty === 'EC' || pub.kty === 'OKP') {
				pub.key_ops = [];
				priv.key_ops = ['deriveBits'];
			}
		}

		const pair: JsonWebKeyPair = { kid, kty: pub.kty as Kty, use, alg, pub, priv, thumbprint };

		return options.use === "sig"
			? pair as JsonWebKeySigKeyPair
			: options.use === "enc"
				? pair as JsonWebKeyEncKeyPair
				: pair;
	}
}

