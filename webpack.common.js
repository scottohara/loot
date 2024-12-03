const path = require("path"),
	webpack = require("webpack"),
	MiniCssExtractPlugin = require("mini-css-extract-plugin"),
	HtmlWebpackPlugin = require("html-webpack-plugin"),
	CopyWebpackPlugin = require("copy-webpack-plugin");

// Default entry
const entry = {
		app: "~/loot",
	},
	// Default output
	output = {
		path: path.resolve(__dirname, "public"),
		assetModuleFilename: "[name][ext]",
		clean: true,
	},
	// Rule for *.ts processing
	tsRule = {
		test: /\.ts$/v,
		loader: "ts-loader",
	},
	// Rule for *.css processing
	cssRule = {
		test: /\.css$/v,
		use: [MiniCssExtractPlugin.loader, "css-loader"],
	},
	// Rule for font processing
	fontRule = {
		test: /\.(?:ttf|woff|woff2|eot|svg)$/v,
		type: "asset/resource",
		generator: {
			filename: "fonts/[name][ext]",
		},
	},
	// Rule for *.ico processing
	iconRule = {
		test: /\.ico$/v,
		type: "asset/resource",
	},
	// Rule for *.html processing
	htmlRule = {
		test: /\.html$/v,
		include: /views/v,
		use: [
			{
				loader: "ngtemplate-loader",
				options: {
					// Strip path prefixes up to (and including) 'src/'
					relativeTo: "src/",
				},
			},
			{
				loader: "html-loader",
				options: {
					sources: {
						list: [
							"...",
							{
								attribute: "typeahead-template-url",
								type: "src",
							},
						],
					},
					esModule: false,
				},
			},
		],
	},
	/*
	 * Exposes a global jQuery object (Bootstrap expects this global to exist)
	 * window.jQuery is needed to prevent Angular from using jqLite
	 */
	providejQuery = new webpack.ProvidePlugin({
		$: "jquery",
		jQuery: "jquery",
		"window.jQuery": "jquery",
	}),
	// Creates index.html with the bundled resources
	createIndexHtml = new HtmlWebpackPlugin(),
	// Copies static resources to the build directory
	copyStaticAssets = new CopyWebpackPlugin({
		patterns: [
			{
				from: "*.html",
				context: "./src",
				globOptions: { ignore: ["index.html"] },
			},
			{ from: "robots.txt", context: "./src" },
		],
	}),
	// Default config
	config = {
		mode: "development",

		// Ensure that the context is the directory where the webpack.*.js config file is
		context: path.resolve(__dirname),

		// Default rules for all environments
		module: {
			rules: [tsRule, htmlRule],
		},

		// Default resolve paths
		resolve: {
			alias: {
				"~": path.resolve(__dirname, "src"),
			},
			extensions: [".ts", "..."],
		},

		optimization: {
			splitChunks: {
				chunks: "all",
				minSize: 0,
				cacheGroups: {
					defaultVendors: {
						name: "vendor",
						test: /\/node_modules\//v,
					},
				},
			},
			runtimeChunk: "single",
		},

		// Abort on first error
		bail: true,
	};

function extractCss(options = undefined) {
	return new MiniCssExtractPlugin(options);
}

module.exports = {
	entry,
	output,
	cssRule,
	fontRule,
	iconRule,
	providejQuery,
	extractCss,
	createIndexHtml,
	copyStaticAssets,
	config,
};
