const { merge } = require("webpack-merge"),
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
	// Use default entry
	entry,

	// Use default output, with no hash in file names
	output,

	module: {
		rules: [
			lessRule,
			cssRule,
			fontRule,
			iconRule
		]
	},

	// Eval source maps
	devtool: "eval-source-map",

	devServer: {
		open: true,
		proxy: {
			"/": "http://localhost:3000"
		}
	},

	plugins: [
		providejQuery,
		extractCss(),
		createIndexHtml,
		copyStaticAssets,
		generateServiceWorker
	]
});