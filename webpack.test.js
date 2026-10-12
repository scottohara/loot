const { defineConfig, ProvidePlugin } = require("webpack"),
	{ merge } = require("webpack-merge"),
	{ providejQuery, config } = require("./webpack.common");

module.exports = merge(
	config,
	defineConfig({
		module: {
			rules: [
				{
					test: /\.css$/v,
					loader: "ignore-loader",
				},
			],
		},
		resolve: {
			tsconfig: true,
			fallback: {
				"process/browser": require.resolve("process/browser.js"),
			},
		},
		devtool: "inline-source-map",
		plugins: [
			new ProvidePlugin({
				process: "process/browser",
			}),

			providejQuery,
		],
	}),
);
