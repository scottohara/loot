const common = require("./karma.common"),
			webpack = require("./webpack.coverage");

module.exports = config => {
	config.set(Object.assign(common, {
		/*
		 * Preprocess matching files before serving them to the browser
		 * available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		 */
		preprocessors: {
			"spec/public/index.js": "webpack"
		},

		// Webpack configuration
		webpack,

		/*
		 * Test results reporter to use
		 * possible values: 'dots', 'progress'
		 * available reporters: https://npmjs.org/browse/keyword/karma-reporter
		 */
		reporters: ["mocha", "coverage-istanbul"],

		coverageIstanbulReporter: {
			reports: ["html", "text", "text-summary", "lcovonly"],
			dir: "coverage",
			fixWebpackSourcePaths: true,
			"report-config": {
				html: {subdir: "frontend"},
				lcovonly: {file: "frontend/lcov.info"}
			}
		},

		// Enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		/*
		 * Start these browsers
		 * available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		 */
		browsers: ["ChromeHeadless"],

		/*
		 * Continuous Integration mode
		 * if true, Karma captures browsers, runs the tests and exits
		 */
		singleRun: true
	}));
};
