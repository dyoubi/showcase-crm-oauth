import { pgTable, text, jsonb, foreignKey, primaryKey } from 'drizzle-orm/pg-core';
import { InstanceTable } from '../../instances/table';
import { BrandingSchema } from '../schema';

export const I18nTable = BrandingSchema.table('i18n', {
	org_id: text('org_id').notNull(),
	lang: text('lang').notNull(),
	page: text('page').notNull(),
	values: jsonb('values').notNull()
}, (table) => [
	foreignKey({
		name: 'fk_i18n_instance',
		columns: [table.org_id],
		foreignColumns: [InstanceTable.org_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	primaryKey({
		name: 'pk_i18n',
		columns: [table.org_id, table.lang, table.page]
	})
]);
