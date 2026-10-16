import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		name:'@ring-oauth/application',
		include:['src/**/*.spec.ts'],
	},
});