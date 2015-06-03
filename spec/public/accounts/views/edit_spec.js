(function() {
	"use strict";

	/*jshint expr: true */

	describe("accountEditView", function() {
		var accountIndexView,
				accountEditView,
				expected,
				accountTypeTable,
				accountTypeAccounts,
				originalRowCount,
				targetRow;

		beforeEach(function() {
			accountIndexView = require("./index");
			accountEditView = require("./edit");

			// Go to the accounts index page
			browser.get("/index.html#/accounts");
			browser.wait(protractor.ExpectedConditions.presenceOf(accountIndexView.total), 3000, "Timeout waiting for view to render");

		});

		describe("adding a bank account", function() {
			beforeEach(function() {
				accountIndexView.accountTypeTable("Bank").then(function(table) {
					accountTypeTable = table;
					accountIndexView.accountTypeAccounts(accountTypeTable).then(function(accounts) {
						accountTypeAccounts = accounts;
						accountTypeAccounts.count().then(function(count) {
							originalRowCount = count;
						});
					});
				});
			});

			beforeEach(function() {
				// Add a new account
				accountIndexView.addAccount();
				waitForAccountEditView("Add");
			});

			beforeEach(function() {
				targetRow = accountTypeAccounts.lastRow();
				expected = {name: "ZZZ Test Account", account_type: "bank", opening_balance: 1, status: "open"};
				//accountEditView.enterAccountDetails(expected);
			});

			//TODO
			//commonBehaviour();

			it("should insert a new account when the save button is clicked", function() {
				//accountEditView.save();

				// Row count should have incremented by one
				//accountTypeAccounts.count().should.eventually.equal(originalRowCount + 1);

				// Category in the target row should be the new category
				//accountIndexView.checkRowValues(targetRow, expected);
			});

			/*describe("subcategory", function() {
				describe("expense", function() {
					beforeEach(function() {
						targetRow = accountIndexView.table.lastRow();
						expected = {categoryName: "ZZZ Test subcategory", categoryParent: "ZZZ Test categor", direction: "outflow", isSubcategory: true};
						accountEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should insert a new category when the save button is clicked", function() {
						accountEditView.save();

						// Row count should have incremented by one
						accountIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

						// Category in the target row should be the new category
						accountIndexView.checkRowValues(targetRow, expected);
					});
				});

				describe("income", function() {
					beforeEach(function() {
						targetRow = accountIndexView.table.row(1);
						expected = {categoryName: "AAA Test subcategory", categoryParent: "AAA Test categor", direction: "inflow", isSubcategory: true};
						accountEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should insert a new category when the save button is clicked", function() {
						accountEditView.save();

						// Row count should have incremented by one
						accountIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

						// Category in the target row should be the new category
						accountIndexView.checkRowValues(targetRow, expected);
					});
				});
			});*/
		});

		/*describe("editing a category", function() {
			describe("parent", function() {
				describe("expense", function() {
					beforeEach(function() {
						accountIndexView.lastCategory().then(function(row) {
							targetRow = row;
						});
					});

					beforeEach(editRow);

					beforeEach(function() {
						// Check that the edit form is correctly populated
						checkEditFormMatchesIndexRow(targetRow);

						expected = {categoryName: "AA Test category (edited)", direction: "inflow"};
						accountEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should update an existing category when the save button is clicked", function() {
						accountEditView.save();

						// Row count should not have changed
						accountIndexView.table.rows.count().should.eventually.equal(originalRowCount);

						// After editing, the row should now be the first category
						accountIndexView.firstCategory().then(function(row) {
							accountIndexView.checkRowValues(row, expected);
						});
					});
				});

				describe("income", function() {
					beforeEach(function() {
						accountIndexView.firstCategory().then(function(row) {
							targetRow = row;
						});
					});

					beforeEach(editRow);

					beforeEach(function() {
						// Check that the edit form is correctly populated
						checkEditFormMatchesIndexRow(targetRow);

						expected = {categoryName: "ZZZ Test category (edited)", direction: "outflow"};
						accountEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should update an existing category when the save button is clicked", function() {
						accountEditView.save();

						// Row count should not have changed
						accountIndexView.table.rows.count().should.eventually.equal(originalRowCount);

						// After editing, the row should now be the last category
						accountIndexView.lastCategory().then(function(row) {
							accountIndexView.checkRowValues(row, expected);
						});
					});
				});
			});

			describe("subcategory", function() {
				describe("income", function() {
					beforeEach(function() {
						accountIndexView.firstSubcategory().then(function(row) {
							targetRow = row;
						});
					});
					
					beforeEach(editRow);

					beforeEach(function() {
						// Check that the edit form is correctly populated
						checkEditFormMatchesIndexRow(targetRow);

						expected = {categoryName: "ZZZ Test subcategory (edited)", categoryParent: "ZZZ Test category (edited", direction: "outflow", isSubcategory: true};
						accountEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should update an existing category when the save button is clicked", function() {
						accountEditView.save();

						// Row count should not have changed
						accountIndexView.table.rows.count().should.eventually.equal(originalRowCount);

						// After editing, the row should now be the last subcategory
						accountIndexView.lastSubcategory().then(function(row) {
							accountIndexView.checkRowValues(row, expected);
						});
					});
				});

				describe("expense", function() {
					beforeEach(function() {
						accountIndexView.lastSubcategory().then(function(row) {
							targetRow = row;
						});
					});
					
					beforeEach(editRow);

					beforeEach(function() {
						// Check that the edit form is correctly populated
						checkEditFormMatchesIndexRow(targetRow);

						expected = {categoryName: "AAA Test subcategory (edited)", categoryParent: "AAA Test categor", direction: "inflow", isSubcategory: true};
						accountEditView.enterCategoryDetails(expected);
					});

					commonBehaviour();

					it("should update an existing category when the save button is clicked", function() {
						accountEditView.save();

						// Row count should not have changed
						accountIndexView.table.rows.count().should.eventually.equal(originalRowCount);

						// After editing, the row should now be the first subcategory
						accountIndexView.firstSubcategory().then(function(row) {
							accountIndexView.checkRowValues(row, expected);
						});
					});
				});
			});
		});*/

		// Waits for the edit view to appear and checks the heading is correct
		function waitForAccountEditView(mode) {
			browser.wait(protractor.ExpectedConditions.presenceOf(accountEditView), 3000, "Timeout waiting for view to render");
			accountEditView.heading().should.eventually.equal(mode + " Account");
		}

		// Cancel & form invalid behaviour
		function commonBehaviour() {
			it("should not save changes when the cancel button is clicked", function() {
				accountIndexView.getRowValues(targetRow).then(function(expected) {
					accountEditView.cancel();

					// Row count should not have changed
					accountIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// Category in the target row should not have changed
					accountIndexView.checkRowValues(targetRow, expected);
				});
			});

			describe("invalid data", function() {
				beforeEach(function() {
					accountEditView.clearCategoryDetails();
				});

				it("should not enable the save button", function() {
					accountEditView.saveButton.isEnabled().should.eventually.be.false;
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
				accountIndexView.editCategory(index);
				waitForCategoryEditView("Edit");
			});
		}

		// Checks the values in the edit form against the values from an index row
		function checkEditFormMatchesIndexRow(row) {
			accountIndexView.getRowValues(row).then(function(expected) {
				accountEditView.categoryNameInput.getAttribute("value").should.eventually.equal(expected.categoryName);
				if (!expected.isSubcategory) {
					accountEditView.directionRadioButton(expected.direction, true).isPresent().should.eventually.be.true;
				} else {
					accountEditView.categoryParentTypeahead.getAttribute("value").should.eventually.equal(expected.categoryParent);
				}
			});
		}
	});
})();
