import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
	resolve: {
		alias: {
			'@': resolve(import.meta.dirname, './src'),
		},
	},
	build: {
		minify: true, // set to false to make source code readable
		rollupOptions: {
			input: {
				popup: resolve(import.meta.dirname, 'index.popup.html'),
				stats: resolve(import.meta.dirname, 'index.stats.html'),
				options: resolve(import.meta.dirname, 'index.options.html'),
				background: resolve(import.meta.dirname, 'src/background.js'),
			},
			output: {
				// the background script's manifest.json reference needs a fixed, non-hashed path
				entryFileNames: (chunkInfo) =>
					chunkInfo.name === 'background' ? 'js/background.js' : 'assets/[name]-[hash].js',
			},
		},
	},
});
