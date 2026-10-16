import { Controller, Get, Ip, Query, Req, Res } from '@nestjs/common';
import { OrgID } from 'src/modules/common/org-domain/org-domain.service';
import { PortalCookieService } from '../../portal-cookie/portal-cookie.service';
import { g_context, log } from '@egc-io/ckit-lib';
import { CreateAppSessionUseCase } from '@ring-oauth/application';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CLIENT_PERMISSION_REPOSITORY, ClientConnection, CONNECTION_REPO, IConnectionRepository } from '@ring-oauth/core';

@Controller('portal')
export class PortalController {
	constructor(
		private readonly $orgID: OrgID,
		private readonly $session: PortalCookieService,
	) { }

	@Get('/connections')
	async connectionList(
		@Query('client_id') client_id: string,
	) {

		const connections = g_context.get<IConnectionRepository>(CONNECTION_REPO);
		const list = await connections.find({
			where: {
				org_id: this.$orgID.id,
				client_id,
				enable: true
			}
		});

		return list.map(con => con.database_identifier);
	}

	@Get('/session')
	async session(
		@Req() req: FastifyRequest,
		@Res() res: FastifyReply,
		@Ip() ip: string,
	) {
		let session = await this.$session.session();

		if (!session) {
			const use = g_context.get<CreateAppSessionUseCase>(CreateAppSessionUseCase);
			const ua = {
				ip,
				user_agent: req.headers["user-agent"] ?? "",
				origin: `${req.hostname}${req.url}`,
			};
			log.trace(`create new session token ${JSON.stringify(ua)}`);
			try {
				session = await use.execute({ org_id: this.$orgID.id, session: ua, });
			} catch (error) {
				log.trace(`cannot create sesison ${JSON.stringify(ua)} : ${error.message}`);
				res.status(400);
				res.send();
				return;
			}

		}

		res.setCookie('ringoauth.portal-session', session.token);
		res.status(200);
		res.send();

	}
}
