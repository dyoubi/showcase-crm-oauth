export default defineConfig({
	test: {
		reporters: ['default', 'junit'],
		coverage: {
			provider: 'istanbul' // or 'v8'
		}
	},
});