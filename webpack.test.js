const merge = require("webpack-merge"),
			{
				defineEnvironment,
				providejQuery,
				config
			} = require("./webpack.common.js");

module.exports = merge(config, {
	module: {
		rules: [
			{
				test: /\.(less|css)$/,
				loader: "ignore-loader"
			}
		]
	},
	devtool: "inline-source-map",
	plugins: [
		defineEnvironment("test"),
		providejQuery
	]
});