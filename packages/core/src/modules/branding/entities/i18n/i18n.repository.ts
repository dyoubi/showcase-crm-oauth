import { IRepository } from "@egc-io/ckit-lib";
import { I18n, PK_I18n } from "./i18n.model";

export type II18nRepository = IRepository<I18n, PK_I18n>;
export const I18N_REPOSITORY: symbol = Symbol("I18N_REPOSITORY");
