import angular from "angular";

describe("ogViewScrollService", () => {
	let	ogViewScrollService,
			$anchorScroll;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents", mockDependenciesProvider => mockDependenciesProvider.load(["$anchorScroll"])));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_ogViewScrollService_, _$anchorScroll_) => {
		ogViewScrollService = _ogViewScrollService_;
		$anchorScroll = _$anchorScroll_;
	}));

	describe("scrollTo", () => {
		it("should scroll to the specified anchor", () => {
			ogViewScrollService.scrollTo("test");
			$anchorScroll.should.have.been.calledWith("test");
		});
	});
});
