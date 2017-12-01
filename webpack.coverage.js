const config = require("./webpack.test");

// Add instrumentation to *.ts and *.js files
config.module.rules.push({
	test: /\.(t|j)s$/,
	loader: "istanbul-instrumenter-loader",
	options: {
		esModules: true
	},
	exclude: /node_modules/,
	enforce: "post"
});

module.exports = config;