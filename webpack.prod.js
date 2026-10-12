const { merge } = require("webpack-merge"),
	{ defineConfig } = require("webpack"),
	{ GenerateSW } = require("workbox-webpack-plugin"),
	packageJson = require("./package"),
	{
		entry,
		output,
		cssRule,
		fontRule,
		iconRule,
		providejQuery,
		createIndexHtml,
		extractCss,
		config,
	} = require("./webpack.common");

module.exports = merge(
	config,
	defineConfig({
		mode: "production",

		// Use default entry
		entry,

		// Use default output with chunk hash in file names
		output: merge(output, {
			hashDigestLength: 6,
			filename: "[name]-[chunkhash].js",
			cssFilename: "[name]-[chunkhash].css",
			assetModuleFilename: "[name]-[contenthash][ext]",
		}),

		module: {
			rules: [
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
			extractCss,
			createIndexHtml,
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
	}),
);
