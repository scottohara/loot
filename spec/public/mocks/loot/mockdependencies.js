{
	/**
	 * Implementation
	 */
	class Provider {
		constructor($provide, $injector) {
			this.$provide = $provide;
			this.$injector = $injector;
		}

		// Replaces a given set of dependencies with mock versions
		load(dependencies) {
			// Process each dependency, replacing the original with the mock version
			angular.forEach(dependencies, dependency => {
				const mockProvider = this.$injector.get(`${dependency}MockProvider`);

				this.$provide.value(dependency, this.$injector.invoke(mockProvider.$get, mockProvider));
			}, this);
		}

		$get() {
			return this;
		}
	}

	describe("mockDependenciesProvider", () => {
		// The object under test
		let mockDependenciesProvider;

		// Load the modules
		beforeEach(module("lootMocks"));

		// Inject the object under test
		beforeEach(inject(_mockDependencies_ => mockDependenciesProvider = _mockDependencies_));

		describe("$get", () => {
			it("should return the mockDependencies provider", () => mockDependenciesProvider.should.have.a.property("load"));
		});
	});

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
}
