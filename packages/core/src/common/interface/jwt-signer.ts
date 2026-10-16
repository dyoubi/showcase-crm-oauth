import { randomBytes } from 'crypto';
import { SignJWT, importJWK, errors as joseErrors, JWTPayload, EncryptJWT } from 'jose';
import { JwtClaims, JsonWebKeyPair, ensurePrivateJwkHasD, inferJweHeaderFromJwk } from '../json-web-token';
import { base64url } from '../utils';

export interface IJwtSigner {
	sign(claims: JwtClaims, keypair: JsonWebKeyPair): Promise<string>;
	encrypt(claims: JwtClaims, keypair: JsonWebKeyPair): Promise<string>;
}

export class JwtSigner implements IJwtSigner {
	private _assertKeypair(keypair: JsonWebKeyPair) {
		if (!keypair?.alg) { throw new Error('Missing keypair.alg'); };
		if (!keypair?.kid) { throw new Error('Missing keypair.kid'); };

		ensurePrivateJwkHasD(keypair.priv);
	}
	async sign(claims: JwtClaims, keypair: JsonWebKeyPair): Promise<string> {
		this._assertKeypair(keypair);

		if (keypair.use !== 'sig') throw new Error(`Wrong key use: ${keypair.use} (need 'sig')`);
		if (!keypair.alg?.match(/^(RS|PS|ES)\d+$/)) throw new Error(`Wrong JWS alg: ${keypair.alg}`);
		if (keypair.kty === 'RSA' && !['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512'].includes(keypair.alg as string)) {
			throw new Error(`RSA key with non‑RSA JWS alg: ${keypair.alg}`);
		}

		const privateKey = await importJWK(keypair.priv as any, keypair.alg);
		const payload: JWTPayload = { ...claims };


		payload.jti = payload.jti ?? base64url(randomBytes(32));
		payload.iat = payload.iat ?? Date.now();
		const signer = new SignJWT(payload).setProtectedHeader({
			alg: keypair.alg,
			kid: keypair.kid,
			typ: 'at+jwt'
		});

		try {
			return await signer.sign(privateKey);
		} catch (error) {
			if (error instanceof Error) {
				if (joseErrors && (error as any).code) {
					throw new TypeError(`JOSE signing error: ${(error as any).code} - ${error.message}`);
				}
				throw new Error(`Signing error: ${error.message}`);
			}
			throw error;
		}
	}

	async encrypt(claims: JwtClaims, keypair: JsonWebKeyPair) {
		this._assertKeypair(keypair);

		const header = inferJweHeaderFromJwk(keypair);
		const payload: JWTPayload = { ...claims };

		payload.jti = payload.jti ?? base64url(randomBytes(32));
		payload.iat = payload.iat ?? Date.now();

		const signer = new EncryptJWT(payload)
			.setProtectedHeader({
				...header,
				kid: keypair.kid,
				typ: 'at+jwt',
			});
		try {
			const token = await signer.encrypt(keypair.pub);
			return token;
		} catch (error) {
			if (error instanceof Error) {
				if (joseErrors && (error as any).code) {
					throw new Error(`JOSE signing error: ${(error as any).code} - ${error.message}`);
				}
				throw new Error(`Signing error: ${error.message}`);
			}
			throw error;
		}
	}

}

export class AccessTokenProvider extends JwtSigner {
	override sign(claims: JwtClaims, keypair: JsonWebKeyPair): Promise<string> {
		const payload: JWTPayload = { ...claims };
		return super.sign(payload, keypair);
	}
}
export type IdTokenClaims = JWTPayload & Record<string, unknown>;
function isString(x: any): x is string { return typeof x === 'string'; }
function isNum(x: any): x is number { return typeof x === 'number' && Number.isFinite(x); }
function validateIdTokenClaims(claims: IdTokenClaims): void {
	const { iss, sub, aud, exp, iat } = claims;
	if (!isString(iss)) throw new Error('ID Token: `iss` (issuer) must be a string');
	if (!isString(sub)) throw new Error('ID Token: `sub` (subject) must be a string');
	const audOk = isString(aud) || (Array.isArray(aud) && aud.every(isString) && aud.length > 0);
	if (!audOk) throw new Error('ID Token: `aud` must be a string or non-empty string[]');
	if (!isNum(exp)) throw new Error('ID Token: `exp` (NumericDate seconds) must be a number');
	if (!isNum(iat)) throw new Error('ID Token: `iat` (NumericDate seconds) must be a number');

	if (Array.isArray(aud) && aud.length > 1) {
		const azp = (claims as any).azp;
		if (!isString(azp)) throw new Error('ID Token: when `aud` has multiple values, `azp` is required (string)');
		if (!aud.includes(azp)) throw new Error('ID Token: `azp` must be one of the `aud` values');
	}

	if ((claims as any).nonce != null && !isString((claims as any).nonce)) {
		throw new Error('ID Token: `nonce` must be a string when present');
	}
	if ((claims as any).auth_time != null && !isNum((claims as any).auth_time)) {
		throw new Error('ID Token: `auth_time` must be a number (NumericDate) when present');
	}
}

export class IdTokenProvider extends JwtSigner {
	override sign(claims: IdTokenClaims, keypair: JsonWebKeyPair): Promise<string> {
		if (keypair?.use !== 'sig') { throw new Error('Provided keypair is not marked for signature (use=sig).'); };
		if (!keypair?.alg) throw new Error('Missing keypair.alg');
		if (!keypair?.kid) throw new Error('Missing keypair.kid');
		const payload: JWTPayload = { ...claims };
		validateIdTokenClaims(payload);
		return super.sign(claims, keypair);
	}
}
