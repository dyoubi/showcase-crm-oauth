import { defineConfig } from 'drizzle-kit';

import { config } from 'dotenv';

config({ path: '.env', override: true });

export default defineConfig({
	out: './drizzle',
	schema: './src/drizzle/schema/**',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.PG_DATABASE_URL!,
	},
	schemaFilter: [
		'instances',
		'branding',
		'authentication',
	],
	migrations: {
		schema: '__drizzle'
	},
	introspect: {
		casing: 'preserve',
	}
});