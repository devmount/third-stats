import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [
		vue(),
	],
	define: {
		APP_VERSION: JSON.stringify(process.env.npm_package_version),
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	build: {
		minify: true, // set to false to make source code readable
		rollupOptions: {
			input: {
				popup: resolve(__dirname, 'index.popup.html'),
				stats: resolve(__dirname, 'index.stats.html'),
				options: resolve(__dirname, 'index.options.html'),
			},
		},
	},
});
