import { JSONObject } from "../../common";

export const EVENT_NAME_SPACE = `oauth`;
export const USER_REGISTRATION_EVENT = `users.registration`;
export const USER_PASSWORD_RESET_REQUEST_EVENT = `users.password-reset-request`;
export const USER_EMAIL_VALIDATION_SENT = `users.email-validation-sent`;

export function routing(...v: string[]) {
	return `${EVENT_NAME_SPACE}.${v.flatMap(s => s.trim().replace(' ', '').split('.')).join('.')}`;
}

export interface UserRegistrationEvent {
	org_id: string;
	email: string;
	connection: string;
	username: string | null;
	registration_date: Date;
	metadata?: JSONObject;
}