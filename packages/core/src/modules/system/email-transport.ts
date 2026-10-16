import { IEmail } from "./types";

export interface IEmailTransport {
	/**
	 * Emit an email 
	 * @param email email to send
	 * @returns message_id
	 */
	emit(email: IEmail): Promise<string>;
}
export const EMAIL_TRANSPORT: symbol = Symbol("EMAIL_TRANSPORT");
