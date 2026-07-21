import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
	test: {
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			// .vue files are excluded: this suite only unit-tests plain JS (composables/utils),
			// and the coverage remapper can't parse Vue SFC template syntax anyway
			include: ['src/**/*.js'],
		},
	},
});
