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

	devServer: {
		open: true,
		overlay: true,
		proxy: {
			"/": "http://localhost:5000"
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