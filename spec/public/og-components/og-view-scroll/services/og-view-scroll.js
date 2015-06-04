(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogViewScrollService", function() {
		// The object under test
		var ogViewScrollService;

		// Dependencies
		var $anchorScroll;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$anchorScroll"]);
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_ogViewScrollService_, _$anchorScroll_) {
			ogViewScrollService = _ogViewScrollService_;
			$anchorScroll = _$anchorScroll_;
		}));

		describe("scrollTo", function() {
			it("should scroll to the specified anchor", function() {
				ogViewScrollService.scrollTo("test");
				$anchorScroll.should.have.been.calledWith("test");
			});
		});
	});
})();
