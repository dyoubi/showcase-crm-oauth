import {
	GrantSession, IGrantSessionStore,
	URN_GrantSession
} from "@ring-oauth/core";
import { RedisStoreClass } from "./common";
import { urn } from "./common/urn";
import { TTL } from "./common/ttl";

export class GrantSessionStore extends RedisStoreClass implements IGrantSessionStore {
	async push(data: GrantSession): Promise<void> {
		const value = JSON.stringify(data);
		const transaction = [
			// session on pending status cannot be updated
			data.status === 'pending' ? this.$redis.setNX(urn.grant(data), value) :
				this.$redis.set(urn.grant(data), value),
			this.$redis.expire(urn.grant(data), TTL.GRANT_SESSION_TTL, 'NX'),
		];
		await Promise.all(transaction);
	}
	async pull(k: URN_GrantSession): Promise<GrantSession | null> {
		const raw = await this.$redis.get(urn.grant(k));
		if (!raw) { return null; }
		return JSON.parse(raw);
	}
	async pop(k: URN_GrantSession): Promise<void> {
		await this.$redis.del(urn.grant(k));
	}
	async has(k: URN_GrantSession): Promise<boolean> {
		return await this.$redis.exists(urn.grant(k)) > 0;
	}
}