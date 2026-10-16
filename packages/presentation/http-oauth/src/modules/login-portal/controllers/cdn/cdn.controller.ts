import { g_context } from '@egc-io/ckit-lib';
import { Controller, Get, Headers, Inject } from '@nestjs/common';
import { I18N_PROVIDER, II18nProvider, IThemeProvider, THEME_PROVIDER } from '@ring-oauth/core';
import { OrgID } from 'src/modules/common/org-domain/org-domain.service';

@Controller('cdn')
export class CdnController {
	constructor(@Inject(OrgID) private orgID: OrgID) { }

	@Get('theme.json')
	async getTheme() {
		const provider = g_context.get<IThemeProvider>(THEME_PROVIDER);
		const dict = await provider.get(this.orgID.id);
		return dict;
	}

	@Get('i18n.json')
	async getI18n(
		@Headers('accept-language') acceptLanguage?: string,
	) {
		let lang = 'en';
		if (acceptLanguage) {
			const parts = acceptLanguage.split(/,|;/g);
			if (parts.length > 0) { lang = parts[0]; }
		}
		const provider = g_context.get<II18nProvider>(I18N_PROVIDER);
		const dict = await provider.get(this.orgID.id, '', lang);
		return dict;
	}
}
