import { text, jsonb, foreignKey, primaryKey, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { InstanceTable } from '../../instances/table';
import { TemplateUsage } from '../../public/schema';
import { BrandingSchema } from '../schema';

export const HTMLTemplateTable = BrandingSchema.table('html_templates', {
	org_id: text('org_id').notNull(),
	template_id: text('template_id').notNull(),
	usage: TemplateUsage('usage').notNull(),
	lang: text('lang'),
	custom: boolean('custom'),
	html: text('html').notNull(),
	schema: jsonb('schema').notNull()
}, (table) => [
	foreignKey({
		name: 'fk_html_templates_instance',
		columns: [table.org_id],
		foreignColumns: [InstanceTable.org_id]
	})
		.onDelete('cascade')
		.onUpdate('cascade'),
	uniqueIndex('uq_html_template_usage_lang_custom')
		.on(table.org_id, table.usage, table.lang, table.custom),
	primaryKey({
		name: 'pk_html_template',
		columns: [table.org_id, table.template_id]
	})
]
);
