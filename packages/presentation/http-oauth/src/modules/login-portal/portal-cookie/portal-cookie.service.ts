import { g_context, log } from '@egc-io/ckit-lib';
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ValidateAppSessionUseCase } from '@ring-oauth/application';
import { AppSession } from '@ring-oauth/core';

import { FastifyRequest } from 'fastify';
import { OrgID } from 'src/modules/common/org-domain/org-domain.service';

export const PORTAL_SESSION_COOKIE_NAME: string = 'ringoauth.portal-session';

@Injectable({ scope: Scope.REQUEST })
export class PortalCookieService {
	constructor(
		@Inject(REQUEST) private readonly $req: FastifyRequest,
		@Inject(OrgID) private readonly $org: OrgID,
	) { }

	get cookie() { return this.$req.cookies[PORTAL_SESSION_COOKIE_NAME] ?? null; }

	async session(): Promise<{ token: string, session: AppSession; } | null> {
		const cookies = this.$req.cookies;
		const jwt = cookies[PORTAL_SESSION_COOKIE_NAME];
		if (!jwt) { return null; }
		const token = jwt;
		const validate = g_context.get<ValidateAppSessionUseCase>(ValidateAppSessionUseCase,);
		try {
			const session = await validate.execute({ org_id: this.$org.id, token });
			return { session, token };
		} catch (error) {
			log.error(error.message);
			return null;
		}
	}
}
