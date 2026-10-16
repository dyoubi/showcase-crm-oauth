import { ModuleDefinition } from "@egc-io/ckit-lib";
import { IEmailTransport, EMAIL_TRANSPORT } from "@ring-oauth/core";
import { NodeMailerTransport, OptionsSMTP } from "./smtp";
import { BrevoEmailTransport } from "./brevo";

function getOptionsSMPT(options?: Record<string, any>): OptionsSMTP {
	return {
		secure: false,
		host: String(options?.SMTP_HOST ?? process.env.SMTP_HOST),
		port: Number(options?.SMTP_PORT ?? process.env.SMTP_PORT),
		auth: {
			user: String(options?.SMTP_USER ?? process.env.SMTP_USER),
			pass: String(options?.SMTP_PASSWORD ?? process.env.SMTP_PASSWORD),
		}
	};
}

export const EmailTransportModule: ModuleDefinition = {
	setup(ioc) {

		let transport: IEmailTransport;
		let useBrevoAPI = true;

		if (useBrevoAPI) {
			transport = new BrevoEmailTransport();
		} else {
			transport = new NodeMailerTransport(getOptionsSMPT());
		}
		ioc.bind<IEmailTransport>({ key: EMAIL_TRANSPORT, value: transport });
	}
};