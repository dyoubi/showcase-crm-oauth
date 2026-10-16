import { errors as joseErrors, decodeJwt, jwtVerify, decodeProtectedHeader } from 'jose';
import { JsonWebKeyPair, JwtClaims, JwtHeader, ensurePrivateJwkHasD } from '../json-web-token';

export interface IJwtDecoder {
	decode(token: string): Promise<{ header: JwtHeader, claims: JwtClaims; }>;
	verify(token: string, keypair: JsonWebKeyPair): Promise<JwtHeader>;
}

export class JwtDecoder implements IJwtDecoder {

	async verify(token: string, keypair: JsonWebKeyPair) {
		if (keypair?.use !== 'sig') { throw new Error('Provided keypair is not marked for signature (sig=false).'); };
		if (!keypair?.alg) { throw new Error('Missing keypair.alg'); };
		if (!keypair?.kid) { throw new Error('Missing keypair.kid'); };

		if (keypair.priv) {
			ensurePrivateJwkHasD(keypair.priv);
		}

		const payload = await jwtVerify(token, keypair.pub);

		return payload.protectedHeader;
	}

	async decode(token: string): Promise<{ header: JwtHeader, claims: JwtClaims; }> {
		try {
			const payload = await decodeJwt(token);
			const header = await decodeProtectedHeader(token);
			return { header, claims: payload };
		} catch (error) {
			if (error instanceof joseErrors.JOSEError) {
				throw new TypeError(`${error.message}}`);
			}
			throw new Error(error.message);
		}
	}
}