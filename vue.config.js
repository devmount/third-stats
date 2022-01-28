const path = require('path');

process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
	pages: {
		popup: {
			entry: "./src/popup.js",
			template: "./public/popup.html"
		},
		stats: {
			entry: "./src/stats.js",
			template: "./public/stats.html"
		},
		options: {
			entry: "./src/options.js",
			template: "./public/options.html"
		},
	},
	configureWebpack: {
		performance: {
			maxEntrypointSize: 1024000,
			maxAssetSize: 1024000
		},
		output: {
			filename: "js/[name].js",
			chunkFilename: "js/[name].bundle.js",
		},
		resolve: {
			alias: {
				'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
			}
		},
		optimization: {
			minimize: true // set this to false to disable obfuscation
		},
		module: {
			rules: [
				// for i18n resources (json/json5/yaml)
				{
					test: /\.(json5?|ya?ml)$/, // target json, json5, yaml and yml files
					type: 'javascript/auto',
					// Use `Rule.include` to specify the files of locale messages to be pre-compiled
					include: [
						path.resolve(__dirname, './public/_locales'),
					],
					loader: '@intlify/vue-i18n-loader'
				},
			]
		},
	},
	productionSourceMap: false,
	publicPath: "",
}
