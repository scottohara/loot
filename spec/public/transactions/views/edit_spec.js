(function() {
	"use strict";

	/*jshint expr: true */

	describe("transactionEditView", function() {
		var accountIndexView,
				transactionIndexView,
				transactionEditView,
				moment = require("../../../../node_modules/moment/moment"),
				today = moment().format("DD/MM/YYYY"),
				expected,
				originalRowCount,
				targetRow;

		beforeEach(function() {
			accountIndexView = require("../../accounts/views/index");
			transactionIndexView = require("./index");
			transactionEditView = require("./edit");

			// Go to the account index page
			browser.get("/index.html#/accounts");
			browser.wait(protractor.ExpectedConditions.presenceOf(accountIndexView.total), 3000, "Timeout waiting for view to render");
		});

		var transactions = {
			"bank account 1": {
				transactions: [
					{
						transactionDate: today,
						payeeName: "Payee 1",
						amount: 1,
						debitAmount: "$1.00",
						categoryName: "Category 13",
						subcategoryName: "Category 15",
						memo: "Basic expense",
						balance: "$997.00",
						closingBalance: "$997.00"
					},
					{
						transactionDate: today,
						payeeName: "Payee 1",
						amount: 1,
						creditAmount: "$1.00",
						categoryName: "Category 1",
						subcategoryName: "Category 3",
						memo: "Basic income",
						balance: "$998.00",
						closingBalance: "$998.00"
					},
					{
						transactionDate: today,
						payeeName: "Payee 1",
						amount: 1,
						debitAmount: "$1.00",
						categoryName: "Transfer To",
						accountName: "bank account 2",
						memo: "Transfer",
						balance: "$997.00",
						closingBalance: "$997.00"
					},
					{
						transactionDate: today,
						payeeName: "Payee 1",
						amount: 2,
						debitAmount: "$2.00",
						categoryName: "Split To",
						subtransactions: [
							{
								categoryName: "Category 13",
								subcategoryName: "Category 15",
								memo: "Sub transaction",
								rawAmount: 1,
								amount: "$1.00"
							},
							{
								categoryName: "Category 13",
								subcategoryName: "Category 15",
								memo: "Sub transaction",
								rawAmount: 1,
								amount: "$1.00"
							}
						],
						memo: "Split",
						balance: "$995.00",
						closingBalance: "$995.00"
					},
					{
						transactionDate: today,
						payeeName: "Payee 1",
						amount: 2,
						debitAmount: "$2.00",
						categoryName: "Loan Repayment",
						subtransactions: [
							{
								categoryName: "Category 13",
								subcategoryName: "Category 15",
								memo: "Sub transaction",
								rawAmount: 1,
								amount: "$1.00"
							},
							{
								categoryName: "Category 13",
								subcategoryName: "Category 15",
								memo: "Sub transaction",
								rawAmount: 1,
								amount: "$1.00"
							}
						],
						memo: "Loan Repayment",
						balance: "$993.00",
						closingBalance: "$993.00"
					},
					{
						transactionDate: today,
						payeeName: "Payee 1",
						amount: 2,
						creditAmount: "$2.00",
						categoryName: "Payslip",
						subtransactions: [
							{
								categoryName: "Category 1",
								subcategoryName: "Category 3",
								memo: "Sub transaction",
								rawAmount: 1,
								amount: "$1.00"
							},
							{
								categoryName: "Category 1",
								subcategoryName: "Category 3",
								memo: "Sub transaction",
								rawAmount: 1,
								amount: "$1.00"
							}
						],
						memo: "Payslip",
						balance: "$995.00",
						closingBalance: "$995.00"
					}
				]
			},
			"investment account 5": {
				transactions: [
					{
						transactionDate: today,
						securityName: "Security 1",
						categoryName: "Buy",
						accountName: "bank account 6",
						quantity: "2",
						price: "$1",
						commission: "$1.00",
						memo: "",
						memoFromInvestmentDetails: "2 @ $1.00 (plus $1.00 commission)",
						type: "Security Buy (no memo)",
						total: "$1.00",
						closingBalance: "$991.00"
					},
					{
						transactionDate: today,
						securityName: "Security 1",
						categoryName: "Buy",
						accountName: "bank account 6",
						quantity: "2",
						price: "$1",
						commission: "$1.00",
						memo: "Security Buy",
						total: "$1.00",
						closingBalance: "$990.00"
					},
					{
						transactionDate: today,
						securityName: "Security 1",
						categoryName: "Sell",
						accountName: "bank account 6",
						quantity: "2",
						price: "$1",
						commission: "$1.00",
						memo: "Security Sell",
						total: "$1.00",
						closingBalance: "$985.00"
					},
					{
						transactionDate: today,
						securityName: "Security 1",
						quantity: "1",
						categoryName: "Add Shares",
						memo: "Security Add",
						closingBalance: ""
					},
					{
						transactionDate: today,
						securityName: "Security 1",
						quantity: "1",
						categoryName: "Remove Shares",
						memo: "Security Remove",
						closingBalance: ""
					},
					{
						transactionDate: today,
						securityName: "Security 1",
						quantity: "1",
						categoryName: "Transfer To",
						accountName: "investment account 7",
						memo: "Security Transfer",
						closingBalance: ""
					},
					{
						transactionDate: today,
						securityName: "Security 1",
						amount: "1",
						categoryName: "Dividend To",
						accountName: "bank account 6",
						memo: "Dividend",
						total: "$1.00",
						closingBalance: "$983.00"
					}
				]
			}
		};

		Object.keys(transactions).forEach(function(account) {
			describe(account, function() {
				beforeEach(function() {
					// Go to the transaction index page
					accountIndexView.goToAccount(account);
					browser.wait(protractor.ExpectedConditions.presenceOf(transactionIndexView.table.row(0)), 3000, "Timeout waiting for view to render");

					transactionIndexView.table.rows.count().then(function(count) {
						originalRowCount = count;
					});
				});

				describe("adding a transaction", function() {
					beforeEach(function() {
						// Add a new transaction
						transactionIndexView.addTransaction();
						waitForTransactionEditView("Add");
						targetRow = transactionIndexView.table.lastRow();
						scrollIntoView(targetRow);
					});

					transactions[account].transactions.forEach(function(transaction) {
						describe(transaction.type || transaction.memo, function() {
							beforeEach(function() {
								expected = transaction;
								transactionEditView.enterTransactionDetails(expected);
							});

							commonBehaviour();

							it("should insert a new transaction when the save button is clicked", function() {
								transactionEditView.save();

								// Row count should have incremented by one
								transactionIndexView.table.rows.count().should.eventually.equal(originalRowCount + 1);

								// Transaction in the target row should be the new transaction
								transactionIndexView.checkRowValues(targetRow, expected);

								// Closing balance should match the new closing balance
								transactionIndexView.closingBalance().should.eventually.equal(expected.closingBalance);
							});
						});
					});
				});

				/*describe("editing a category", function() {
					describe("parent", function() {
						describe("expense", function() {
							beforeEach(function() {
								transactionIndexView.lastCategory().then(function(row) {
									targetRow = row;
								});
							});

							beforeEach(editRow);

							beforeEach(function() {
								// Check that the edit form is correctly populated
								checkEditFormMatchesIndexRow(targetRow);

								expected = {categoryName: "AA Test category (edited)", direction: "inflow"};
								transactionEditView.enterCategoryDetails(expected);
							});

							commonBehaviour();

							it("should update an existing category when the save button is clicked", function() {
								transactionEditView.save();

								// Row count should not have changed
								transactionIndexView.table.rows.count().should.eventually.equal(originalRowCount);

								// After editing, the row should now be the first category
								transactionIndexView.firstCategory().then(function(row) {
									transactionIndexView.checkRowValues(row, expected);
								});
							});
						});

						describe("income", function() {
							beforeEach(function() {
								transactionIndexView.firstCategory().then(function(row) {
									targetRow = row;
								});
							});

							beforeEach(editRow);

							beforeEach(function() {
								// Check that the edit form is correctly populated
								checkEditFormMatchesIndexRow(targetRow);

								expected = {categoryName: "ZZZ Test category (edited)", direction: "outflow"};
								transactionEditView.enterCategoryDetails(expected);
							});

							commonBehaviour();

							it("should update an existing category when the save button is clicked", function() {
								transactionEditView.save();

								// Row count should not have changed
								transactionIndexView.table.rows.count().should.eventually.equal(originalRowCount);

								// After editing, the row should now be the last category
								transactionIndexView.lastCategory().then(function(row) {
									transactionIndexView.checkRowValues(row, expected);
								});
							});
						});
					});

					describe("subcategory", function() {
						describe("income", function() {
							beforeEach(function() {
								transactionIndexView.firstSubcategory().then(function(row) {
									targetRow = row;
								});
							});
							
							beforeEach(editRow);

							beforeEach(function() {
								// Check that the edit form is correctly populated
								checkEditFormMatchesIndexRow(targetRow);

								expected = {categoryName: "ZZZ Test subcategory (edited)", categoryParent: "ZZZ Test category (edited", direction: "outflow", isSubcategory: true};
								transactionEditView.enterCategoryDetails(expected);
							});

							commonBehaviour();

							it("should update an existing category when the save button is clicked", function() {
								transactionEditView.save();

								// Row count should not have changed
								transactionIndexView.table.rows.count().should.eventually.equal(originalRowCount);

								// After editing, the row should now be the last subcategory
								transactionIndexView.lastSubcategory().then(function(row) {
									transactionIndexView.checkRowValues(row, expected);
								});
							});
						});

						describe("expense", function() {
							beforeEach(function() {
								transactionIndexView.lastSubcategory().then(function(row) {
									targetRow = row;
								});
							});
							
							beforeEach(editRow);

							beforeEach(function() {
								// Check that the edit form is correctly populated
								checkEditFormMatchesIndexRow(targetRow);

								expected = {categoryName: "AAA Test subcategory (edited)", categoryParent: "AAA Test categor", direction: "inflow", isSubcategory: true};
								transactionEditView.enterCategoryDetails(expected);
							});

							commonBehaviour();

							it("should update an existing category when the save button is clicked", function() {
								transactionEditView.save();

								// Row count should not have changed
								transactionIndexView.table.rows.count().should.eventually.equal(originalRowCount);

								// After editing, the row should now be the first subcategory
								transactionIndexView.firstSubcategory().then(function(row) {
									transactionIndexView.checkRowValues(row, expected);
								});
							});
						});
					});
				});*/
			});
		});

		// Waits for the edit view to appear and checks the heading is correct
		function waitForTransactionEditView(mode) {
			browser.wait(transactionEditView.isPresent, 3000, "Timeout waiting for view to render");
			transactionEditView.heading().should.eventually.equal(mode + " Transaction");
		}

		// Ensures that the target row is scrolled into view
		function scrollIntoView(row) {
			browser.executeScript(function(row) {
				row.scrollIntoView();
			}, row.getWebElement());
		}

		// Cancel & form invalid behaviour
		function commonBehaviour() {
			it("should not save changes when the cancel button is clicked", function() {
				transactionIndexView.getRowValues(targetRow).then(function(expected) {
					transactionEditView.cancel();

					// Row count should not have changed
					transactionIndexView.table.rows.count().should.eventually.equal(originalRowCount);

					// Transaction in the target row should not have changed
					transactionIndexView.checkRowValues(targetRow, expected);
				});
			});

			describe("invalid data", function() {
				beforeEach(function() {
					transactionEditView.clearTransactionDetails();
				});

				it("should not enable the save button", function() {
					transactionEditView.saveButton.isEnabled().should.eventually.be.false;
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
				// Enter an existing transaction
				transactionIndexView.enterTransaction(index);
				waitForTransactionEditView("Edit");
			});
		}

		// Checks the values in the edit form against the values from an index row
		function checkEditFormMatchesIndexRow(row) {
			transactionIndexView.getRowValues(row).then(function(expected) {
				// TODO
				transactionEditView.categoryNameInput.getAttribute("value").should.eventually.equal(expected.categoryName);
				if (!expected.isSubcategory) {
					transactionEditView.directionRadioButton(expected.direction, true).isPresent().should.eventually.be.true;
				} else {
					transactionEditView.categoryParentInput.getAttribute("value").should.eventually.equal(expected.categoryParent);
				}
			});
		}
	});
})();
