import { IPushAuthorizationSessionTable, PK_PushAuthorizationSession, PushAuthorizationSession } from "@ring-oauth/core";
import { RedisStoreClass } from "./common";
import { urn } from "./common/urn";
import { TTL } from "./common/ttl";

export class PushAuthorizationTable extends RedisStoreClass implements IPushAuthorizationSessionTable {
	async push(data: PushAuthorizationSession): Promise<void> {
		const pk = urn.par(data);
		await this.$redis.set(pk, JSON.stringify(data));
		await this.$redis.expire(pk, TTL.PAR_REQUEST_EXPIRATION_TTL, 'NX');
	}

	async pull(pk: PK_PushAuthorizationSession): Promise<PushAuthorizationSession | null> {
		const rawValue: string | null = await this.$redis.get(urn.par(pk));
		if (rawValue) {
			return Object.assign(new PushAuthorizationSession(), JSON.parse(rawValue));
		}
		return null;
	}

	async pop(pk: PK_PushAuthorizationSession): Promise<void> {
		await this.$redis.del(urn.par(pk));
	}

	async has(pk: PK_PushAuthorizationSession): Promise<boolean> {
		return await this.$redis.exists(urn.par(pk)) > 0;
	}

}