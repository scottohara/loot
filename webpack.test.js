const	webpack = require("webpack"),
			{ merge } = require("webpack-merge"),
			path = require("path"),
			{
				providejQuery,
				config
			} = require("./webpack.common");

module.exports = merge(config, {
	module: {
		rules: [
			{
				test: /\.(?:less|css)$/u,
				loader: "ignore-loader"
			}
		]
	},
	resolve: {
		alias: {
			"~": [
				path.resolve(__dirname, "src"),
				path.resolve(__dirname, "spec", "public")
			]
		},
		fallback: {
			"process/browser": require.resolve("process/browser.js")
		}
	},
	devtool: "inline-source-map",
	plugins: [
		new webpack.ProvidePlugin({
			process: "process/browser"
		}),

		providejQuery
	]
});