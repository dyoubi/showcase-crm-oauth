import { g_context } from '@egc-io/ckit-lib';
import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ISSUER_URL_PROVIDER, IURLProvider } from '@ring-oauth/core';
import { FastifyRequest } from 'fastify';

@Injectable({ scope: Scope.REQUEST })
export class OrgID {
	private $issuer: IURLProvider;
	constructor(
		@Inject(REQUEST) private readonly $req: FastifyRequest,
	) {
		this.$issuer = g_context.get<IURLProvider>(ISSUER_URL_PROVIDER);
	}
	get id() {
		const host = this.$req.hostname || this.$req.headers['host'];
		if (!host) { throw new BadRequestException('instance_not_found'); }
		const parts = host.split('.');
		if (parts.length < 2) { throw new BadRequestException('instance_not_found'); }
		return parts[0];
	}
	get url() { return this.$issuer.get(this.id); }
}