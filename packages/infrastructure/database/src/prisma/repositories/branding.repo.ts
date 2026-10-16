import { I18n, PK_I18n, II18nRepository, HTMLTemplate, PK_HTMLTemplate, IHTMLTemplateRepository, Theme, PK_Theme, IThemeRepository } from "@ring-oauth/core";
import { PrismaRepository } from "../common/repository";

export class I18nRepo extends PrismaRepository<I18n, PK_I18n, 'org_id_lang_page'> implements II18nRepository {
	protected override $ID(v: PK_I18n): { org_id_lang_page: PK_I18n; } { return { org_id_lang_page: v }; }
}

export class HTMLTemplateRepo extends PrismaRepository<HTMLTemplate, PK_HTMLTemplate, 'org_id_template_id'> implements IHTMLTemplateRepository {
	protected override $ID(v: PK_HTMLTemplate): { org_id_template_id: PK_HTMLTemplate; } { return { org_id_template_id: v }; }
}

export class ThemeRepo extends PrismaRepository<Theme, PK_Theme, 'org_id_theme_id'> implements IThemeRepository {
	protected override $ID(v: PK_Theme): { org_id_theme_id: PK_Theme; } { return { org_id_theme_id: v }; }
}