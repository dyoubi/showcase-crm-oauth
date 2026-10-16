import { EmailScheduleData, EmailScheduleResponse, IEmailTaskProvider } from "@ring-oauth/core";
import { TaskQueue } from "./common";

export class EmailTask extends TaskQueue implements IEmailTaskProvider {

	async schedule(data: EmailScheduleData, opts?: { retries?: number; delay?: number; }): Promise<EmailScheduleResponse> {
		const job = await this._schedule('email-emit', data);
		throw new Error("Method not implemented.");
	}
}