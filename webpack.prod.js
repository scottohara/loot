const webpack = require("webpack"),
			{ merge } = require("webpack-merge"),
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
	mode: "production",

	// Use default entry
	entry,

	// Use default output with chunk hash in file names
	output: merge(output, {
		filename: "[name]-[chunkhash:6].js"
	}),

	module: {
		rules: [
			lessRule,
			cssRule,
			fontRule,
			iconRule
		]
	},

	// Extract full, separate source maps
	devtool: "source-map",

	plugins: [
		/*
		 * Ensure that bundles only change when necessary by using a hash of the content for the module id
		 * instead of a numbers derived from the order of dependencies in the graph
		 */
		new webpack.HashedModuleIdsPlugin(),

		providejQuery,
		cleanBuildDirectory,
		extractCss(true),
		createIndexHtml,
		copyStaticAssets,
		generateServiceWorker
	],

	// Fail if any chunks exceed performance budget
	performance: {
		hints: "error",
		maxEntrypointSize: 900000,
		maxAssetSize: 600000
	}
});