import { log, SystemException } from "@egc-io/ckit-lib";
import { IEmail, IEmailTransport } from "@ring-oauth/core";
import { SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";

export class BrevoEmailTransport implements IEmailTransport {
	private readonly $api: TransactionalEmailsApi;
	constructor() {
		log.debug('BrevoEmailTransport.constructor');
		const apiKey = String(process.env.BREVO_API_KEY);
		log.debug("Brevo API Key", apiKey);
		this.$api = new TransactionalEmailsApi();
		this.$api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);
	}
	async emit(email: IEmail): Promise<string> {
		log.info('send transaction email');
		const message = Object.assign(new SendSmtpEmail(), {
			sender: email.from,
			cc: email.cc,
			bcc: email.bcc,
			to: email.to,
			subject: email.subject,
			textContent: email.body.text,
			htmlContent: email.body.html,
		});
		log.debug(`message ${JSON.stringify(message)}`);
		try {
			const response = await this.$api.sendTransacEmail(message);
			log.info(response.body);
			return response.body.messageId ?? '';
		} catch (error) {
			log.error(error.response.data);
			throw new SystemException(`email transaction failure ${error.message}`);
		}
	}
}