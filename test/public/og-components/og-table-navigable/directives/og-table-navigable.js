(function() {
	"use strict";

	/*jshint expr: true */

	describe.only("ogTableNavigable", function() {
		// The object under test
		var ogTableNavigable;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Configure & compile the object under test
		beforeEach(inject(function(directiveTest) {
			ogTableNavigable = directiveTest;
			ogTableNavigable.configure("og-table-navigable", "table");
			ogTableNavigable.scope.model = {};
			// navigationEnabled: fn() -> bool
			// selectAction: fn(idx)
			// editAction: fn(idx)
			// insertAction: fn()
			// deleteAction: fn(idx)
			// focusAction: fn(idx)
			ogTableNavigable.compile({"og-table-navigable": "model"});
			ogTableNavigable.scope.$digest();
		}));

		it("should attach a focusRow function to the handlers object", function() {
			ogTableNavigable.scope.model.focusRow.should.be.a.function;
		});

		/*it("should be hidden", function() {
			ogTableNavigable.scope.$digest();
			ogTableNavigable.element.hasClass("ng-hide").should.be.true;
		});

		describe("isLoading", function() {
			beforeEach(function() {
				ogTableNavigable.scope.model = true;
			});

			it("should be visible", function() {
				ogTableNavigable.scope.$digest();
				ogTableNavigable.element.hasClass("ng-hide").should.be.false;
			});

			it("should include a TD spanning the specified number of columns", function() {
				var td;

				ogTableNavigable.compile({
					"og-table-loading": "model",
					"colspan": 3
				});
				ogTableNavigable.scope.$digest();
				td = ogTableNavigable.element.find("td");
				td.should.not.be.empty;
				td.attr("colspan").should.equal("3");
			});
		});*/

		describe("on destroy", function() {
			beforeEach(function() {
				ogTableNavigable.element.triggerHandler("$destroy");
			});

			it("should remove the click handler from the element", function() {
				ogTableNavigable.element.triggerHandler("click");
				ogTableNavigable.element.find("tr.warning").should.be.empty;
			});
		});
	});
})();
