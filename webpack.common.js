const path = require("path"),
			webpack = require("webpack"),
			ExtractTextPlugin = require("extract-text-webpack-plugin"),
			CleanWebpackPlugin = require("clean-webpack-plugin"),
			HtmlWebpackPlugin = require("html-webpack-plugin"),
			CopyWebpackPlugin = require("copy-webpack-plugin"),
			WorkboxWebpackPlugin = require("workbox-webpack-plugin"),
			packageJson = require("./package"),

			// Default entry
			entry = {
				app: "loot",
				vendor: [
					"jquery",
					"bootstrap",
					"angular",
					"@uirouter/angularjs",
					"angular-ui-bootstrap",
					"date-fns/esm"
				]
			},

			// Default output
			output = {
				path: path.resolve(__dirname, "public")
			},

			// Rule for font processing
			fontRule = {
				test: /\.(ttf|woff|woff2|eot|svg)$/,
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
				test: /\.ico$/,
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
				test: /\.html$/,
				include: /views/,
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
							attrs: [":typeahead-template-url"]
						}
					}
				]
			},

			// Cleans the build directory
			cleanBuildDirectory = new CleanWebpackPlugin(["./public"]),

			/*
			 * Exposes a global jQuery object (Bootstrap expects this global to exist)
			 * window.jQuery is needed to prevent Angular from using jqLite
			 */
			providejQuery = new webpack.ProvidePlugin({
				$: "jquery",
				jQuery: "jquery",
				"window.jQuery": "jquery"
			}),

			/*
			 * Ensures all vendor dependencies are bundled separately to app code, and that the webpack manifest is kept
			 * separate so that changes to app code don't change the hash of the vendor chunk (or vice versa)
			 */
			separateBundles = new webpack.optimize.CommonsChunkPlugin({
				names: [
					"vendor",
					"manifest"
				],
				minChunks: Infinity
			}),

			// Creates index.html with the bundled resources
			createIndexHtml = new HtmlWebpackPlugin({template: "./src/index.html"}),

			// Copies static resources to the build directory
			copyStaticAssets = new CopyWebpackPlugin([
				"*.html",
				"robots.txt"
			], {
				context: "./src",
				ignore: ["index.html"]
			}),

			// Default config
			config = {
				// Ensure that the context is the directory where the webpack.*.js config file is
				context: path.resolve(__dirname),

				// Default rules for all environments
				module: {
					rules: [htmlRule]
				},

				// Default resolve paths
				resolve: {
					modules: [
						path.resolve(__dirname, "src"),
						path.resolve(__dirname, "node_modules")
					]
				},

				// Abort on first error
				bail: true
			};

// Rule for *.less processing
function lessRule(extractor, {minimize} = {minimize: false}) {
	return {
		test: /\.less$/,
		use: extractor.extract({
			use: [
				{
					loader: "css-loader",
					options: {
						// Apply the next loader (less-loader) to any @imports
						importLoaders: 1,

						// Minify using cssnano
						minimize,

						// Generate sourcemaps
						sourceMap: true
					}
				},
				{
					loader: "less-loader",
					options: {
						// Generate sourcemaps
						sourceMap: true
					}
				}
			]
		})
	};
}

// Rule for *.css processing
function cssRule(extractor) {
	return {
		test: /\.css$/,
		use: extractor.extract({
			loader: "css-loader",
			options: {
				// Generate sourcemaps
				sourceMap: true
			}
		})
	};
}

// Ensure that the environment is set
function defineEnvironment(env) {
	return new webpack.DefinePlugin({"process.env.NODE_ENV": JSON.stringify(`${env}`)});
}

/*
 * Creates external *.css files from any imported styles (e.g. import "./my-styles.css";)
 * Note: HtmlWebpackPlugin injects <link> tags in the order listed in the plugins array, so vendor must be first
 */
function extractAppCss(hashFilename) {
	return new ExtractTextPlugin({
		filename: hashFilename ? "app-[contenthash:6].css" : "app.css",
		disable: false,
		allChunks: true
	});
}

function extractVendorCss(hashFilename) {
	return new ExtractTextPlugin({
		filename: hashFilename ? "vendor-[contenthash:6].css" : "vendor.css",
		disable: false,
		allChunks: true
	});
}

// Generate a service worker to precache static assets
function generateServiceWorker({handleFetch} = {handleFetch: true}) {
	return new WorkboxWebpackPlugin({
		swDest: "public/service-worker.js",
		globDirectory: "public",
		globPatterns: ["**/*.{html,js,css,ico}", "fonts/*"],
		cacheId: packageJson.name,
		skipWaiting: true,
		clientsClaim: true,
		modifyUrlPrefix: {public: ""},
		dontCacheBustUrlsMatching: /.*\.(js|css|ico|ttf|woff|woff2|eot|svg)$/,
		handleFetch
	});
}

module.exports = {
	entry,
	output,
	lessRule,
	cssRule,
	fontRule,
	iconRule,
	defineEnvironment,
	cleanBuildDirectory,
	providejQuery,
	separateBundles,
	extractAppCss,
	extractVendorCss,
	createIndexHtml,
	copyStaticAssets,
	generateServiceWorker,
	config
};