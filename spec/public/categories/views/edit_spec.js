(function() {
	"use strict";

	/*jshint expr: true */

	describe("categoryEditView", function() {
		var categoryIndexView,
				categoryEditView,
				expected,
				originalRowCount,
				targetRow;

		beforeEach(function() {
			categoryIndexView = require("./index");
			categoryEditView = require("./edit");

			// Go to the categories index page
			browser.get("/index.html#/categories");
			browser.wait(protractor.ExpectedConditions.presenceOf(categoryIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

			categoryIndexView.table.rows.count().then(function(count) {
				originalRowCount = count;
			});
		});

		describe("adding a category", function() {
			beforeEach(function() {
				// Add a new category
				categoryIndexView.addCategory();
				waitForCategoryEditView("Add");
			});

			describe("parent", function() {
				describe("expense", function() {
					beforeEach(function() {
						targetRow = categoryIndexView.table.lastRow();
						expected = {categoryName: "ZZZ Test category", direction: "outflow"};
						categoryEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should insert a new category when the save button is clicked", function() {
						categoryEditView.save();

						// Row count should have incremented by one
						categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

						// Category in the target row should be the new category
						categoryIndexView.checkRowValues(targetRow, expected);
					});
				});

				describe("income", function() {
					beforeEach(function() {
						targetRow = categoryIndexView.table.firstRow();
						expected = {categoryName: "AAA Test category", direction: "inflow"};
						categoryEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should insert a new category when the save button is clicked", function() {
						categoryEditView.save();

						// Row count should have incremented by one
						categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

						// Category in the target row should be the new category
						categoryIndexView.checkRowValues(targetRow, expected);
					});
				});
			});

			describe("subcategory", function() {
				describe("expense", function() {
					beforeEach(function() {
						targetRow = categoryIndexView.table.lastRow();
						expected = {categoryName: "ZZZ Test subcategory", categoryParent: "ZZZ Test categor", direction: "outflow", isSubcategory: true};
						categoryEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should insert a new category when the save button is clicked", function() {
						categoryEditView.save();

						// Row count should have incremented by one
						categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

						// Category in the target row should be the new category
						categoryIndexView.checkRowValues(targetRow, expected);
					});
				});

				describe("income", function() {
					beforeEach(function() {
						targetRow = categoryIndexView.table.row(1);
						expected = {categoryName: "AAA Test subcategory", categoryParent: "AAA Test categor", direction: "inflow", isSubcategory: true};
						categoryEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should insert a new category when the save button is clicked", function() {
						categoryEditView.save();

						// Row count should have incremented by one
						categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

						// Category in the target row should be the new category
						categoryIndexView.checkRowValues(targetRow, expected);
					});
				});
			});
		});

		describe("editing a category", function() {
			describe("parent", function() {
				describe("expense", function() {
					beforeEach(function() {
						categoryIndexView.lastCategory().then(function(row) {
							targetRow = row;
						});
					});

					beforeEach(editRow);

					beforeEach(function() {
						// Check that the edit form is correctly populated
						checkEditFormMatchesIndexRow(targetRow);

						expected = {categoryName: "AA Test category (edited)", direction: "inflow"};
						categoryEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should update an existing category when the save button is clicked", function() {
						categoryEditView.save();

						// Row count should not have changed
						categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

						// After editing, the row should now be the first category
						categoryIndexView.firstCategory().then(function(row) {
							categoryIndexView.checkRowValues(row, expected);
						});
					});
				});

				describe("income", function() {
					beforeEach(function() {
						categoryIndexView.firstCategory().then(function(row) {
							targetRow = row;
						});
					});

					beforeEach(editRow);

					beforeEach(function() {
						// Check that the edit form is correctly populated
						checkEditFormMatchesIndexRow(targetRow);

						expected = {categoryName: "ZZZ Test category (edited)", direction: "outflow"};
						categoryEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should update an existing category when the save button is clicked", function() {
						categoryEditView.save();

						// Row count should not have changed
						categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

						// After editing, the row should now be the last category
						categoryIndexView.lastCategory().then(function(row) {
							categoryIndexView.checkRowValues(row, expected);
						});
					});
				});
			});

			describe("subcategory", function() {
				describe("income", function() {
					beforeEach(function() {
						categoryIndexView.firstSubcategory().then(function(row) {
							targetRow = row;
						});
					});
					
					beforeEach(editRow);

					beforeEach(function() {
						// Check that the edit form is correctly populated
						checkEditFormMatchesIndexRow(targetRow);

						expected = {categoryName: "ZZZ Test subcategory (edited)", categoryParent: "ZZZ Test category (edited", direction: "outflow", isSubcategory: true};
						categoryEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should update an existing category when the save button is clicked", function() {
						categoryEditView.save();

						// Row count should not have changed
						categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

						// After editing, the row should now be the last subcategory
						categoryIndexView.lastSubcategory().then(function(row) {
							categoryIndexView.checkRowValues(row, expected);
						});
					});
				});

				describe("expense", function() {
					beforeEach(function() {
						categoryIndexView.lastSubcategory().then(function(row) {
							targetRow = row;
						});
					});
					
					beforeEach(editRow);

					beforeEach(function() {
						// Check that the edit form is correctly populated
						checkEditFormMatchesIndexRow(targetRow);

						expected = {categoryName: "AAA Test subcategory (edited)", categoryParent: "AAA Test categor", direction: "inflow", isSubcategory: true};
						categoryEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should update an existing category when the save button is clicked", function() {
						categoryEditView.save();

						// Row count should not have changed
						categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

						// After editing, the row should now be the first subcategory
						categoryIndexView.firstSubcategory().then(function(row) {
							categoryIndexView.checkRowValues(row, expected);
						});
					});
				});
			});
		});

		// Waits for the edit view to appear and checks the heading is correct
		function waitForCategoryEditView(mode) {
			browser.wait(protractor.ExpectedConditions.presenceOf(categoryEditView), 3000, "Timeout waiting for view to render");
			categoryEditView.heading().should.eventually.equal(mode + " Category");
		}

		// Cancel & form invalid behaviour
		function commonBehaviour() {
			it("should not save changes when the cancel button is clicked", function() {
				categoryIndexView.getRowValues(targetRow).then(function(expected) {
					categoryEditView.cancel();

					// Row count should not have changed
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// Category in the target row should not have changed
					categoryIndexView.checkRowValues(targetRow, expected);
				});
			});

			describe("invalid data", function() {
				beforeEach(function() {
					categoryEditView.clearCategoryDetails();
				});

				it("should not enable the save button", function() {
					categoryEditView.saveButton.isEnabled().should.eventually.be.false;
				});

				//TODO - category name, parent & direction should show red cross when invalid
				//TODO - form group around category name & parent should have 'has-error' class when invalid
				//TODO - parent should behave like non-editable typeahead
			});

			//TODO - error message should display when present
			//TODO - category name & parent text should be selected when input gets focus
		}

		// Edits the target index row
		function editRow() {
			targetRow.evaluate("$index").then(function(index) {
				// Edit an existing category
				categoryIndexView.editCategory(index);
				waitForCategoryEditView("Edit");
			});
		}

		// Checks the values in the edit form against the values from an index row
		function checkEditFormMatchesIndexRow(row) {
			categoryIndexView.getRowValues(row).then(function(expected) {
				categoryEditView.categoryNameInput.getAttribute("value").should.eventually.equal(expected.categoryName);
				if (!expected.isSubcategory) {
					categoryEditView.directionRadioButton(expected.direction, true).isPresent().should.eventually.be.true;
				} else {
					categoryEditView.categoryParentTypeahead.getAttribute("value").should.eventually.equal(expected.categoryParent);
				}
			});
		}
	});
})();
