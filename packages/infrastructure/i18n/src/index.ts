import * as fs from 'fs';
import { parse } from '@fast-csv/parse';
import path from 'path';
import _ from 'lodash';
import {
	HTML_TEMPLATE_REPOSITORY,
	I18N_PROVIDER, I18N_REPOSITORY, IHTMLTemplateRepository, II18nProvider,
	II18nRepository, ITemplateRenderer, JSONObject,
	TEMPLATE_RENDERER,
	TemplateUsage
} from '@ring-oauth/core';
import { inject, injectable, log, ModuleDefinition, SystemException } from '@egc-io/ckit-lib';
import { Liquid } from 'liquidjs';

type Row = {
	lang: string;
	path: string;
	default: string;
};

@injectable({ token: I18N_PROVIDER })
export class DefaultI18nProvider implements II18nProvider {
	constructor(
		@inject(I18N_REPOSITORY, { isOptional: true })
		private readonly $i18ns?: II18nRepository
	) { }

	private _parse<T extends JSONObject = JSONObject>(page: string, lang: string): Promise<JSONObject> {
		return new Promise<any>((resolve, reject) => {
			let data: T = {} as T;
			let filename = path.join(__dirname, '../lang', lang, ...page.split('/'), `${lang}.csv`);
			if (!fs.existsSync(filename)) {
				log.error(`cannot find valid I18n file (lang=${lang}}) at path ${filename}. Fallback to default lang`);
				lang = 'en';
			}
			filename = path.join(__dirname, '../lang', lang, ...page.split('/'), `${lang}.csv`);
			fs.createReadStream(filename)
				.pipe(parse({ headers: true, trim: true, }))
				.on('data', (row: Row) => _.set(data, row.path.replaceAll(/\//g, '.'), row.default))
				.on('end', () => resolve(data))
				.on('error', error => { data = {} as T; reject(error); });
		});
	}

	async get(org_id: string, page: string, lang?: string): Promise<JSONObject> {
		if (!this.$i18ns) { return await this._parse(page, lang ?? 'en'); }
		else {
			const found = await this.$i18ns.findOne({
				where: {
					org_id,
					page,
					lang: lang ?? 'en',
				}
			});
			if (found) { return found.values; }
			return await this._parse<JSONObject>(page, lang ?? 'en');
		}
	}
}


@injectable({ token: TEMPLATE_RENDERER })
export class DefaultTemplateRenderer implements ITemplateRenderer {
	private readonly $parser = new Liquid();
	constructor(
		@inject(HTML_TEMPLATE_REPOSITORY, { isOptional: true })
		private readonly $templates?: IHTMLTemplateRepository
	) { }

	async render(org_id: string, usage: TemplateUsage, args: JSONObject, lang?: string): Promise<string> {
		let template: string | null = null;
		lang = lang ?? 'en';
		if (this.$templates) {
			let found = await this.$templates.findOne({ where: { org_id, usage, lang }, sort: { custom: 'DESC' } });
			if (found) { template = found.html; }
		}
		if (!template) {
			let filename: string = path.join(__dirname, '../lang', lang, 'html', `${usage}.html`);
			if (!fs.existsSync(filename)) {
				log.error(`cannot find valid html template ${usage} (lang=${lang}}) at path ${filename}`);
				throw new SystemException(`cannot find valid html template ${usage} (lang=${lang}})`);
			}
			template = fs.readFileSync(filename).toString('utf-8');
		}
		const html = await this.$parser.parseAndRender(template, args);
		return html;
	}

}

export const I18nModule: ModuleDefinition = {
	// exports: [{ key: I18N_PROVIDER, value: DefaultI18nProvider }]
};

export const HTMLTemplateModule: ModuleDefinition = {
	// exports: [{ key: TEMPLATE_RENDERER, value: DefaultTemplateRenderer }]
};