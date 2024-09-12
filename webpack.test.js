const webpack = require("webpack"),
	{ merge } = require("webpack-merge"),
	path = require("path"),
	{ providejQuery, config } = require("./webpack.common");

module.exports = merge(config, {
	module: {
		rules: [
			{
				test: /\.css$/u,
				loader: "ignore-loader",
			},
		],
	},
	resolve: {
		alias: {
			"~": [path.resolve(__dirname, "src")],
		},
		fallback: {
			"process/browser": require.resolve("process/browser.js"),
		},
	},
	devtool: "inline-source-map",
	plugins: [
		new webpack.ProvidePlugin({
			process: "process/browser",
		}),

		providejQuery,
	],
});
