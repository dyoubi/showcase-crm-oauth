import { IRepository } from "@egc-io/ckit-lib";
import { PK_Theme, Theme } from "./theme.model";
export type IThemeRepository = IRepository<Theme, PK_Theme>;
export const THEME_REPOSITORY: symbol = Symbol("THEME_REPOSITORY");
