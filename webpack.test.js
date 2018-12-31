const merge = require("webpack-merge"),
			path = require("path"),
			{
				providejQuery,
				config
			} = require("./webpack.common");

module.exports = merge(config, {
	module: {
		rules: [
			{
				test: /\.(less|css)$/u,
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
		providejQuery
	]
});