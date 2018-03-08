const webpack = require("webpack"),
			merge = require("webpack-merge"),
			LiveReloadPlugin = require("webpack-livereload-plugin"),
			OpenBrowserPlugin = require("open-browser-webpack-plugin"),
			{
				entry,
				output,
				lessRule,
				cssRule,
				fontRule,
				iconRule,
				defineEnvironment,
				cleanBuildDirectory,
				providejQuery,
				separateBundles,
				extractAppCss,
				extractVendorCss,
				createIndexHtml,
				generateServiceWorker,
				config
			} = require("./webpack.common");

const	appCss = extractAppCss(),
			vendorCss = extractVendorCss();

module.exports = merge(config, {
	// Use default entry
	entry,

	// Use default output, with no hash in file names
	output: merge(output, {
		filename: "[name].js",

		// Include detailed path info to assist with debugging
		pathinfo: true
	}),

	module: {
		rules: [
			lessRule(appCss),
			cssRule(vendorCss),
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
		// Use module names instead of numbers to assist with debugging
		new webpack.NamedModulesPlugin(),

		defineEnvironment("development"),
		providejQuery,
		cleanBuildDirectory,
		separateBundles,
		vendorCss,
		appCss,
		createIndexHtml,

		// No-op service worker
		generateServiceWorker({handleFetch: false}),

		// Live reload when in watch mode
		new LiveReloadPlugin({
			appendScriptTag: true
		}),

		// Open a browser automatically
		new OpenBrowserPlugin()
	]
});