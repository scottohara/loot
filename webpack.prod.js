const { CleanWebpackPlugin } = require("clean-webpack-plugin"),
			{ merge } = require("webpack-merge"),
			{
				entry,
				output,
				lessRule,
				cssRule,
				fontRule,
				iconRule,
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
		providejQuery,

		// Cleans the build directory
		new CleanWebpackPlugin(),

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