import { inject, injectable } from "@egc-io/ckit-lib";
import { UpdateI18nValuesUseCase } from "../use-cases";
import { I18N_PROVIDER, II18nProvider } from "@ring-oauth/core";

@injectable()
export class I18nService {
	constructor(
		@inject(UpdateI18nValuesUseCase)
		private readonly $updateValues: UpdateI18nValuesUseCase,
		@inject(I18N_PROVIDER)
		private $i18ns: II18nProvider,
	) { }

	async setDefault(org_id: string) {
		const langList = [
			'en',
			'en-EN',
			'fr',
			'fr-FR',
			'es',
			'fi',
			'de'
		];
		for (const lang of langList) {
			const values = await this.$i18ns.get(org_id, '', lang);
			await this.$updateValues.execute({ org_id, page: '', lang, values, });
		}
	}
}