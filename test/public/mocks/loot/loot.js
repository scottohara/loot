(function () {
	"use strict";

	// Declare the lootMocks module and it's dependencies
	var mod = angular.module("lootMocks", [
		"ogAngularMocks",
		"ogComponentsMocks",
		"categoriesMocks",
		"payeesMocks",
		"securitiesMocks"
	]);

	// Declare the mockDependencies provider
	mod.provider("mockDependencies", function($provide, $injector) {
			var provider = this;

			// Replaces a given set of dependencies with mock versions
			provider.load = function(dependencies) {
				// Process each dependency
				angular.forEach(dependencies, function(dependency) {
					// Replace the original with the mock version
					$provide.value(dependency, $injector.get(dependency + "MockProvider").$get());
				});
			};

			provider.$get = function() {
				return provider;
			};
		}
	);
})();
