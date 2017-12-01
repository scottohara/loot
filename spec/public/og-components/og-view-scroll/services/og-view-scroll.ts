import MockDependenciesProvider from "mocks/loot/mockdependencies";
import OgViewScrollService from "og-components/og-view-scroll/services/og-view-scroll";
import angular from "angular";

describe("ogViewScrollService", (): void => {
	let	ogViewScrollService: OgViewScrollService,
			$anchorScroll: angular.IAnchorScrollService;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$anchorScroll"])));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_ogViewScrollService_: OgViewScrollService, _$anchorScroll_: angular.IAnchorScrollService): void => {
		ogViewScrollService = _ogViewScrollService_;
		$anchorScroll = _$anchorScroll_;
	}));

	describe("scrollTo", (): void => {
		it("should scroll to the specified anchor", (): void => {
			ogViewScrollService.scrollTo("top");
			$anchorScroll.should.have.been.calledWith("top");
		});
	});
});
