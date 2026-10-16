import {
	defineProject
} from 'vitest/config';

export default defineProject({
	test: {
		include: ['src/**/*.spec.ts'],
		exclude: ['./*.js'],
		reporters: ['default', 'junit'],
		outputFile: {
			junit: 'coverage/junit-report.xml'
		},
		coverage: {
			provider: 'istanbul' // or 'v8'
		}
	},
});