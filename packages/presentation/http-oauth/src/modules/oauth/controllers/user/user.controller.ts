import { g_context, log } from '@egc-io/ckit-lib';
import { BadRequestException, Body, Controller, Inject, Post, Redirect, Req } from '@nestjs/common';
import * as HttpErrors from '@nestjs/common/exceptions';
import { UserService } from '@ring-oauth/application';
import { UserRegistrationTicketRequest } from '@ring-oauth/core';
import { FastifyRequest } from 'fastify';
import { OrgID } from 'src/modules/common/org-domain/org-domain.service';
import { RequestValidationPipe } from '../../pipes/request-validation.pipe';

@Controller('user')
export class UserController {
	private readonly $users: UserService = g_context.get<UserService>(UserService);

	constructor(@Inject(OrgID) private readonly $org: OrgID) { }

	@Post('register')
	@Redirect()
	async register(
		@Req() req: FastifyRequest,
		@Body(new RequestValidationPipe(UserRegistrationTicketRequest)) request: UserRegistrationTicketRequest
	) {
		try {
			const ticket = await this.$users.registrationTicket(
				this.$org.id,
				request,
			);

			const url = new URL('http://x.x');
			url.host = req.hostname;
			url.protocol = req.protocol;
			url.pathname = '/sign-up';
			url.port = String(req.port);

			url.searchParams.set('client_id', request.client_id);
			if (ticket.login_hint?.email) { url.searchParams.set('hint_email', ticket.login_hint.email); }
			if (ticket.login_hint?.username) { url.searchParams.set('hint_username', ticket.login_hint.username); }
			url.searchParams.set('ticket', ticket.jti);

			const redirect_uri: string = url.toString();
			log.info(`redirect to ${redirect_uri}`);

			return { url: redirect_uri, };

		} catch (error) {
			if (error instanceof BadRequestException) {
				new HttpErrors.BadRequestException(`${error.message.split('\n')[0].trim()}`);
			}
			throw new HttpErrors.InternalServerErrorException(error.message);
		}
	}
}
