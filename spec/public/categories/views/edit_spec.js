describe("categoryEditView", () => {
	let	categoryIndexView,
			categoryEditView,
			expected,
			originalRowCount,
			targetRow;

	// Waits for the edit view to appear and checks the heading is correct
	function waitForCategoryEditView(mode) {
		browser.wait(protractor.ExpectedConditions.presenceOf(categoryEditView), 3000, "Timeout waiting for view to render");
		categoryEditView.heading().should.eventually.equal(`${mode} Category`);
	}

	// Cancel & form invalid behaviour
	function commonBehaviour() {
		it("should not save changes when the cancel button is clicked", () => {
			categoryIndexView.getRowValues(targetRow).then(values => {
				categoryEditView.cancel();

				// Row count should not have changed
				categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

				// Category in the target row should not have changed
				categoryIndexView.checkRowValues(targetRow, values);
			});
		});

		describe("invalid data", () => {
			beforeEach(() => {
				categoryEditView.clearCategoryDetails();
			});

			it("should not enable the save button", () => {
				categoryEditView.saveButton.isEnabled().should.eventually.be.false;
			});

			// MISSING - category name, parent & direction should show red cross when invalid
			// MISSING - form group around category name & parent should have 'has-error' class when invalid
			// MISSING - parent should behave like non-editable typeahead
		});

		// MISSING - error message should display when present
		// MISSING - category name & parent text should be selected when input gets focus
	}

	// Edits the target index row
	function editRow() {
		targetRow.evaluate("$index").then(index => {
			// Edit an existing category
			categoryIndexView.editCategory(index);
			waitForCategoryEditView("Edit");
		});
	}

	// Checks the values in the edit form against the values from an index row
	function checkEditFormMatchesIndexRow(row) {
		categoryIndexView.getRowValues(row).then(values => {
			categoryEditView.categoryNameInput.getAttribute("value").should.eventually.equal(values.categoryName);
			if (values.isSubcategory) {
				categoryEditView.categoryParentTypeahead.getAttribute("value").should.eventually.equal(values.categoryParent);
			} else {
				categoryEditView.directionRadioButton(values.direction, true).isPresent().should.eventually.be.true;
			}
		});
	}

	beforeEach(() => {
		categoryIndexView = require("./index");
		categoryEditView = require("./edit");

		// Go to the categories index page
		browser.get("/index.html#/categories");
		browser.wait(protractor.ExpectedConditions.presenceOf(categoryIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

		categoryIndexView.table.rows.count().then(count => originalRowCount = count);
	});

	describe("adding a category", () => {
		beforeEach(() => {
			// Add a new category
			categoryIndexView.addCategory();
			waitForCategoryEditView("Add");
		});

		describe("parent", () => {
			describe("expense", () => {
				beforeEach(() => {
					targetRow = categoryIndexView.table.lastRow();
					expected = {categoryName: "ZZZ Test category", direction: "outflow"};
					categoryEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should insert a new category when the save button is clicked", () => {
					categoryEditView.save();

					// Row count should have incremented by one
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

					// Category in the target row should be the new category
					categoryIndexView.checkRowValues(targetRow, expected);
				});
			});

			describe("income", () => {
				beforeEach(() => {
					targetRow = categoryIndexView.table.firstRow();
					expected = {categoryName: "AAA Test category", direction: "inflow"};
					categoryEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should insert a new category when the save button is clicked", () => {
					categoryEditView.save();

					// Row count should have incremented by one
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

					// Category in the target row should be the new category
					categoryIndexView.checkRowValues(targetRow, expected);
				});
			});
		});

		describe("subcategory", () => {
			describe("expense", () => {
				beforeEach(() => {
					targetRow = categoryIndexView.table.lastRow();
					expected = {categoryName: "ZZZ Test subcategory", categoryParent: "ZZZ Test categor", direction: "outflow", isSubcategory: true};
					categoryEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should insert a new category when the save button is clicked", () => {
					categoryEditView.save();

					// Row count should have incremented by one
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

					// Category in the target row should be the new category
					categoryIndexView.checkRowValues(targetRow, expected);
				});
			});

			describe("income", () => {
				beforeEach(() => {
					targetRow = categoryIndexView.table.row(1);
					expected = {categoryName: "AAA Test subcategory", categoryParent: "AAA Test categor", direction: "inflow", isSubcategory: true};
					categoryEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should insert a new category when the save button is clicked", () => {
					categoryEditView.save();

					// Row count should have incremented by one
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

					// Category in the target row should be the new category
					categoryIndexView.checkRowValues(targetRow, expected);
				});
			});
		});
	});

	describe("editing a category", () => {
		describe("parent", () => {
			describe("expense", () => {
				beforeEach(() => categoryIndexView.lastCategory().then(row => targetRow = row));

				beforeEach(editRow);

				beforeEach(() => {
					// Check that the edit form is correctly populated
					checkEditFormMatchesIndexRow(targetRow);

					expected = {categoryName: "AA Test category (edited)", direction: "inflow"};
					categoryEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should update an existing category when the save button is clicked", () => {
					categoryEditView.save();

					// Row count should not have changed
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// After editing, the row should now be the first category
					categoryIndexView.firstCategory().then(row => categoryIndexView.checkRowValues(row, expected));
				});
			});

			describe("income", () => {
				beforeEach(() => categoryIndexView.firstCategory().then(row => targetRow = row));

				beforeEach(editRow);

				beforeEach(() => {
					// Check that the edit form is correctly populated
					checkEditFormMatchesIndexRow(targetRow);

					expected = {categoryName: "ZZZ Test category (edited)", direction: "outflow"};
					categoryEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should update an existing category when the save button is clicked", () => {
					categoryEditView.save();

					// Row count should not have changed
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// After editing, the row should now be the last category
					categoryIndexView.lastCategory().then(row => categoryIndexView.checkRowValues(row, expected));
				});
			});
		});

		describe("subcategory", () => {
			describe("income", () => {
				beforeEach(() => categoryIndexView.firstSubcategory().then(row => targetRow = row));

				beforeEach(editRow);

				beforeEach(() => {
					// Check that the edit form is correctly populated
					checkEditFormMatchesIndexRow(targetRow);

					expected = {categoryName: "ZZZ Test subcategory (edited)", categoryParent: "ZZZ Test category (edited", direction: "outflow", isSubcategory: true};
					categoryEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should update an existing category when the save button is clicked", () => {
					categoryEditView.save();

					// Row count should not have changed
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// After editing, the row should now be the last subcategory
					categoryIndexView.lastSubcategory().then(row => categoryIndexView.checkRowValues(row, expected));
				});
			});

			describe("expense", () => {
				beforeEach(() => categoryIndexView.lastSubcategory().then(row => targetRow = row));

				beforeEach(editRow);

				beforeEach(() => {
					// Check that the edit form is correctly populated
					checkEditFormMatchesIndexRow(targetRow);

					expected = {categoryName: "AAA Test subcategory (edited)", categoryParent: "AAA Test categor", direction: "inflow", isSubcategory: true};
					categoryEditView.enterCategoryDetails(expected);
				});

				commonBehaviour();

				it("should update an existing category when the save button is clicked", () => {
					categoryEditView.save();

					// Row count should not have changed
					categoryIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// After editing, the row should now be the first subcategory
					categoryIndexView.firstSubcategory().then(row => categoryIndexView.checkRowValues(row, expected));
				});
			});
		});
	});
});
