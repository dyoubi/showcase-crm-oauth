import { UserRegistrationTicket } from "../interfaces";

export type PK_UserRegistrationTicket = {
	org_id: string;
	jti: string;
};

export interface IUserRegistrationTicketTable {
	push(data: UserRegistrationTicket): Promise<void>;
	pull(pk: PK_UserRegistrationTicket): Promise<UserRegistrationTicket | null>;
	pop(pk: PK_UserRegistrationTicket): Promise<void>;
	has(pk: PK_UserRegistrationTicket): Promise<boolean>;
}
export const USER_REGISTRATION_TICKET_TABLE = Symbol('USER_REGISTRATION_TICKET_TABLE');
