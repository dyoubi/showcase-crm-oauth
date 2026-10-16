import { log } from "@egc-io/ckit-lib";
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { AuthorizationDetails, LoginHint, TicketChallengeRequest, TokenRequest } from "@ring-oauth/core";

type ValidationFunction<T> = (value: any) => value is T;

export class RequestValidationPipe<T> implements PipeTransform<any, T> {
	constructor(private readonly $validator: ValidationFunction<T>) { }
	transform(value: any): T {
		if (this.$validator(value)) {
			return value as T;
		}
		log.error(value);
		throw new BadRequestException(`invalid_request`);
	}
}

@Injectable()
export class TicketChallengePipe implements PipeTransform<any, TicketChallengeRequest> {
	transform(value: any) {
		let login_hint: string | undefined | LoginHint = value.login_hint;
		if (!login_hint) {
			login_hint = undefined;
		}
		if (typeof login_hint === 'string') {
			login_hint = login_hint.trim();
			if (login_hint.startsWith('{') && login_hint.endsWith('}')) {
				try { login_hint = JSON.parse(login_hint); }
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				catch (error) { throw new BadRequestException(`invalid_request`); }
			} else {
				login_hint = { email: value.login_hint };
			}
		}

		value.login_hint = login_hint;
		if (!TicketChallengeRequest(value)) {
			throw new BadRequestException(`invalid_request`);
		}
		return value as TicketChallengeRequest;
	}

}

@Injectable()
export class TokenRequestPipe implements PipeTransform<any, TokenRequest> {
	transform(value: any): TokenRequest {
		if (!value.authorization_details) {
			return value;
		}
		if (typeof value.authorization_details === 'string') {
			if (value.authorization_details.startsWith('[')
				& value.authorization_details.endsWith(']')
			) {
				try {
					const authorization_details: AuthorizationDetails[] = JSON.parse(value.authorization_details);
					value.authorization_details = authorization_details;
				} catch { throw new BadRequestException("invalid_request"); }
			}
		} else if (typeof value.authorization_details !== 'object') {
			throw new BadRequestException("invalid_request");
		}
		return value;
	}

}