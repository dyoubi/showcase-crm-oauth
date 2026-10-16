import { g_context } from '@egc-io/ckit-lib';
import { Controller, Get, Inject } from '@nestjs/common';
import { JwksJsonUseCase, OpenIdConfigurationUseCase } from '@ring-oauth/application';
import { OrgID } from 'src/modules/common/org-domain/org-domain.service';

@Controller('.well-known')
export class WellKnownController {
	private $wellknows: OpenIdConfigurationUseCase;
	private $jwksJson: JwksJsonUseCase;

	constructor(
		@Inject(OrgID)
		private readonly $orgId: OrgID
	) {
		this.$wellknows = g_context.get<OpenIdConfigurationUseCase>(OpenIdConfigurationUseCase);
		this.$jwksJson = g_context.get<JwksJsonUseCase>(JwksJsonUseCase);
	}

	@Get('openid-configuration')
	async openid() {
		const org_id = this.$orgId.id;
		const result = await this.$wellknows.execute({ org_id });
		return result;
	}


	@Get('jwks.json')
	async jwksJson() {
		const org_id = this.$orgId.id;
		const result = await this.$jwksJson.execute({ org_id });
		return result;
	}
}
