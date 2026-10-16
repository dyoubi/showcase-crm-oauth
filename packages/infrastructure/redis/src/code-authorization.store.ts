import {
	CodeAuthorization, ICodeAuthorizationTable, PK_CodeAuthorization,
} from "@ring-oauth/core";
import { RedisStoreClass } from "./common/redis-store";
import { urn } from "./common/urn";
import { TTL } from "./common/ttl";

export class CodeAuthorizationStore extends RedisStoreClass implements ICodeAuthorizationTable {
	async push(data: CodeAuthorization): Promise<void> {
		const value = JSON.stringify(data);
		const pk = urn.code(data);
		const transaction = [
			// updating the code only if code as a closing status
			data.status === 'pending' ? this.$redis.hSetNX(pk, data.code, value)
				: this.$redis.hSet(pk, data.code, value),
			this.$redis.hExpire(pk, data.code, TTL.CODE_EXPIRATION_TTL, 'NX'),
			this.$redis.expire(pk, TTL.GRANT_SESSION_TTL, 'NX'),
		];
		await Promise.all(transaction);
	}
	async pull(pk: PK_CodeAuthorization): Promise<CodeAuthorization | null> {
		const raw = await this.$redis.hGet(urn.code(pk), pk.code);
		if (raw) { return JSON.parse(raw); }
		return null;
	}
	async pop(pk: PK_CodeAuthorization): Promise<void> {
		await this.$redis.hDel(urn.code(pk), pk.code);
	}
	async has(pk: PK_CodeAuthorization): Promise<boolean> {
		return (await this.$redis.hExists(urn.code(pk), pk.code) > 0);
	}
}