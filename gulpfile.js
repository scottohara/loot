(function() {
	"use strict";
	
	var gulp = require("gulp"),
			karma = require("karma").server,
			karmaConfigFilePath = "./karma.conf.js";

	// Run JSHint & client-side unit tests
	gulp.task("tdd", function() {
		var configFile = require(karmaConfigFilePath),
				config,
				configParser = {
					set: function(configToParse) {
						config = configToParse;
					}
				};

		// Parse the karma.conf.js file
		configFile(configParser);

		// Remove coverage preprocessor
		Object.keys(config.preprocessors).forEach(function(fileSet) {
			config.preprocessors[fileSet] = config.preprocessors[fileSet].filter(function(preProcessor) {
				return "coverage" !== preProcessor;
			});
		});

		// Remove the coverage reporter
		config.reporters = config.reporters.filter(function(reporter) {
			return "coverage" !== reporter;
		});

		delete config.coverageReporter;

		karma.start(config, function(exitCode) {
			process.exit(exitCode);
		});
	});

	// Run JSHint, client-side unit tests & code coverage analysis
	gulp.task("test", function() {
		var path = require("path");

		karma.start({configFile: path.resolve(karmaConfigFilePath)}, function(exitCode) {
			process.exit(exitCode);
		});
	});

	// Default tasks
	gulp.task("default", ["tdd"]);
})();
