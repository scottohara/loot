(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogTableLoading", function() {
		// The object under test
		var ogTableLoading;

		// Dependencies
		var $httpBackend;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Load the template
		beforeEach(module("og-components/og-table-loading/views/loading.html"));

		// Configure & compile the object under test
		beforeEach(inject(function(directiveTest, _$httpBackend_) {
			ogTableLoading = directiveTest;
			ogTableLoading.configure("og-table-loading", "tr");
			ogTableLoading.scope.model = false;
			ogTableLoading.compile({"og-table-loading": "model"});

			$httpBackend = _$httpBackend_;
		}));

		it.skip("should be hidden", function() {
			ogTableLoading.scope.$digest();
			ogTableLoading.element.hasClass("ng-hide").should.be.true;
		});

		describe("isLoading", function() {
			beforeEach(function() {
				ogTableLoading.scope.model = true;
			});

			it("should be visible", function() {
				ogTableLoading.scope.$digest();
				ogTableLoading.element.hasClass("ng-hide").should.be.false;
			});

			it.skip("should include a TD spanning the specified number of columns", function() {
				var td;

				ogTableLoading.compile({
					"og-table-loading": "model",
					"colspan": 3
				});
				ogTableLoading.scope.$digest();
				td = ogTableLoading.element.find("td");
				td.should.not.be.empty;
				td.attr("colspan").should.equal("3");
			});
		});
	});
})();
