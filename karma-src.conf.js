module.exports = config => {
	config.set({

		// Base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: "",

		// Frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ["mocha", "chai-as-promised", "chai-sinon"],

		// List of files / patterns to load in the browser
		files: [

			// Vendor scripts to include (but not watch)
			{
				pattern: "node_modules/jquery/dist/jquery.js",
				watched: false
			},
			{
				pattern: "node_modules/bootstrap/dist/js/bootstrap.js",
				watched: false
			},
			{
				pattern: "node_modules/angular/angular.js",
				watched: false
			},
			{
				pattern: "node_modules/@uirouter/core/_bundles/ui-router-core.min.js",
				watched: false
			},
			{
				pattern: "node_modules/@uirouter/angularjs/release/ui-router-angularjs.min.js",
				watched: false
			},
			{
				pattern: "node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js",
				watched: false
			},
			{
				pattern: "node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js",
				watched: false
			},
			{
				pattern: "node_modules/moment/moment.js",
				watched: false
			},
			{
				pattern: "node_modules/angular-mocks/angular-mocks.js",
				watched: false
			},

			// Source files
			"src/!(loot)/*.js",
			"src/!(loot)/**/*.js",
			"src/loot/loot.js",
			"src/loot/**/*.js",
			"src/**/views/*.html",

			/**
			 * Test files
			 */

			// Mock modules
			"spec/public/mocks/!(loot)/*.js",

			// Mock base providers (eg. resolves)
			"spec/public/mocks/!(loot)/**/providers/*.js",

			// Mocks
			"spec/public/mocks/!(loot)/**/*.js",

			// LootMocks module
			"spec/public/mocks/loot.js",

			// LootMocks helpers
			"spec/public/mocks/loot/*.js",

			// Specs
			"spec/public/**/*.js"
		],

		// List of files to exclude
		exclude: [
			"spec/public/**/views/*.js"
		],

		// Preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"**/src/**/views/*.html": ["ng-html2js"],
			"**/src/**/*.js": ["coverage"],
			"**/spec/public/**/*.js": ["coverage"]
		},

		ngHtml2JsPreprocessor: {
			stripPrefix: "src/"
		},

		// Test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ["mocha", "coverage"],

		mochaReporter: {
			showDiff: true
		},

		coverageReporter: {
			instrumenters: {
				isparta: require("isparta")
			},
			instrumenter: {
				"**/src/**/*.js": "isparta",
				"**/spec/public/**/*.js": "isparta"
			},
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
