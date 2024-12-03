const config = require("./webpack.test");

// Add instrumentation to *.ts and *.js files
config.module.rules.push({
	test: /\.(?:t|j)s$/v,
	loader: "@jsdevtools/coverage-istanbul-loader",
	options: {
		esModules: true,
	},
	exclude: /node_modules/v,
	enforce: "post",
});

module.exports = config;
