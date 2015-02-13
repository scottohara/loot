(function () {
	"use strict";

	// Declare the lootMocks module and it's dependencies
	var mod = angular.module("lootMocks", [
		"ogBowerComponentsMocks",
		"ogComponentsMocks",
		"accountsMocks",
		"authenticationMocks",
		"categoriesMocks",
		"payeesMocks",
		"schedulesMocks",
		"securitiesMocks",
		"transactionsMocks"
	]);

	// Declare the mockDependencies provider
	mod.provider("mockDependencies", function($provide, $injector) {
		var provider = this;

		// Replaces a given set of dependencies with mock versions
		provider.load = function(dependencies) {
			// Process each dependency
			angular.forEach(dependencies, function(dependency) {
				// Replace the original with the mock version
				$provide.value(dependency, $injector.invoke($injector.get(dependency + "MockProvider").$get));
			});
		};

		provider.$get = function() {
			return provider;
		};
	});

	describe("mockDependenciesProvider", function() {
		// The object under test
		var mockDependenciesProvider;

		// Load the modules
		beforeEach(module("lootMocks"));

		// Inject the object under test
		beforeEach(inject(function(_mockDependencies_) {
			mockDependenciesProvider = _mockDependencies_;
		}));

		describe("$get", function() {
			it("should return the mockDependencies provider", function() {
				mockDependenciesProvider.should.have.a.property("load");
			});
		});
	});

	// Declare the directiveTest helper
	mod.factory("directiveTest", ["$rootScope", "$compile",
		function($rootScope, $compile) {
			var helper = {};

			// Configures the name of the directive and the element tag (and optionally, any contents)
			helper.configure = function(directive, tagName, content) {
				helper.directive = directive;
				helper.tagName = tagName;
				helper.content = content || "";

				switch (tagName) {
					case "tr":
					case "td":
					case "th":
					case "thead":
					case "tbody":
					case "tfoot":
						helper.container = "table";
						break;

					default:
						helper.container = "div";
				}

				// Create a new scope
				helper.scope = $rootScope.$new();
			};

			// Compiles the directive and returns an array containing
			// - the DOM element into which the directive was compiled
			// - the scope object that it was compiled with
			helper.compile = function(options, replace) {
				var directive;

				options = options || {};

				// Configure the directive with any passed options
				directive = helper.directive + (options.hasOwnProperty(helper.directive) ? "=\"" + options[helper.directive] + "\"" : "");
				directive = Object.keys(options).reduce(function(memo, option) {
					if (option !== helper.directive) {
						memo += " " + option + "=\"" + options[option] + "\"";
					}
					return memo;
				}, directive);

				// Compile the directive into the specified element tag using the new scope
				helper.element = $compile("<" + helper.container + "><" + helper.tagName + " ng-model=\"model\" " + directive + ">" + helper.content + "</" + helper.tagName + "></" + helper.container + ">")(helper.scope);

				// Unless the element is to be replaced, find the element within the compiled directive
				if (!replace) {
					helper.element = helper.element.find(helper.tagName);
				}
			};

			return helper;
		}
	]);

	// Declare the controllerTest helper
	mod.factory("controllerTest", ["$rootScope", "$controller",
		function($rootScope, $controller) {
			// Loads the controller and returns a scope object
			return function(controller, locals) {
				locals = locals || {};

				// Create a new scope
				locals.$scope = $rootScope.$new();

				// Load the controller
				var instance = $controller(controller, locals);

				// Attach the scope to the returned instance as $scope
				instance.$scope = locals.$scope;

				return instance;
			};
		}
	]);
})();
