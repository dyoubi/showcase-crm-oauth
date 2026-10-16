import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		projects: [
			'packages/*/vitest.config.{ts,js}'
		],
		reporters: [
			'default',
			[
				'junit',
				{ suiteName: '@ring/oauth' }
			]
		],
		outputFile: {
			junit: 'coverage/junit-report.xml'
		},
		coverage: {
			provider: 'istanbul' // or 'v8'
		}
	},
});