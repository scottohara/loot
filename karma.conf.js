// Karma configuration
// Generated on Tue Jul 29 2014 15:18:20 GMT+1000 (EST)
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
			
			// Bower components to include (but not watch)
			{
				pattern: "public/bower_components/angular/angular.min.js",
				watched: false
			},
			{
				pattern: "public/bower_components/angular-ui-router/release/angular-ui-router.min.js",
				watched: false
			},
			{
				pattern: "public/bower_components/angular-bootstrap/ui-bootstrap.min.js",
				watched: false
			},
			{
				pattern: "public/bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
				watched: false
			},
			{
				pattern: "public/bower_components/less/dist/less-1.6.2.min.js",
				watched: false
			},
			{
				pattern: "public/bower_components/jquery/dist/jquery.js",
				watched: false
			},
			{
				pattern: "public/bower_components/moment/min/moment.min.js",
				watched: false
			},
			{
				pattern: "public/bower_components/angular-mocks/angular-mocks.js",
				watched: false
			},

			// Source files
			"public/!(bower_components)/*.js",
			"public/!(bower_components)/**/*.js",

			// Test files
			"test/public/mocks/!(loot)/*.js",
			"test/public/mocks/!(loot)/**/*.js",
			"test/public/mocks/loot/*.js",
			"test/public/**/*.js"
		],

		// list of files to exclude
		exclude: [
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"**/public/!(bower_components)/**/*.js": ["jshint", "coverage"]
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ["mocha", "coverage"],

		coverageReporter: {
			reporters: [
				{type: "text"},
				{type: "text-summary"}
			],
			dir: ".",
			subdir: "."
		},

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: "INFO",

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ["Chrome"],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false
	});
};
