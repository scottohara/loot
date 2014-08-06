(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogTableLoading", function() {
		// The object under test
		var ogTableLoading;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Load the template
		beforeEach(module("og-components/og-table-loading/views/loading.html"));

		// Configure & compile the object under test
		beforeEach(inject(function(directiveTest) {
			ogTableLoading = directiveTest;
			ogTableLoading.configure("og-table-loading", "tr");
			ogTableLoading.compile({"og-table-loading": "model"});
		}));

		it("should be empty by default", function() {
			ogTableLoading.scope.$digest();
			ogTableLoading.element.find("tr").should.be.empty;
		});

		describe("isLoading", function() {
			it("should contain a TR element", function() {
				ogTableLoading.scope.model = true;
				ogTableLoading.scope.$digest();
				ogTableLoading.element.find("tr").should.not.be.empty;
			});

			it("should include a TD spanning the specified number of columns", function() {
				ogTableLoading.compile({
					"og-table-loading": "model",
					"colspan": 3
				});
				ogTableLoading.scope.model = true;
				ogTableLoading.scope.$digest();
				ogTableLoading.element.find("tr > td[colspan=\"3\"]").should.not.be.empty;
			});
		});
	});
})();
