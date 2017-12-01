const path = require("path"),
			merge = require("webpack-merge"),
			{
				defineEnvironment,
				providejQuery,
				config
			} = require("./webpack.common");

module.exports = merge(config, {
	module: {
		rules: [
			{
				test: /\.(less|css)$/,
				loader: "ignore-loader"
			}
		]
	},
	resolve: {
		modules: [
			path.resolve(__dirname, "spec", "public")
		]
	},
	devtool: "inline-source-map",
	plugins: [
		defineEnvironment("test"),
		providejQuery
	]
});