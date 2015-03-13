(function() {
	"use strict";
	
	var gulp = require("gulp"),
			concat = require("gulp-concat"),
			del = require("del"),
			size = require("gulp-size"),
			karma = require("karma").server,
			less = require("gulp-less"),
			minifyCss = require("gulp-minify-css"),
			path = require("path"),
			rev = require("gulp-rev"),
			sourceMaps = require("gulp-sourcemaps"),
			uglify = require("gulp-uglify"),
			util = require("gulp-util");

	/**
	 * Build
	 */

	// Build
	gulp.task("build", ["clean", "build:js", "build:css", "copy:assets"], function() {
		var inject = require("gulp-inject"),
				appAssets = gulp.src(["public/app*.js", "public/app*.css"], {read: false}),
				vendorAssets = gulp.src(["public/vendor*.js", "public/vendor*.css"], {read: false});

		return gulp.src("src/index.html")
			.pipe(inject(appAssets, {ignorePath: "public", name: "app"}))
			.pipe(inject(vendorAssets, {ignorePath: "public", name: "vendor"}))
			.pipe(gulp.dest("public"))
			.on("error", util.log);
	});

	// Clean
	gulp.task("clean", ["clean:js", "clean:css", "clean:assets"], function(cb) {
		del("public/index.html", cb);
	});

	// Build Javascript
	gulp.task("build:js", ["build:app:js", "build:vendor:js"]);

	// Clean Javascript
	gulp.task("clean:js", ["clean:app:js", "clean:vendor:js"]);

	// Build application Javascript
	gulp.task("build:app:js", ["clean:app:js"], function() {
		return gulp.src("src/**/*.js")
			.pipe(sourceMaps.init())
				.pipe(size({title: "app js (original)"}))
				.pipe(concat("app.js"))
				.pipe(uglify())
				.pipe(rev())
				.pipe(size({title: "app js (minified)"}))
				.pipe(size({title: "app js (gzipped)", gzip: true}))
			.pipe(sourceMaps.write("."))
			.pipe(gulp.dest("public"))
			.on("error", util.log);
	});

	// Clean application Javascript
	gulp.task("clean:app:js", function(cb) {
		del(["public/app*.js", "public/app*.js.map"], cb);
	});

	// Build vendor Javascript
	gulp.task("build:vendor:js", ["clean:vendor:js"], function() {
		return gulp.src([
			"node_modules/jquery/dist/jquery.min.js",
			"node_modules/bootstrap/dist/js/bootstrap.min.js",
			"node_modules/angular/angular.min.js",
			"node_modules/angular-ui-router/release/angular-ui-router.min.js",
			"node_modules/angular-bootstrap/dist/ui-bootstrap.min.js",
			"node_modules/angular-bootstrap/dist/ui-bootstrap-tpls.min.js",
			"node_modules/moment/min/moment.min.js"
		])
			.pipe(sourceMaps.init({loadMaps: true}))
				.pipe(concat("vendor.js"))
				.pipe(rev())
			.pipe(sourceMaps.write("."))
			.pipe(gulp.dest("public"))
			.on("error", util.log);
	});

	// Clean vendor Javascript
	gulp.task("clean:vendor:js", function(cb) {
		del(["public/vendor*.js", "public/vendor*.js.map"], cb);
	});

	// Build CSS
	gulp.task("build:css", ["build:app:css", "build:vendor:css"]);

	// Clean CSS
	gulp.task("clean:css", ["clean:app:css", "clean:vendor:css"]);

	// Build application CSS
	gulp.task("build:app:css", ["clean:app:css"], function() {
		return gulp.src("src/**/*.less")
			.pipe(sourceMaps.init())
				.pipe(less({paths: ["node_modules"]}))
				.pipe(size({title: "app css (original)"}))
				.pipe(concat("app.css"))
				.pipe(minifyCss())
				.pipe(rev())
				.pipe(size({title: "app css (minified)"}))
				.pipe(size({title: "app css (gzipped)", gzip: true}))
			.pipe(sourceMaps.write("."))
			.pipe(gulp.dest("public"))
			.on("error", util.log);
	});

	// Clean application CSS
	gulp.task("clean:app:css", function(cb) {
		del(["public/app*.css", "public/app*.css.map"], cb);
	});

	// Build vendor CSS
	gulp.task("build:vendor:css", ["clean:vendor:css"], function() {
		return gulp.src("node_modules/bootstrap/dist/css/bootstrap.min.css")
			.pipe(sourceMaps.init())
				.pipe(concat("vendor.css"))
				.pipe(rev())
			.pipe(sourceMaps.write("."))
			.pipe(gulp.dest("public"))
			.on("error", util.log);
	});

	// Clean vendor CSS
	gulp.task("clean:vendor:css", function(cb) {
		del(["public/vendor*.css", "public/vendor*.css.map"], cb);
	});

	// Copy static assets (HTML, icons, fonts etc.)
	gulp.task("copy:assets", ["copy:app:assets", "copy:vendor:assets"]);

	// Clean static assets
	gulp.task("clean:assets", ["clean:app:assets", "clean:vendor:assets"]);

	// Copy application static assets
	gulp.task("copy:app:assets", ["clean:app:assets"], function() {
		return gulp.src(["src/**/*.html", "!src/index.html", "src/favicon.ico", "src/robots.txt"])
			.pipe(gulp.dest("public"));
	});

	// Clean application static assets
	gulp.task("clean:app:assets", function(cb) {
		del(["public/**/*.html", "!public/index.html", "public/favicon.ico", "public/robots.txt"], cb);
	});

	// Copy vendor static assets
	gulp.task("copy:vendor:assets", ["clean:vendor:assets"], function() {
		return gulp.src("node_modules/bootstrap/fonts/**")
			.pipe(gulp.dest("public/fonts"));
	});

	// Clean vendor static assets
	gulp.task("clean:vendor:assets", function(cb) {
		del("public/fonts", cb);
	});

	/**
	 * Test
	 */

	// Run JSHint
	gulp.task("jshint", function() {
		var jshint = require("gulp-jshint");

		return gulp.src(["src/**/*.js", "spec/public/**/*.js"])
			.pipe(jshint())
			.pipe(jshint.reporter("default", {verbose: true}))
			.pipe(jshint.reporter("fail"));
	});

	// Run client-side unit tests
	gulp.task("bdd", function() {
		karma.start({configFile: path.resolve("./karma-bdd.conf.js")}, function(exitCode) {
			process.exit(exitCode);
		});
	});

	// Run client-side unit tests & code coverage analysis on original source files
	gulp.task("src", function() {
		karma.start({configFile: path.resolve("./karma-src.conf.js")}, function(exitCode) {
			process.exit(exitCode);
		});
	});

	// Run client-side unit tests & code coverage analysis on built files
	gulp.task("test", function() {
		karma.start({configFile: path.resolve("./karma.conf.js")}, function(exitCode) {
			process.exit(exitCode);
		});
	});

	// Default task
	gulp.task("default", ["bdd"]);
})();
