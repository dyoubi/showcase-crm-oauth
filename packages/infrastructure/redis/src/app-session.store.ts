import { AppSession, IAppSessionTable, PK_AppSession } from "@ring-oauth/core";
import { RedisStoreClass } from "./common";
import { urn } from "./common/urn";
import { TTL } from "./common/ttl";

export class AppSessionTable extends RedisStoreClass implements IAppSessionTable {
	async push(data: AppSession): Promise<void> {
		const pk = urn.session(data);
		const raw = JSON.stringify(data);
		await this.$redis.set(pk, raw);
		await this.$redis.expire(pk, TTL.APP_SESSION_EXPIRATION_TTL);
	}

	async pull(pk: PK_AppSession): Promise<AppSession | null> {
		const raw = await this.$redis.get(urn.session(pk));
		if (!raw) { return null; }
		return Object.assign({}, JSON.parse(raw)) as AppSession;
	}
	async pop(pk: PK_AppSession): Promise<void> {
		await this.$redis.del(urn.session(pk));
	}
	async has(pk: PK_AppSession): Promise<boolean> {
		return (await this.$redis.exists(urn.session(pk))) > 0;
	}

}