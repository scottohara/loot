(function() {
	"use strict";

	/*jshint expr: true */

	describe("estimate", function() {
		// The object under test
		var estimateFilter;

		// Load the modules
		beforeEach(module("lootMocks", "lootSchedules"));

		// Inject the object under test
		beforeEach(inject(function(_estimateFilter_) {
			estimateFilter = _estimateFilter_;
		}));

		it("should prefix an estimate with ~", function() {
			estimateFilter(1, true).should.equal("~1");
		});

		it("should not prefix a non-estimate", function() {
			estimateFilter(1, false).should.equal("1");
		});
	});
})();
