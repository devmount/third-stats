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
	},
	productionSourceMap: false,
	publicPath: "",
}
