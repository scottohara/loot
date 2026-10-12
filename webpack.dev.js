const { merge } = require("webpack-merge"),
	{ defineConfig } = require("webpack"),
	{
		entry,
		output,
		cssRule,
		fontRule,
		iconRule,
		providejQuery,
		createIndexHtml,
		extractCss,
		config,
	} = require("./webpack.common");

module.exports = merge(
	config,
	defineConfig({
		// Use default entry
		entry: merge(entry, { "service-worker": "~/service-worker" }),

		// Use default output, with no hash in file names
		output,

		module: {
			rules: [cssRule, fontRule, iconRule],
		},

		// Eval source maps
		devtool: "eval-source-map",

		devServer: {
			open: true,
			proxy: [
				{
					context: ["/"],
					target: "http://localhost:3000",
				},
			],
		},

		plugins: [providejQuery, extractCss, createIndexHtml],
	}),
);
