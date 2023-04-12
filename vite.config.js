import { defineConfig } from 'vite';
import { resolve } from 'path';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [
		vue(),
		VueI18nPlugin({
      include: resolve(__dirname, './public/_locales/**/messages.json'),
			strictMessage: false,
			escapeHtml: true,
    })
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
