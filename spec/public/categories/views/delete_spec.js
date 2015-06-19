describe("categoryDeleteView", () => {
	let	categoryIndexView,
			categoryDeleteView,
			originalRowCount,
			original,
			expected,
			originalRow,
			expectedRow,
			originalValues,
			expectedValues;

	// Gets the original and expected rows
	function getRows() {
		original().then(row => originalRow = row);
		expected().then(row => expectedRow = row);
	}

	// Gets the values from the original and expected rows
	function getValues() {
		categoryIndexView.getRowValues(originalRow).then(values => originalValues = values);
		categoryIndexView.getRowValues(expectedRow).then(values => expectedValues = values);
	}

	// Waits for the delete view to appear
	function waitForCategoryDeleteView() {
		browser.wait(categoryDeleteView.isPresent.bind(categoryDeleteView), 3000, "Timeout waiting for view to render");
	}

	// Deletes the target index row
	function deleteRow() {
		originalRow.evaluate("$index").then(index => {
			// Delete an existing category
			categoryIndexView.deleteCategory(index);
			waitForCategoryDeleteView();
		});
	}

	function commonBehaviour() {
		beforeEach(getRows);
		beforeEach(getValues);
		beforeEach(deleteRow);

		it("should display the details of the category being deleted", () => {
			categoryDeleteView.categoryName().should.eventually.equal(originalValues.categoryName);
			if (originalValues.categoryParent) {
				categoryDeleteView.categoryParent().should.eventually.equal(originalValues.categoryParent);
			} else {
				categoryDeleteView.subcategoryAlert.isPresent().should.eventually.be.true;
			}
			categoryDeleteView.direction().should.eventually.equal("inflow" === originalValues.direction ? "Income" : "Expense");
		});

		it("should not save changes when the cancel button is clicked", () => {
			categoryDeleteView.cancel();

			// Row count should not have changed
			categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

			// Category in the target row should not have changed
			categoryIndexView.checkRowValues(originalRow, originalValues);
		});

		it("should delete an existing category when the delete button is clicked", () => {
			categoryDeleteView.del();

			// Row count should have decremented by one
			categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount - (1 + originalValues.numChildren));

			// After deleting, the target row should now be a different category
			expectedValues.should.not.deep.equal(originalValues);
		});

		// MISSING - error message should display when present
	}

	beforeEach(() => {
		categoryIndexView = require("./index");
		categoryDeleteView = require("./delete");

		// Go to the categories index page
		browser.get("/index.html#/categories");
		browser.wait(protractor.ExpectedConditions.presenceOf(categoryIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

		categoryIndexView.table.rows.count().then(count => originalRowCount = count);
	});

	describe("deleting a category", () => {
		describe("parent", () => {
			describe("expense", () => {
				beforeEach(() => {
					original = categoryIndexView.lastCategory.bind(categoryIndexView);
					expected = categoryIndexView.secondLastCategory.bind(categoryIndexView);
				});

				commonBehaviour();
			});

			describe("income", () => {
				beforeEach(() => {
					original = categoryIndexView.firstCategory.bind(categoryIndexView);
					expected = categoryIndexView.secondCategory.bind(categoryIndexView);
				});

				commonBehaviour();
			});
		});

		describe("subcategory", () => {
			describe("expense", () => {
				beforeEach(() => {
					original = categoryIndexView.lastSubcategory.bind(categoryIndexView);
					expected = categoryIndexView.secondLastSubcategory.bind(categoryIndexView);
				});

				commonBehaviour();
			});

			describe("income", () => {
				beforeEach(() => {
					original = categoryIndexView.firstSubcategory.bind(categoryIndexView);
					expected = categoryIndexView.secondSubcategory.bind(categoryIndexView);
				});

				commonBehaviour();
			});
		});
	});
});
