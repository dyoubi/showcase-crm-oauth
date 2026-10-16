import { EUserAction, IUserRegistrationTicketTable, PK_UserRegistrationTicket, UserRegistrationTicket } from "@ring-oauth/core";
import { RedisStoreClass } from "./common";
import { TTL } from "./common/ttl";
import { urn } from "./common/urn";

export class UserRegistrationTicketTable extends RedisStoreClass implements IUserRegistrationTicketTable {
	async push(data: UserRegistrationTicket): Promise<void> {
		const value = JSON.stringify(data);
		const pk = urn.ticket({ ...data, action: EUserAction.REGISTER });
		const transaction = [
			this.$redis.set(pk, value),
			this.$redis.expire(pk, TTL.GRANT_SESSION_TTL),
		];
		await Promise.all(transaction);
	}

	async pull(pk: PK_UserRegistrationTicket): Promise<UserRegistrationTicket | null> {
		const raw = await this.$redis.get(urn.ticket({ ...pk, action: EUserAction.REGISTER }));
		if (raw) { return JSON.parse(raw); }
		return null;
	}

	async pop(pk: PK_UserRegistrationTicket): Promise<void> {
		await this.$redis.del(urn.ticket({ ...pk, action: EUserAction.REGISTER }));
	}

	async has(pk: PK_UserRegistrationTicket): Promise<boolean> {
		return (await this.$redis.exists(urn.ticket({ ...pk, action: EUserAction.REGISTER })) > 0);
	}

}