const path = require("path");

module.exports = {
	mode: "development",
	resolve: {
		extensions: [
			".ts",
			".js"
		],
		modules: [
			path.resolve(__dirname, "support"),
			path.resolve(__dirname, "..", "node_modules")
		]
	},
	module: {
		rules: [
			{
				test: /\.ts$/u,
				loader: "ts-loader"
			}
		]
	}
};