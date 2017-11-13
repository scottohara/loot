const config = require("./webpack.test");

// Add instrumentation to *.js files
config.module.rules.push({
	test: /\.js$/,
	loader: "istanbul-instrumenter-loader",
	options: {
		esModules: true
	},
	exclude: /node_modules/
});

module.exports = config;