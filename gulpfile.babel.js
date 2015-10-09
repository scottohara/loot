{
	const	gulp = require("gulp"),
				babel = require("gulp-babel"),
				concat = require("gulp-concat"),
				del = require("del"),
				less = require("gulp-less"),
				livereload = require("gulp-livereload"),
				minifyCss = require("gulp-minify-css"),
				path = require("path"),
				rev = require("gulp-rev"),
				size = require("gulp-size"),
				sourceMaps = require("gulp-sourcemaps"),
				uglify = require("gulp-uglify"),
				util = require("gulp-util"),

				appJsSource = "src/**/*.js",
				vendorJsSource = [
					"node_modules/jquery/dist/jquery.min.js",
					"node_modules/bootstrap/dist/js/bootstrap.min.js",
					"node_modules/angular/angular.min.js",
					"node_modules/angular-ui-router/release/angular-ui-router.min.js",
					"node_modules/angular-bootstrap-npm/dist/angular-bootstrap.min.js",
					"node_modules/moment/min/moment.min.js",
					"node_modules/babel-core/browser-polyfill.min.js"
				],

				appTemplatesSource = ["src/**/*.html", "!src/*.html"],

				appCssSource = "src/**/*.less",
				vendorCssSource = "node_modules/bootstrap/dist/css/bootstrap.min.css",

				appAssetsSource = ["src/*.html", "!src/index.html", "src/favicon.ico", "src/robots.txt"],
				vendorAssetsSource = "node_modules/bootstrap/fonts/**";

	/**
	 * Helpers
	 */

	function cleanIndex(cb) {
		del("public/index.html", cb);
	}

	function buildIndex() {
		const	inject = require("gulp-inject"),
					appAssets = gulp.src(["public/app*.js", "public/app*.css"], {read: false}),
					templates = gulp.src(["public/templates*.js"], {read: false}),
					vendorAssets = gulp.src(["public/vendor*.js", "public/vendor*.css"], {read: false});

		return gulp.src("src/index.html")
			.pipe(inject(appAssets, {ignorePath: "public", name: "app"}))
			.pipe(inject(templates, {ignorePath: "public", name: "templates"}))
			.pipe(inject(vendorAssets, {ignorePath: "public", name: "vendor"}))
			.pipe(gulp.dest("public"))
			.pipe(livereload())
			.on("error", util.log);
	}

	function cleanAndBuildIndex() {
		cleanIndex(buildIndex());
	}

	function startKarma(configFile) {
		const	KarmaServer = require("karma").Server,
					argv = require("yargs").argv,
					cliArgs = {};

		if (argv.browsers) {
			cliArgs.browsers = argv.browsers.split(",");
		}

		(new KarmaServer(Object.assign({configFile: path.resolve(configFile)}, cliArgs), exitCode => process.exit(exitCode))).start();
	}

	/**
	 * Watch
	 */

	// Watch
	gulp.task("watch", () => {
		livereload.listen();
		gulp.watch(appJsSource, ["watch:app:js"]);
		gulp.watch(vendorJsSource, ["watch:vendor:js"]);
		gulp.watch(appTemplatesSource, ["watch:app:templates"]);
		gulp.watch(appCssSource, ["watch:app:css"]);
		gulp.watch(vendorCssSource, ["watch:vendor:css"]);
		gulp.watch(appAssetsSource, ["copy:app:assets"]);
		gulp.watch(vendorAssetsSource, ["copy:vendor:assets"]);
	});

	// Watch application Javascript
	gulp.task("watch:app:js", ["eslint", "build:app:js"], cleanAndBuildIndex);

	// Watch vendor Javascript
	gulp.task("watch:vendor:js", ["build:vendor:js"], cleanAndBuildIndex);

	// Watch application templates
	gulp.task("watch:app:templates", ["build:app:templates"], cleanAndBuildIndex);

	// Watch application CSS
	gulp.task("watch:app:css", ["build:app:css"], cleanAndBuildIndex);

	// Watch vendor CSS
	gulp.task("watch:vendor:css", ["build:vendor:css"], cleanAndBuildIndex);

	/**
	 * Build
	 */

	// Build
	gulp.task("build", ["clean", "build:js", "build:templates", "build:css", "copy:assets"], buildIndex);

	// Clean
	gulp.task("clean", ["clean:js", "clean:templates", "clean:css", "clean:assets"], cleanIndex);

	// Build Javascript
	gulp.task("build:js", ["build:app:js", "build:vendor:js"]);

	// Clean Javascript
	gulp.task("clean:js", ["clean:app:js", "clean:vendor:js"]);

	// Build application Javascript
	gulp.task("build:app:js", ["clean:app:js"], () => gulp.src(appJsSource)
		.pipe(sourceMaps.init())
			.pipe(size({title: "app js (original)"}))
			.pipe(concat("app.js"))
			.pipe(babel({auxiliaryCommentBefore: "istanbul ignore next babel helper"}))
			.pipe(uglify({preserveComments: (node, comment) => (/istanbul ignore next babel helper/).test(comment.value)}))
			.pipe(rev())
			.pipe(size({title: "app js (minified)"}))
			.pipe(size({title: "app js (gzipped)", gzip: true}))
		.pipe(sourceMaps.write("."))
		.pipe(gulp.dest("public"))
		.on("error", util.log));

	// Clean application Javascript
	gulp.task("clean:app:js", cb => del(["public/app*.js", "public/app*.js.map"], cb));

	// Build templates
	gulp.task("build:templates", ["build:app:templates"]);

	// Clean templates
	gulp.task("clean:templates", ["clean:app:templates"]);

	// Build app templates
	gulp.task("build:app:templates", ["clean:app:templates"], () => {
		const templateCache = require("gulp-angular-templatecache");

		return gulp.src(appTemplatesSource)
			.pipe(size({title: "app templates (original)"}))
			.pipe(templateCache({module: "lootApp"}))
			.pipe(rev())
			.pipe(size({title: "app templates (concatenated)"}))
			.pipe(size({title: "app templates (gzipped)", gzip: true}))
			.pipe(gulp.dest("public"))
			.on("error", util.log);
	});

	// Clean app templates
	gulp.task("clean:app:templates", cb => del("public/templates*.js", cb));

	// Build vendor Javascript
	gulp.task("build:vendor:js", ["clean:vendor:js"], () => gulp.src(vendorJsSource)
		.pipe(sourceMaps.init({loadMaps: true}))
			.pipe(concat("vendor.js"))
			.pipe(rev())
		.pipe(sourceMaps.write("."))
		.pipe(gulp.dest("public"))
		.on("error", util.log));

	// Clean vendor Javascript
	gulp.task("clean:vendor:js", cb => del(["public/vendor*.js", "public/vendor*.js.map"], cb));

	// Build CSS
	gulp.task("build:css", ["build:app:css", "build:vendor:css"]);

	// Clean CSS
	gulp.task("clean:css", ["clean:app:css", "clean:vendor:css"]);

	// Build application CSS
	gulp.task("build:app:css", ["clean:app:css"], () => gulp.src(appCssSource)
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
		.on("error", util.log));

	// Clean application CSS
	gulp.task("clean:app:css", cb => del(["public/app*.css", "public/app*.css.map"], cb));

	// Build vendor CSS
	gulp.task("build:vendor:css", ["clean:vendor:css"], () => gulp.src(vendorCssSource)
		.pipe(sourceMaps.init())
			.pipe(concat("vendor.css"))
			.pipe(rev())
		.pipe(sourceMaps.write("."))
		.pipe(gulp.dest("public"))
		.on("error", util.log));

	// Clean vendor CSS
	gulp.task("clean:vendor:css", cb => del(["public/vendor*.css", "public/vendor*.css.map"], cb));

	// Copy static assets (HTML, icons, fonts etc.)
	gulp.task("copy:assets", ["copy:app:assets", "copy:vendor:assets"]);

	// Clean static assets
	gulp.task("clean:assets", ["clean:app:assets", "clean:vendor:assets"]);

	// Copy application static assets
	gulp.task("copy:app:assets", ["clean:app:assets"], () => gulp.src(appAssetsSource)
		.pipe(gulp.dest("public")));

	// Clean application static assets
	gulp.task("clean:app:assets", cb => del(["public/*.html", "!public/index.html", "public/favicon.ico", "public/robots.txt"], cb));

	// Copy vendor static assets
	gulp.task("copy:vendor:assets", ["clean:vendor:assets"], () => gulp.src(vendorAssetsSource)
		.pipe(gulp.dest("public/fonts")));

	// Clean vendor static assets
	gulp.task("clean:vendor:assets", cb => del("public/fonts", cb));

	/**
	 * Test
	 */

	// Run JSHint
	gulp.task("jshint", () => {
		const jshint = require("gulp-jshint");

		return gulp.src([appJsSource, "spec/public/**/*.js"])
			.pipe(jshint())
			.pipe(jshint.reporter("default", {verbose: true}));
	});

	// Run ESLint
	gulp.task("eslint", () => {
		const eslint = require("gulp-eslint");

		return gulp.src([appJsSource, "spec/public/**/*.js", "*.js"])
			.pipe(eslint())
			.pipe(eslint.format());
	});

	// Run client-side unit tests
	gulp.task("test:bdd", () => {
		startKarma("./karma-bdd.conf.js");
	});

	// Run client-side unit tests & code coverage analysis on original source files
	gulp.task("test:src", () => {
		startKarma("./karma-src.conf.js");
	});

	// Run client-side unit tests & code coverage analysis on built files
	gulp.task("test:build", () => {
		startKarma("./karma.conf.js");
	});

	// Default task
	gulp.task("default", ["watch"]);
}
