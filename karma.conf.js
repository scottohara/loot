module.exports = function(config) {
	"use strict";

	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: "",

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ["mocha", "chai", "sinon", "sinon-chai"],

		// list of files / patterns to load in the browser
		files: [
			// TODO - ideally this would be a karma-chai-as-promised package, included in frameworks above
			{
				pattern: "node_modules/chai-as-promised/lib/chai-as-promised.js",
				watched: false
			},
			
			// Vendor script to include (but not watch)
			{
				pattern: "public/vendor*.js",
				watched: false
			},
			{
				pattern: "node_modules/angular-mocks/angular-mocks.js",
				watched: false
			},
			{
				pattern: "public/*.js.map",
				included: false
			},

			// Source files
			"public/app*.js",
			"src/**/views/*.html",

			// Test files
			"spec/public/mocks/!(loot)/*.js",									// Mock modules
			"spec/public/mocks/!(loot)/**/providers/*.js",		// Mock base providers (eg. resolves)
			"spec/public/mocks/!(loot)/**/*.js",							// Mocks
			"spec/public/mocks/loot.js",											// lootMocks module
			"spec/public/mocks/loot/*.js",										// lootMocks helpers
			"spec/public/**/*.js"															// Specs
		],

		// list of files to exclude
		exclude: [
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"**/src/**/views/*.html": ["ng-html2js"],
			"**/public/app*.js": ["sourcemap", "coverage"],
			"**/public/vendor*.js": ["sourcemap"]
		},

		ngHtml2JsPreprocessor: {
			stripPrefix: "src/"
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ["mocha", "coverage"],

		coverageReporter: {
			reporters: [
				{type: "text"},
				{type: "text-summary"},
				{type: "html", dir: "coverage"},
				{type: "lcovonly", dir: "coverage"},
			],
			subdir: "frontend"
		},

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: "INFO",

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ["Chrome"],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true
	});
};
