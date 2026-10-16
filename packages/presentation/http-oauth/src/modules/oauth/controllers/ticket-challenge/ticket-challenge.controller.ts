import { Controller, Get, Inject, Query, Req, Res } from '@nestjs/common';
import * as HttpErrors from '@nestjs/common/exceptions';
import { g_context, log } from '@egc-io/ckit-lib';
import { ETicketUsage, ISSUER_URL_PROVIDER, IURLProvider, TicketChallengeRequest } from '@ring-oauth/core';
import { CreateChallengeRequestUseCase } from '@ring-oauth/application';
import { FastifyReply, FastifyRequest } from 'fastify';
import { TicketChallengePipe } from '../../pipes/request-validation.pipe';
import { OrgID } from 'src/modules/common/org-domain/org-domain.service';

@Controller('/oauth/challenge')
export class TicketChallengeController {
	private $issuer: IURLProvider;

	constructor(@Inject(OrgID) private orgID: OrgID) {
		this.$issuer = g_context.get<IURLProvider>(ISSUER_URL_PROVIDER);
	}

	@Get()
	async open(
		@Query(TicketChallengePipe) request: TicketChallengeRequest,
		@Req() req: FastifyRequest,
		@Res({ passthrough: false }) res: FastifyReply,
	) {
		const uc = g_context.get<CreateChallengeRequestUseCase>(CreateChallengeRequestUseCase);
		const { token } = await uc.execute({
			org_id: this.orgID.id,
			client: {
				client_id: request.client_id,
			},
			connection: request.connection,
			redirect_uri: request.redirect_uri,
			usage: request.usage,
			login_hint: request.login_hint,
		});

		const url = new URL('http://x.x');
		url.host = this.$issuer.get(this.orgID.id).hostname;
		url.protocol = req.protocol;
		url.pathname = '/confirm-account';
		switch (request.usage) {
			case ETicketUsage.PASSWORD_RESET:
				url.pathname = '/forgot-password';
				if (request.login_hint?.email) {
					url.searchParams.set('login_hint', request.login_hint.email);
				}
				break;
			case ETicketUsage.EMAIL_VALIDATION:
				res.status(203);
				res.send({ ok: true });
				return;
			default: { throw new HttpErrors.NotImplementedException('bad_request'); }
		}

		url.searchParams.set('request_token', token);
		const redirect_url = url.toString();
		log.trace(`redirect to ${redirect_url}`);
		res.redirect(redirect_url, 303);
	}
}
