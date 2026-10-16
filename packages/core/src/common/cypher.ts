import { createHmac, scrypt } from "crypto";


export function HashCredentialValue(value: string, salt: string, keylen: number = 128): Promise<Buffer> {
	const hmac = createHmac('sha256', salt).update(value).digest();
	return new Promise<Buffer>((resolve, reject) => {
		scrypt(hmac, salt, keylen, (error, v: Buffer) => {
			if (error !== null) {
				reject(error);
			} else {
				resolve(v);
			}
		});
	});
}