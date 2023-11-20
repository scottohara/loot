const { merge } = require("webpack-merge"),
	{ GenerateSW } = require("workbox-webpack-plugin"),
	packageJson = require("./package"),
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
		config,
	} = require("./webpack.common");

module.exports = merge(config, {
	mode: "production",

	// Use default entry
	entry,

	// Use default output with chunk hash in file names
	output: merge(output, {
		hashDigestLength: 6,
		filename: "[name]-[chunkhash].js",
		assetModuleFilename: "[name]-[contenthash][ext]",
	}),

	module: {
		rules: [
			lessRule,
			cssRule,
			merge(fontRule, {
				generator: {
					// Include hash in file names
					filename: "fonts/[name]-[contenthash][ext]",
				},
			}),
			iconRule,
		],
	},

	// Extract full, separate source maps
	devtool: "source-map",

	plugins: [
		providejQuery,
		extractCss({ filename: "[name]-[chunkhash].css" }),
		createIndexHtml,
		copyStaticAssets,
		new GenerateSW({
			cacheId: packageJson.name,
			skipWaiting: true,
			clientsClaim: true,
		}),
	],

	// Fail if any chunks exceed performance budget
	performance: {
		hints: "error",
		maxEntrypointSize: 900000,
		maxAssetSize: 600000,
	},
});
