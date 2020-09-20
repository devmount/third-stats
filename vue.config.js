const webpack = require('webpack')
const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

module.exports = {
	pages: {
		popup: {
			entry: './src/popup.js',
			template: './public/popup.html'
		},
		stats: {
			entry: './src/stats.js',
			template: './public/stats.html'
		},
	},
	configureWebpack: {
		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					PACKAGE_VERSION: '"' + version + '"'
				}
			})
		]
	},
	publicPath: '',
}
