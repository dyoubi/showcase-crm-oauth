import { inject, injectable, IUseCase } from "@egc-io/ckit-lib";
import { I18N_PROVIDER, I18N_REPOSITORY, II18nProvider, II18nRepository, JSONObject, PK_I18n } from "@ring-oauth/core";

export type UpdateI18nValuesUseCaseIn = {
    org_id: string;
    values: JSONObject,
    lang: string;
    page?: string;
};
export type UpdateI18nValuesUseCaseOut = void;

@injectable()
export class UpdateI18nValuesUseCase implements IUseCase<UpdateI18nValuesUseCaseIn, UpdateI18nValuesUseCaseOut> {
    constructor(
        @inject(I18N_REPOSITORY)
        private $i18ns: II18nRepository,
    ) { }
    async execute(input: UpdateI18nValuesUseCaseIn): Promise<UpdateI18nValuesUseCaseOut> {
        const pk: PK_I18n = {
            org_id: input.org_id,
            lang: input.lang,
            page: input.page ?? '',
        };
        let count: number;
        count = await this.$i18ns.count({ where: pk });
        if (count) {
            await this.$i18ns.updateById(pk, { values: input.values });
        } else {
            await this.$i18ns.create({ ...pk, values: input.values });
        }
        return;
    }
}
