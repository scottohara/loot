const merge = require("webpack-merge"),
			LiveReloadPlugin = require("webpack-livereload-plugin"),
			OpenBrowserPlugin = require("open-browser-webpack-plugin"),
			{
				entry,
				output,
				lessRule,
				cssRule,
				fontRule,
				iconRule,
				cleanBuildDirectory,
				providejQuery,
				extractCss,
				createIndexHtml,
				copyStaticAssets,
				generateServiceWorker,
				config
			} = require("./webpack.common");

module.exports = merge(config, {
	// Use default entry
	entry,

	// Use default output, with no hash in file names
	output: merge(output, {
		filename: "[name].js"
	}),

	module: {
		rules: [
			lessRule,
			cssRule,
			merge(fontRule, {
				options: {
					// No hash in file names
					name: "fonts/[name].[ext]"
				}
			}),
			merge(iconRule, {
				options: {
					// No hash in file names
					name: "[name].[ext]"
				}
			})
		]
	},

	// Eval source maps
	devtool: "eval-source-map",

	plugins: [
		providejQuery,
		cleanBuildDirectory,
		extractCss(),
		createIndexHtml,
		copyStaticAssets,
		generateServiceWorker,

		// Live reload when in watch mode
		new LiveReloadPlugin({
			appendScriptTag: true
		}),

		// Open a browser automatically
		new OpenBrowserPlugin({ url: "http://localhost:5000" })
	]
});