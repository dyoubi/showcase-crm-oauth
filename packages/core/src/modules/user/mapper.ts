import { } from "./dto";
import { User, } from "./entities";
import { UserRegistrationEvent } from "./event";

export function UserToRegistrationEvent(user: User): UserRegistrationEvent {
	return {
		org_id: user.org_id,
		connection: user.connection,
		email: user.email,
		username: user.username,
		registration_date: user.created_at,
	};
}