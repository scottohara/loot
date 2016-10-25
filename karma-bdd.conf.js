module.exports = config => {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: "",

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ["mocha", "chai-as-promised", "chai-sinon"],

		// list of files / patterns to load in the browser
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
				pattern: "node_modules/angular-ui-router/release/angular-ui-router.js",
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

			// lootMocks module
			"spec/public/mocks/loot.js",

			// lootMocks helpers
			"spec/public/mocks/loot/*.js",

			// Specs
			"spec/public/**/*.js"
		],

		// list of files to exclude
		exclude: [
			"spec/public/**/views/*.js"
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			"**/src/**/views/*.html": ["ng-html2js"]
		},

		ngHtml2JsPreprocessor: {
			stripPrefix: "src/"
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ["mocha"],

		mochaReporter: {
			showDiff: true
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
