import { createHmac, scryptSync } from "crypto";

export type ICredentialEncryptionProvider = (value: string, salt: string, modulusLength?: number) => Buffer | Promise<Buffer>;
export const CREDENTIAL_ENCRYPTION_PROVIDER = Symbol('CREDENTIAL_ENCRYPTION_PROVIDER');

export function DefaultCredentialEncryptionProvider(value: string, salt: string, keylen: number = 128): Buffer {
	return scryptSync(value, salt, keylen);
}