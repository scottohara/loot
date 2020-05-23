module.exports = {
	// Base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: "",

	/*
	 * Frameworks to use
	 * available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	 */
	frameworks: ["mocha", "chai-sinon"],

	// List of files / patterns to load in the browser
	files: [
		"spec/public/index.js"
	],

	mochaReporter: {
		showDiff: true
	},

	// Web server port
	port: 9876,

	// Enable / disable colors in the output (reporters and logs)
	colors: true,

	/*
	 * Level of logging
	 * possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
	 */
	logLevel: "INFO"
};