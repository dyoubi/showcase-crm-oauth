import {
	EBinaryTheme, IThemeProvider, IThemeRepository, JSONObject,
	THEME_PROVIDER, THEME_REPOSITORY
} from "@ring-oauth/core";
import { inject, injectable, ModuleDefinition } from "@egc-io/ckit-lib";
import { existsSync, readFileSync } from "fs";
import path from "path";

@injectable({ token: THEME_PROVIDER })
export class DefaultThemeProvider implements IThemeProvider {
	constructor(
		@inject(THEME_REPOSITORY, { isOptional: true })
		private readonly $themes?: IThemeRepository,
	) { }

	async get(org_id: string): Promise<JSONObject> {
		const themedir = path.join(__dirname, '../theme');
		const modes = ['light', 'dark'];
		let records: Map<string, JSONObject> = new Map<string, JSONObject>();

		if (this.$themes) {
			let themeList = await this.$themes.find({
				where: [
					{ mode: EBinaryTheme.Light, org_id },
					{ mode: EBinaryTheme.Dark, org_id },
				]
			});
			for (const theme of themeList) { records.set(theme.mode, { ...theme }); }
		}

		for (const mode of modes) {
			if (records.has(mode)) { continue; }
			const themepath = path.join(themedir, mode, './theme.json');
			if (!existsSync(themepath)) { throw new ReferenceError(`theme file does not exits`); }
			records.set(mode, JSON.parse(readFileSync(themepath).toString('utf8')));
		}

		return Object.fromEntries(records.entries());
	}
}

export const ThemeModule: ModuleDefinition = {
	exports: [{ key: THEME_PROVIDER, value: DefaultThemeProvider }]
};