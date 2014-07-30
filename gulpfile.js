var gulp = require('gulp'),
		path = require('path'),
		karma = require('karma').server;

// Run client-side unit tests
gulp.task('test', function() {
	"use strict";

	karma.start({configFile: path.resolve("./karma.conf.js")}, function(exitCode) {
		process.exit(exitCode);
	});
});

// Default tasks
gulp.task('default', ['test']);
