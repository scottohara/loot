(function () {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootMocks")
		.provider("mockDependencies", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["$provide", "$injector"];

	/**
	 * Implementation
	 */
	function Provider($provide, $injector) {
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
	}

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
})();
