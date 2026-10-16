import { pgTable, text, jsonb, foreignKey, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core';
import { BrandingSchema } from '../schema';
import { BinaryTheme } from '../../public/schema';
import { InstanceTable } from '../../instances/table';

export const ThemeTable = BrandingSchema.table('themes', {
	org_id: text('org_id').notNull(),
	theme_id: text('theme_id').notNull(),
	colors: jsonb('colors').notNull(),
	fonts: jsonb('fonts').notNull(),
	borders: jsonb('borders').notNull(),
	widget: jsonb('widget').notNull(),
	page_background: jsonb('page_background').notNull(),
	mode: BinaryTheme('mode').notNull()
}, (Theme) => [
	foreignKey({
		name: 'fk_themes_instance',
		columns: [Theme.org_id],
		foreignColumns: [InstanceTable.org_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	uniqueIndex('fk_theme_org_id_mode')
		.on(Theme.org_id, Theme.mode),
	primaryKey({
		name: 'pk_theme_',
		columns: [Theme.org_id, Theme.theme_id]
	})
]);