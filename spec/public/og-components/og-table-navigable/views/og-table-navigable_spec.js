(function() {
	"use strict";

	/*jshint expr: true */

	function ogTableNavigableViewSpec(table) {
		describe("table navigation", function() {
			var targetRow,
					totalRows;
			
			beforeEach(function() {
				table.rows.count().then(function(count) {
					totalRows = count;
				});
			});

			describe("forward", function() {
				beforeEach(function() {
					table.clickRow(0);
				});

				it("should focus the selected row", function() {
					targetRow = 0;
				});

				describe("by one row", function() {
					beforeEach(function() {
						targetRow = 1;
					});
					
					it("should move the focus down by one row when the 'J' key is pressed", function() {
						table.j();
					});

					it("should move the focus down by one row when the arrow down key is pressed", function() {
						table.arrowDown();
					});
				});

				describe("by ten rows", function() {
					beforeEach(function() {
						targetRow = totalRows > 10 ? 10 : totalRows - 1;
					});
					
					it("should move the focus down by ten rows when the page down key is pressed", function() {
						table.pageDown();
					});
				});
			});

			describe("backward", function() {
				beforeEach(function() {
					table.clickRow(totalRows - 1);
				});

				describe("by one row", function() {
					beforeEach(function() {
						targetRow = totalRows - 2;
					});
					
					it("should move the focus up by one row when the 'K' key is pressed", function() {
						table.k();
					});

					it("should move the focus up by one row when the arrow up key is pressed", function() {
						table.arrowUp();
					});
				});

				describe("by ten rows", function() {
					beforeEach(function() {
						targetRow = totalRows > 10 ? totalRows - 11 : 0;
					});
					
					it("should move the focus up by ten rows when the page up key is pressed", function() {
						table.pageUp();
					});
				});
			});

			afterEach(function() {
				table.focussedRowCount().should.eventually.equal(1);
				table.isFocussed(table.row(targetRow)).should.eventually.be.true;
			});
		});

		describe("table actions", function() {
			var action;

			describe("insert", function() {
				beforeEach(function() {
					action = "insert";
				});

				it("should display the " + table.actions.insert.heading + " view when the insert key is pressed", function() {
					table.insert();
				});

				it("should display the " + table.actions.insert.heading + " view when the CTRL+N keys are pressed", function() {
					table.ctrlN();
				});
			});

			describe("edit", function() {
				beforeEach(function() {
					action = "edit";
				});

				if (table.actions.edit.mouseAction) {
					it("should display the " + table.actions.edit.heading + " view when the " + table.actions.edit.mouseAction.name, function() {
						table.actions.edit.mouseAction.perform(table.row(0));
					});
				}

				it("should display the " + table.actions.edit.heading + " view when the CTRL+E keys are pressed", function() {
					table.clickRow(0);
					table.ctrlE();
				});
			});

			describe("delete", function() {
				beforeEach(function() {
					action = "del";
					table.clickRow(3);
				});

				it("should display the " + table.actions.del.heading + " view when the delete key is pressed", function() {
					table.del();
				});

				it("should display the " + table.actions.del.heading + " view when the backspace key is pressed", function() {
					table.backSpace();
				});
			});

			describe("select", function() {
				beforeEach(function() {
					action = "select";
					table.clickRow(0);
				});

				it("should display the " + table.actions.select.heading + (table.actions.select.heading2 || "") + " view when the row is double clicked", function() {
					table.doubleClickRow(0);
				});

				it("should display the " + table.actions.select.heading + (table.actions.select.heading2 || "") + " view when the enter key is pressed", function() {
					table.enter();
				});
			});

			afterEach(function() {
				browser.wait(protractor.ExpectedConditions.presenceOf(table.actions[action].view), 3000, "Timeout waiting for view to render");
				table.actions[action].view.heading().should.eventually.equal(table.actions[action].heading);
			});
		});
	}

	module.exports = ogTableNavigableViewSpec;
})();
