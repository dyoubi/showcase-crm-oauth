import {
	BadRequestException, inject, injectable,
	NotFoundException, NotImplementedException
} from "@egc-io/ckit-lib";
import {
	CredentialType, ECredentialType, EResetMode, ETicketUsage,
	ITicketChallengeRepository,
	IUserRepository, LoginHint, PK_User, ResetMode, seconds, TICKET_CHALLENGE_REPOSITORY, TicketChallenge, USER_REPOSITORY
} from "@ring-oauth/core";
import { ChallengeEmailUseCase, CreateTicketChallengeUseCase } from "../use-cases/ticket-challenge";
import { UpateUserCredentialsUseCase } from "../../user";
@injectable()
export class TicketService {
	constructor(
		@inject(CreateTicketChallengeUseCase)
		private readonly $createTicket: CreateTicketChallengeUseCase,
		@inject(ChallengeEmailUseCase)
		private readonly $challengeEmail: ChallengeEmailUseCase,
		@inject(UpateUserCredentialsUseCase)
		private readonly $updateCreds: UpateUserCredentialsUseCase,
		@inject(USER_REPOSITORY)
		private $users: IUserRepository,
		@inject(TICKET_CHALLENGE_REPOSITORY)
		private $tickets: ITicketChallengeRepository,
	) { }


	async updateCredentials(
		org_id: string,
		ticket: TicketChallenge,
		credentials: {
			type: CredentialType;
			value: string;
		}
	) {
		const pk: PK_User = { org_id, user_id: ticket.user_id!, };
		if (ticket.revoked === true || ticket.expires <= seconds.now()) { throw new BadRequestException(`request_expired`); }

		const user = await this.$users.findById(pk);
		await this.$updateCreds.execute({
			org_id,
			credentials: {
				connection: user.connection,
				email: user.email,
				type: credentials.type,
				value: credentials.value,
			},
		});

		await this.$tickets.updateById({ org_id, tid: ticket.tid }, { revoked: true, revoked_at: new Date() });
	}

	async resetCredentialsTicket(
		org_id: string,
		reset_mode: ResetMode,
		type: CredentialType,
		connection: string,
		login_hint: LoginHint,
		redirect_uri: string,
		form_uri: string,
	) {
		let usage: ETicketUsage;
		switch (type) {
			case ECredentialType.PASSWORD:
				usage = ETicketUsage.PASSWORD_RESET;
				break;
			default:
				throw new NotImplementedException('invalid_credentials_type');
		}

		if (!LoginHint(login_hint)) {
			throw new BadRequestException(`invalid_request`);
		}

		const where = {
			...login_hint.email ? { email: login_hint.email } : { username: login_hint.username },
			org_id,
			connection,
		};

		let user = await this.$users.findOne({ where });
		if (!user) { throw new NotFoundException(`user_not_found`); }

		const ticket = await this.$createTicket.execute({
			org_id, redirect_uri,
			usage, user,
			ttl: 60 * 15,
		});

		switch (reset_mode) {
			case EResetMode.EMAIL: {
				await this.$challengeEmail.execute({
					org_id, user,
					ticket: ticket.ticket,
					token: ticket.token,
					form_uri: form_uri,
				});
				break;
			}
			default: { throw new NotImplementedException('invalid_reset_mode'); }
		}

		return ticket;
	}

}