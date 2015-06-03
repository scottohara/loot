(function() {
	"use strict";

	/*jshint expr: true */

	describe("categoryDeleteView", function() {
		var categoryIndexView,
				categoryDeleteView,
				originalRowCount,
				original,
				expected,
				originalRow,
				expectedRow,
				originalValues,
				expectedValues;

		beforeEach(function() {
			categoryIndexView = require("./index");
			categoryDeleteView = require("./delete");

			// Go to the categories index page
			browser.get("/index.html#/categories");
			browser.wait(protractor.ExpectedConditions.presenceOf(categoryIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

			categoryIndexView.table.rows.count().then(function(count) {
				originalRowCount = count;
			});
		});

		describe("deleting a category", function() {
			describe("parent", function() {
				describe("expense", function() {
					beforeEach(function() {
						original = categoryIndexView.lastCategory;
						expected = categoryIndexView.secondLastCategory;
					});
					
					commonBehaviour();
				});

				describe("income", function() {
					beforeEach(function() {
						original = categoryIndexView.firstCategory;
						expected = categoryIndexView.secondCategory;
					});
					
					commonBehaviour();
				});
			});

			describe("subcategory", function() {
				describe("expense", function() {
					beforeEach(function() {
						original = categoryIndexView.lastSubcategory;
						expected = categoryIndexView.secondLastSubcategory;
					});
					
					commonBehaviour();
				});

				describe("income", function() {
					beforeEach(function() {
						original = categoryIndexView.firstSubcategory;
						expected = categoryIndexView.secondSubcategory;
					});
					
					commonBehaviour();
				});
			});
		});

		function commonBehaviour() {
			beforeEach(getRows);
			beforeEach(getValues);
			beforeEach(deleteRow);

			it("should display the details of the category being deleted", function() {
				categoryDeleteView.categoryName().should.eventually.equal(originalValues.categoryName);
				if (originalValues.categoryParent) {
					categoryDeleteView.categoryParent().should.eventually.equal(originalValues.categoryParent);
				} else {
					categoryDeleteView.subcategoryAlert.isPresent().should.eventually.be.true;
				}
				categoryDeleteView.direction().should.eventually.equal("inflow" === originalValues.direction ? "Income" : "Expense");
			});

			it("should not save changes when the cancel button is clicked", function() {
				categoryDeleteView.cancel();

				// Row count should not have changed
				categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

				// Category in the target row should not have changed
				categoryIndexView.checkRowValues(originalRow, originalValues);
			});

			it("should delete an existing category when the delete button is clicked", function() {
				categoryDeleteView.del();

				// Row count should have decremented by one
				categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount - (1 + originalValues.numChildren));

				// After deleting, the target row should now be a different category
				expectedValues.should.not.deep.equal(originalValues);
			});

			//TODO - error message should display when present
		}

		// Gets the original and expected rows
		function getRows() {
			original().then(function(row) {
				originalRow = row;
			});

			expected().then(function(row) {
				expectedRow = row;
			});
		}

		// Gets the values from the original and expected rows
		function getValues() {
			categoryIndexView.getRowValues(originalRow).then(function(values) {
				originalValues = values;
			});

			categoryIndexView.getRowValues(expectedRow).then(function(values) {
				expectedValues = values;
			});
		}

		// Deletes the target index row
		function deleteRow() {
			originalRow.evaluate("$index").then(function(index) {
				// Delete an existing category
				categoryIndexView.deleteCategory(index);
				waitForCategoryDeleteView();
			});
		}

		// Waits for the delete view to appear
		function waitForCategoryDeleteView() {
			browser.wait(categoryDeleteView.isPresent, 3000, "Timeout waiting for view to render");
		}
	});
})();
