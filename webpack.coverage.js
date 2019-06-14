const config = require("./webpack.test");

// Add instrumentation to *.ts and *.js files
config.module.rules.push({
	test: /\.(?:t|j)s$/u,
	loader: "istanbul-instrumenter-loader",
	options: {
		esModules: true
	},
	exclude: /node_modules/u,
	enforce: "post"
});

module.exports = config;