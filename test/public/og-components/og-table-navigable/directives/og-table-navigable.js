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
			ogTableNavigable.configure("og-table-navigable", "table", "<tbody><tr ng-repeat=\"row in rows\"><td></td></tr></tbody>");
			ogTableNavigable.scope.rows = [{},{}];
			ogTableNavigable.scope.model = {
				navigationEnabled: function() { return true; }
			};
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

		describe("on click", function() {
			it("should do nothing when navigation is disabled", function() {
				ogTableNavigable.scope.model.navigationEnabled = function() { return false; };
				ogTableNavigable.element.isolateScope().clickHandler();
				(undefined === ogTableNavigable.element.isolateScope().focusRow).should.be.true;
			});

			it("should do nothing if the closest parent TR element to where the event occurred could not be determined", function() {
				ogTableNavigable.element.isolateScope().clickHandler({});
				(undefined === ogTableNavigable.element.isolateScope().focusRow).should.be.true;
			});

			it("should focus the closest parent TR element to where the event occurred", function() {
				var cellInLastRow = $(ogTableNavigable.element).find("tbody > tr > td").last();
				ogTableNavigable.element.isolateScope().clickHandler({target: cellInLastRow});
				ogTableNavigable.element.isolateScope().focusRow.should.equal(1);
			});
		});

		describe("on double-click", function() {
			it("should do nothing when navigation is disabled");
			it("should do nothing if a selectAction hander is not defined");
			it("should do nothing if the event was triggered by a button click");
			it("should do nothing if the closest parent TR element to where the event occurred could not be determined");
			it("should invoke the selectAction handler for the closest parent TR element to where the event occurred");
		});

		describe.skip("on destroy", function() {
			beforeEach(function() {
				//ogTableNavigable.element.triggerHandler("$destroy");
			});

			it("should remove the click handler from the element", function() {
				ogTableNavigable.element.triggerHandler("click");
				(ogTableNavigable.element.isolateScope().focusRow === null).should.be.true;
			});

			it("should remove the double-click handler from the element", function() {
				//ogTableNavigable.element.triggerHandler("dblclick");
				//ogTableNavigable.element.find("tr.warning").should.be.empty;
			});

			it("should remove the keydown handler from the element", function() {
				//ogTableNavigable.element.triggerHandler("keydown");
				//ogTableNavigable.element.find("tr.warning").should.be.empty;
			});
		});
	});
})();
