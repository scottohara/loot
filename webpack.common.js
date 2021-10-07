const path = require("path"),
			webpack = require("webpack"),
			MiniCssExtractPlugin = require("mini-css-extract-plugin"),
			HtmlWebpackPlugin = require("html-webpack-plugin"),
			CopyWebpackPlugin = require("copy-webpack-plugin"),
			{ GenerateSW } = require("workbox-webpack-plugin"),
			packageJson = require("./package");

// Default entry
const	entry = {
				app: "loot"
			},

			// Default output
			output = {
				path: path.resolve(__dirname, "public")
			},

			// Rule for *.ts processing
			tsRule = {
				test: /\.ts$/u,
				loader: "ts-loader"
			},

			// Rule for *.less processing
			lessRule = {
				test: /\.less$/u,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							// Apply the next loader (less-loader) to any @imports
							importLoaders: 1
						}
					},
					"less-loader"
				]
			},

			// Rule for *.css processing
			cssRule = {
				test: /\.css$/u,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader"
				]
			},

			// Rule for font processing
			fontRule = {
				test: /\.(?:ttf|woff|woff2|eot|svg)$/u,
				loader: "url-loader",
				options: {
					// Use file-loader for anything bigger than 1 byte
					limit: 1,

					// Include a hash in the file name
					name: "fonts/[name]-[hash:6].[ext]"
				}
			},

			// Rule for *.ico processing
			iconRule = {
				test: /\.ico$/u,
				loader: "url-loader",
				options: {
					// Use file-loader for anything bigger than 1 byte
					limit: 1,

					// Include a hash in the file name
					name: "[name]-[hash:6].[ext]"
				}
			},

			// Rule for *.html processing
			htmlRule = {
				test: /\.html$/u,
				include: /views/u,
				use: [
					{
						loader: "ngtemplate-loader",
						options: {
							// Strip path prefixes up to (and including) 'src/'
							relativeTo: "src/"
						}
					},
					{
						loader: "html-loader",
						options: {
							attributes: {
								list: [
									"...",
									{ attribute: "typeahead-template-url", type: "src" }
								]
							}
						}
					}
				]
			},

			/*
			 * Exposes a global jQuery object (Bootstrap expects this global to exist)
			 * window.jQuery is needed to prevent Angular from using jqLite
			 */
			providejQuery = new webpack.ProvidePlugin({
				$: "jquery",
				jQuery: "jquery",
				"window.jQuery": "jquery"
			}),

			// Creates index.html with the bundled resources
			createIndexHtml = new HtmlWebpackPlugin({ scriptLoading: "defer" }),

			// Copies static resources to the build directory
			copyStaticAssets = new CopyWebpackPlugin({
				patterns: [
					{ from: "*.html", context: "./src", globOptions: { ignore: ["index.html"] } },
					{ from: "robots.txt", context: "./src" }
				]
			}),

			// Generate a service worker to precache static assets
			generateServiceWorker = new GenerateSW({
				cacheId: packageJson.name,
				skipWaiting: true,
				clientsClaim: true
			}),

			// Default config
			config = {
				mode: "development",

				// Ensure that the context is the directory where the webpack.*.js config file is
				context: path.resolve(__dirname),

				// Default rules for all environments
				module: {
					rules: [
						tsRule,
						htmlRule
					]
				},

				// Default resolve paths
				resolve: {
					extensions: [
						".ts",
						".js"
					],
					modules: [
						path.resolve(__dirname, "src"),
						path.resolve(__dirname, "node_modules")
					]
				},

				optimization: {
					// Remove in webpack 5
					moduleIds: "hashed",
					splitChunks: {
						chunks: "all",
						minSize: 0,
						cacheGroups: {
							app: {
								name: "app",
								priority: 10
							},
							vendor: {
								name: "vendor",
								test: /[\\/]node_modules[\\/]/u,
								priority: 20
							}
						}
					},
					runtimeChunk: "single"
				},

				// Abort on first error
				bail: true
			};

function extractCss(hashFilename) {
	return new MiniCssExtractPlugin({ filename: undefined === hashFilename ? "[name].css" : "[name]-[chunkhash:6].css" });
}

module.exports = {
	entry,
	output,
	lessRule,
	cssRule,
	fontRule,
	iconRule,
	providejQuery,
	extractCss,
	createIndexHtml,
	copyStaticAssets,
	generateServiceWorker,
	config
};