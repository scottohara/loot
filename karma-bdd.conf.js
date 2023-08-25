const common = require("./karma.common"),
			webpack = require("./webpack.test");

module.exports = config => {
	config.set(Object.assign(common, {
		/*
		 * Preprocess matching files before serving them to the browser
		 * available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		 */
		preprocessors: {
			"src/index.test.js": ["webpack", "sourcemap"]
		},

		// Webpack configuration
		webpack,

		/*
		 * Test results reporter to use
		 * possible values: 'dots', 'progress'
		 * available reporters: https://npmjs.org/browse/keyword/karma-reporter
		 */
		reporters: ["mocha"],

		// Enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		/*
		 * Start these browsers
		 * available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		 */
		browsers: ["Chrome"],

		/*
		 * Continuous Integration mode
		 * if true, Karma captures browsers, runs the tests and exits
		 */
		singleRun: false,
		restartOnFileChange: true
	}));
};
