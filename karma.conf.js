const webpack = require("./webpack.coverage.js");

module.exports = config => {
	config.set({

		// Base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: "",

		// Frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ["mocha", "chai-as-promised", "chai-sinon"],

		// List of files / patterns to load in the browser
		files: [
			"spec/public/index.js"
		],

		// Preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"spec/public/index.js": "webpack"
		},

		// Webpack configuration
		webpack,

		// Test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ["mocha", "coverage"],

		mochaReporter: {
			showDiff: true
		},

		coverageReporter: {
			reporters: [
				{type: "html", dir: "coverage"},
				{type: "text"},
				{type: "text-summary"},
				{type: "lcovonly", dir: "coverage"}
			],
			subdir: "frontend"
		},

		// Web server port
		port: 9876,

		// Enable / disable colors in the output (reporters and logs)
		colors: true,

		// Level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: "INFO",

		// Enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// Start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ["ChromeHeadless"],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true
	});
};
