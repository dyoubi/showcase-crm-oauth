import { IJtiLookupTable, URN_GrantSessionLookup, URN_GrantSession } from "@ring-oauth/core";
import { RedisStoreClass } from "./common";
import { TTL } from "./common/ttl";
import { urn } from "./common/urn";

export class JtiLookupTable extends RedisStoreClass implements IJtiLookupTable {
	async push(k: URN_GrantSessionLookup): Promise<void> {
		await this.$redis.setNX(urn.jti(k), k.grant_id);
		await this.$redis.expire(urn.jti(k), TTL.GRANT_SESSION_TTL, 'NX');
	}
	async pull(k: Omit<URN_GrantSessionLookup, 'grant_id'>): Promise<string | null> {
		return await this.$redis.get(urn.jti(k));
	}
	async pop(k: Omit<URN_GrantSessionLookup, 'grant_id'>) {
		await this.$redis.del(urn.jti(k));
	}
	async has(k: URN_GrantSession): Promise<boolean> {
		return await this.$redis.exists(urn.grant(k)) > 0;
	}
}