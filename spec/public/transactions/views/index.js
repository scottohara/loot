(function() {
	"use strict";

	function TransactionIndexView() {
		var view = this,
				OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");

		/**
		 * UI elements
		 */
		view.heading = heading;
		view.table = new OgTableNavigableView({
			rows: element.all(by.repeater("transaction in vm.transactions")),
			actions: {
				insert: {
					heading: "Add Transaction",
					view: require("./edit")
				},
				edit: {
					heading: "Edit Transaction",
					view: require("./edit"),
				},
				del: {
					heading: "Delete Transaction?",
					view: require("./delete")
				},
				select: {
					heading: "Edit Transaction",
					view: require("./edit"),
				}
			}
		});
		view.transactionDate = transactionDate;
		view.primaryAccountName = primaryAccountName;
		view.payeeName = payeeName;
		view.securityName = securityName;
		view.categoryName = categoryName;
		view.subcategoryName = subcategoryName;
		view.accountName = accountName;
		view.toggleSubtransactionsButton = toggleSubtransactionsButton;
		view.subtransactions = subtransactions;
		view.subtransactionCategoryName = subtransactionCategoryName;
		view.subtransactionSubcategoryName = subtransactionSubcategoryName;
		view.subtransactionAccountName = subtransactionAccountName;
		view.subtransactionMemo = subtransactionMemo;
		view.subtransactionAmount = subtransactionAmount;
		view.memo = memo;
		view.investmentDetails = investmentDetails;
		view.debitAmount = debitAmount;
		view.quantity = quantity;
		view.creditAmount = creditAmount;
		view.price = price;
		view.commission = commission;
		view.closingBalance = closingBalance;

		/**
		 * Behaviours
		 */
		view.isPresent = isPresent;
		view.goToTransaction = goToTransaction;
		view.addTransaction = addTransaction;
		view.editTransaction = editTransaction;
		view.deleteTransaction = deleteTransaction;
		view.getRowValues = getRowValues;
		view.checkRowValues = checkRowValues;
		view.checkSubtransactionRowValues = checkSubtransactionRowValues;

		function heading() {
			return element(by.binding("::vm.context.name")).getText();
		}

		function transactionDate(row) {
			return row.element(by.binding("::transaction.transaction_date")).getText();
		}

		function primaryAccountName(row) {
			return row.evaluate("vm.contextType").then(function(contextType) {
				if ("account" !== contextType) {
					return row.element(by.binding("::transaction.primary_account.name")).getText();
				}
			});
		}

		function payeeName(row) {
			return row.evaluate("transaction.payee").then(function(payee) {
				if (typeof payee === "string" || payee.id) {
					return row.element(by.binding("::transaction.payee.name")).getText();
				}
			});
		}

		function securityName(row) {
			return row.evaluate("transaction.security").then(function(security) {
				if (typeof security === "string" || security.id) {
					return row.element(by.binding("::transaction.security.name")).getText();
				}
			});
		}

		function categoryName(row) {
			return row.element(by.binding("::transaction.category.name")).getText();
		}

		function subcategoryName(row) {
			return row.evaluate("transaction.subcategory").then(function(subcategory) {
				if (subcategory) {
					return row.element(by.binding("::transaction.subcategory.name")).getText();
				}
			});
		}

		function accountName(row) {
			return row.evaluate("transaction.account").then(function(account) {
				if (account.id) {
					return row.element(by.binding("::transaction.account.name")).getText();
				}
			});
		}

		function toggleSubtransactionsButton(row) {
			return row.element(by.css("button.toggle-subtransactions"));
		}

		function subtransactions(row) {
			return row.all(by.repeater("subtransaction in transaction.subtransactions"));
		}

		function subtransactionCategoryName(row) {
			return row.element(by.binding("::subtransaction.category.name")).getText();
		}

		function subtransactionSubcategoryName(row) {
			return row.element(by.binding("::subtransaction.subcategory.name")).getText();
		}

		function subtransactionAccountName(row) {
			return row.element(by.binding("::subtransaction.account.name")).getText();
		}

		function subtransactionMemo(row) {
			return row.element(by.binding("::subtransaction.memo")).getText();
		}

		function subtransactionAmount(row) {
			return row.element(by.binding("::subtransaction.amount")).getText();
		}

		function memo(row) {
			return row.element(by.binding("::transaction.memo")).getText();
		}

		function investmentDetails(row) {
			return row.evaluate("(!transaction.memo) && transaction.transaction_type == 'SecurityInvestment'").then(function(quantity) {
				if (quantity) {
					return row.element(by.binding("::transaction.quantity")).getText();
				}
			});
		}

		function debitAmount(row) {
			return row.evaluate("vm.context.account_type != 'investment' && transaction.direction == 'outflow' && transaction.amount").then(function(debit) {
				if (debit) {
					return row.element(by.binding("::transaction.amount")).getText();
				}
			});
		}

		function creditAmount(row) {
			return row.evaluate("vm.context.account_type != 'investment' && transaction.direction == 'inflow' && transaction.amount").then(function(credit) {
				if (credit) {
					return row.element(by.binding("::transaction.amount")).getText();
				}
			});
		}

		function quantity(row) {
			return row.evaluate("vm.context.account_type").then(function(accountType) {
				if ("investment" === accountType) {
					return row.all(by.css("td.amount.details")).first().element(by.binding("::transaction.quantity")).getText();
				}
			});
		}

		function price(row) {
			return row.evaluate("vm.context.account_type == 'investment' && transaction.transaction_type == 'SecurityInvestment'").then(function(securityInvestment) {
				if (securityInvestment) {
					return row.element(by.binding("::transaction.price")).getText();
				}
			});
		}

		function commission(row) {
			return row.evaluate("vm.context.account_type == 'investment' && transaction.transaction_type == 'SecurityInvestment'").then(function(securityInvestment) {
				if (securityInvestment) {
					return row.element(by.binding("::transaction.commission")).getText();
				}
			});
		}

		function closingBalance() {
			return element(by.binding("vm.context.closing_balance")).getText();
		}

		function isPresent() {
			return view.table.row(0).isPresent();
		}

		// Double click a transaction
		function goToTransaction() {
			//TODO
		}

		// Create a new transaction
		function addTransaction() {
			view.table.ctrlN();
		}

		// Edit a transaction
		function editTransaction(index) {
			view.table.doubleClickRow(index);
		}

		// Delete a transaction
		function deleteTransaction(index) {
			view.table.clickRow(index);
			view.table.del();
		}

		// Gets the values from a row
		function getRowValues(row) {
			return protractor.promise.all([
				view.transactionDate(row),
				view.primaryAccountName(row),
				view.payeeName(row),
				view.securityName(row),
				view.categoryName(row),
				view.subcategoryName(row),
				view.accountName(row),
				view.subtransactions(row),
				view.memo(row),
				view.investmentDetails(row),
				view.debitAmount(row),
				view.creditAmount(row),
				view.quantity(row),
				view.price(row),
				view.commission(row)
			]).then(function(values) {
				return {
					transactionDate: values[0],
					primaryAccountName: values[1],
					payeeName: values[2],
					securityName: values[3],
					categoryName: values[4],
					subcategoryName: values[5],
					accountName: values[6],
					subtransactions: values[7],
					memo: values[8],
					investmentDetails: values[9],
					debitAmount: values[10],
					creditAmount: values[11],
					quantity: values[12],
					price: values[13],
					commission: values[14]
				};
			});
		}

		// Checks the values in a row against an expected set of values
		function checkRowValues(row, expected) {
			view.transactionDate(row).should.eventually.equal(expected.transactionDate);
			if (expected.primaryAccountName) {
				view.primaryAccountName(row).should.eventually.equal(expected.primaryAccountName);
			}
			if (expected.payeeName) {
				view.payeeName(row).should.eventually.equal(expected.payeeName);
			}
			if (expected.securityName) {
				view.securityName(row).should.eventually.equal(expected.securityName);
			}
			view.categoryName(row).should.eventually.equal(expected.categoryName);
			if (expected.subcategoryName) {
				view.subcategoryName(row).should.eventually.equal(expected.subcategoryName);
			}
			if (expected.accountName) {
				view.accountName(row).should.eventually.equal(expected.accountName);
			}
			if (expected.subtransactions && expected.subtransactions.length > 0) {
				view.toggleSubtransactionsButton(row).isPresent().should.eventually.equal(!!expected.subtransactions);
			}
			if (expected.memoFromInvestmentDetails) {
				view.memo(row).should.eventually.equal(expected.memoFromInvestmentDetails);
			} else {
				view.memo(row).should.eventually.equal(expected.memo);
			}
			if (expected.investmentDetails) {
				view.investmentDetails(row).should.eventually.equal(expected.investmentDetails);
			}
			if (expected.debitAmount) {
				view.debitAmount(row).should.eventually.equal(expected.debitAmount);
			}
			if (expected.creditAmount) {
				view.creditAmount(row).should.eventually.equal(expected.creditAmount);
			}
			if (expected.quantity) {
				view.quantity(row).should.eventually.equal(expected.quantity);
			}
			if (expected.price) {
				view.price(row).should.eventually.equal(expected.price);
			}
			if (expected.commission) {
				view.commission(row).should.eventually.equal(expected.commission);
			}
		}

		// Checks the values in a subtransaction row against an expected set of values
		function checkSubtransactionRowValues(row, expected) {
			view.subtransactionCategoryName(row).should.eventually.equal(expected.categoryName);
			if (expected.subcategoryName) {
				view.subtransactionSubcategoryName(row).should.eventually.equal(expected.subcategoryName);
			}
			if (expected.accountName) {
				view.subtransactionAccountName(row).should.eventually.equal(expected.accountName);
			}
			view.subtransactionMemo(row).should.eventually.equal(expected.memo);
			view.subtransactionAmount(row).should.eventually.equal(expected.amount);
		}
	}

	module.exports = new TransactionIndexView();
})();
