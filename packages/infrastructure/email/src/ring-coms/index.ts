import { IEmail, IEmailTransport } from "@ring-oauth/core";
import { randomUUID } from "crypto";

export type EmailRequest = {
	sender_id: string;
	foreign_id: string;
	email: IEmail,
};

export class RingComsEmailTransport implements IEmailTransport {
	private readonly api: string;

	constructor() {
		this.api = process.env['RING_COMS_URL'] ? String(process.env['RING_COMS_URL']) : 'http://127.0.0.1:3002/';
	}

	async emit(email: IEmail): Promise<string> {
		const url = new URL(this.api);
		url.pathname = '/schedule-email';
		const res = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				sender_id: 'ringoauth',
				foreing_id: randomUUID(),
				email,
			}),
		});
		return '';
	}
}