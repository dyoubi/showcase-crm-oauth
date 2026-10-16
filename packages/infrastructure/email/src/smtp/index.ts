import { log } from "@egc-io/ckit-lib";
import { Contact, IEmail, IAttachment, IEmailTransport } from "@ring-oauth/core";
import { createTransport, Transporter } from "nodemailer";
import { Address, Attachment, Options as MsgOptions } from "nodemailer/lib/mailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";

export { TransportOptions } from 'nodemailer';

import { Options as SMTPOptions } from "nodemailer/lib/smtp-connection";

export type OptionsSMTP = SMTPOptions;

function ContactToAddress(contact: Contact): Address | string {
	return contact.name ? contact.email : {
		address: contact.email,
		name: contact.name ?? contact.email,
	};
}

function IAttachmentToAttachement(attachment: IAttachment): Attachment {
	return {
		filename: attachment.filename,
		content: attachment.content,
		contentType: attachment.content_type,
		contentDisposition: attachment.content_disposition,
		encoding: attachment.encoding,
		cid: attachment.cid,
	};
}

function IEmailToMsgOptions(email: IEmail): MsgOptions {
	return {
		from: ContactToAddress(email.from),
		cc: email.cc?.map(ContactToAddress),
		bcc: email.bcc?.map(ContactToAddress),
		to: email.to.map(ContactToAddress),
		subject: email.subject,
		html: email.body.html,
		text: email.body.text,
		attachments: email.attachments?.map(IAttachmentToAttachement)
	};
}

export class NodeMailerTransport implements IEmailTransport {
	private readonly transport: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;
	constructor(smpt: OptionsSMTP) {
		log.info('NodeMailerTransport.constructor');
		this.transport = createTransport({ ...smpt, });
	}
	async emit(email: IEmail): Promise<string> {
		const message = await this.transport.sendMail(IEmailToMsgOptions(email));
		log.info(`message sent: ${JSON.stringify(message)}`);
		return message.messageId;
	}

}