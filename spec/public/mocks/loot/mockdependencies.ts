import type { Mock } from "mocks/types";
import angular from "angular";

export default class MockDependenciesProvider {
	public constructor(private readonly $provide: angular.auto.IProvideService, private readonly $injector: angular.auto.IInjectorService) {}

	// Replaces a given set of dependencies with mock versions
	public load<T>(dependencies: string[]): void {
		// Process each dependency, replacing the original with the mock version
		angular.forEach(dependencies, (dependency: string): void => {
			const mockProvider: Mock<T> = this.$injector.get(`${dependency}MockProvider`);

			this.$provide.value(dependency, this.$injector.invoke(mockProvider.$get.bind(mockProvider), mockProvider));
		}, this);
	}

	public $get(): this {
		return this;
	}
}

describe("mockDependenciesProvider", (): void => {
	// The object under test
	let mockDependenciesProvider: MockDependenciesProvider;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks") as Mocha.HookFunction);

	// Inject the object under test
	beforeEach(angular.mock.inject((_mockDependencies_: MockDependenciesProvider): MockDependenciesProvider => (mockDependenciesProvider = _mockDependencies_)) as Mocha.HookFunction);

	describe("$get", (): void => {
		it("should return the mockDependencies provider", (): Chai.Assertion => mockDependenciesProvider.should.have.property("load"));
	});
});

MockDependenciesProvider.$inject = ["$provide", "$injector"];