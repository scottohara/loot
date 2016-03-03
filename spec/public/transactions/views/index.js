{
	class TransactionIndexView {
		constructor() {
			const OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");

			this.table = new OgTableNavigableView({
				rows: element.all(by.repeater("transaction in vm.transactions")),
				actions: {
					insert: {
						heading: "Add Transaction",
						view: require("./edit")
					},
					edit: {
						heading: "Edit Transaction",
						view: require("./edit")
					},
					del: {
						heading: "Delete Transaction?",
						view: require("./delete")
					},
					select: {
						heading: "Edit Transaction",
						view: require("./edit")
					}
				}
			});
		}

		heading() {
			return element(by.binding("::vm.context.name")).getText();
		}

		transactionDate(row) {
			return row.element(by.binding("::transaction.transaction_date")).getText();
		}

		primaryAccountName(row) {
			return row.evaluate("vm.contextType").then(contextType => {
				if ("account" !== contextType) {
					return row.element(by.binding("::transaction.primary_account.name")).getText();
				}
				return null;
			});
		}

		payeeName(row) {
			return row.evaluate("transaction.payee").then(payee => {
				if ("string" === typeof payee || payee.id) {
					return row.element(by.binding("::transaction.payee.name")).getText();
				}
				return null;
			});
		}

		securityName(row) {
			return row.evaluate("transaction.security").then(security => {
				if ("string" === typeof security || security.id) {
					return row.element(by.binding("::transaction.security.name")).getText();
				}
				return null;
			});
		}

		categoryName(row) {
			return row.element(by.binding("::transaction.category.name")).getText();
		}

		subcategoryName(row) {
			return row.evaluate("transaction.subcategory").then(subcategory => {
				if (subcategory) {
					return row.element(by.binding("::transaction.subcategory.name")).getText();
				}
				return null;
			});
		}

		accountName(row) {
			return row.evaluate("transaction.account").then(account => {
				if (account.id) {
					return row.element(by.binding("::transaction.account.name")).getText();
				}
				return null;
			});
		}

		toggleSubtransactionsButton(row) {
			return row.element(by.css("button.toggle-subtransactions"));
		}

		subtransactions(row) {
			return row.all(by.repeater("subtransaction in transaction.subtransactions"));
		}

		subtransactionCategoryName(row) {
			return row.element(by.binding("::subtransaction.category.name")).getText();
		}

		subtransactionSubcategoryName(row) {
			return row.element(by.binding("::subtransaction.subcategory.name")).getText();
		}

		subtransactionAccountName(row) {
			return row.element(by.binding("::subtransaction.account.name")).getText();
		}

		subtransactionMemo(row) {
			return row.element(by.binding("::subtransaction.memo")).getText();
		}

		subtransactionAmount(row) {
			return row.element(by.binding("::subtransaction.amount")).getText();
		}

		memo(row) {
			return row.element(by.binding("::transaction.memo")).getText();
		}

		investmentDetails(row) {
			return row.evaluate("(!transaction.memo) && transaction.transaction_type == 'SecurityInvestment'").then(quantity => {
				if (quantity) {
					return row.element(by.binding("::transaction.quantity")).getText();
				}
				return null;
			});
		}

		debitAmount(row) {
			return row.evaluate("vm.context.account_type != 'investment' && transaction.direction == 'outflow' && transaction.amount").then(debit => {
				if (debit) {
					return row.element(by.binding("::transaction.amount")).getText();
				}
				return null;
			});
		}

		creditAmount(row) {
			return row.evaluate("vm.context.account_type != 'investment' && transaction.direction == 'inflow' && transaction.amount").then(credit => {
				if (credit) {
					return row.element(by.binding("::transaction.amount")).getText();
				}
				return null;
			});
		}

		quantity(row) {
			return row.evaluate("vm.context.account_type").then(accountType => {
				if ("investment" === accountType) {
					return row.all(by.css("td.amount.details")).first().element(by.binding("::transaction.quantity")).getText();
				}
				return null;
			});
		}

		price(row) {
			return row.evaluate("vm.context.account_type == 'investment' && transaction.transaction_type == 'SecurityInvestment'").then(securityInvestment => {
				if (securityInvestment) {
					return row.element(by.binding("::transaction.price")).getText();
				}
				return null;
			});
		}

		commission(row) {
			return row.evaluate("vm.context.account_type == 'investment' && transaction.transaction_type == 'SecurityInvestment'").then(securityInvestment => {
				if (securityInvestment) {
					return row.element(by.binding("::transaction.commission")).getText();
				}
				return null;
			});
		}

		closingBalance() {
			return element(by.binding("vm.context.closing_balance")).getText();
		}

		isPresent() {
			return this.table.row(0).isPresent();
		}

		// Double click a transaction
		goToTransaction() {
			// MISSING
		}

		// Create a new transaction
		addTransaction() {
			this.table.ctrlN();
		}

		// Edit a transaction
		editTransaction(index) {
			this.table.doubleClickRow(index);
		}

		// Delete a transaction
		deleteTransaction(index) {
			this.table.clickRow(index);
			this.table.del();
		}

		// Gets the values from a row
		getRowValues(row) {
			return protractor.promise.all([
				this.transactionDate(row),
				this.primaryAccountName(row),
				this.payeeName(row),
				this.securityName(row),
				this.categoryName(row),
				this.subcategoryName(row),
				this.accountName(row),
				this.subtransactions(row),
				this.memo(row),
				this.investmentDetails(row),
				this.debitAmount(row),
				this.creditAmount(row),
				this.quantity(row),
				this.price(row),
				this.commission(row)
			]).then(values => ({
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
			}));
		}

		// Checks the values in a row against an expected set of values
		checkRowValues(row, expected) {
			this.transactionDate(row).should.eventually.equal(expected.transactionDate);
			if (expected.primaryAccountName) {
				this.primaryAccountName(row).should.eventually.equal(expected.primaryAccountName);
			}
			if (expected.payeeName) {
				this.payeeName(row).should.eventually.equal(expected.payeeName);
			}
			if (expected.securityName) {
				this.securityName(row).should.eventually.equal(expected.securityName);
			}
			this.categoryName(row).should.eventually.equal(expected.categoryName);
			if (expected.subcategoryName) {
				this.subcategoryName(row).should.eventually.equal(expected.subcategoryName);
			}
			if (expected.accountName) {
				this.accountName(row).should.eventually.equal(expected.accountName);
			}
			if (expected.subtransactions && expected.subtransactions.length > 0) {
				this.toggleSubtransactionsButton(row).isPresent().should.eventually.equal(Boolean(expected.subtransactions));
			}
			if (expected.memoFromInvestmentDetails) {
				this.memo(row).should.eventually.equal(expected.memoFromInvestmentDetails);
			} else {
				this.memo(row).should.eventually.equal(expected.memo);
			}
			if (expected.investmentDetails) {
				this.investmentDetails(row).should.eventually.equal(expected.investmentDetails);
			}
			if (expected.debitAmount) {
				this.debitAmount(row).should.eventually.equal(expected.debitAmount);
			}
			if (expected.creditAmount) {
				this.creditAmount(row).should.eventually.equal(expected.creditAmount);
			}
			if (expected.quantity) {
				this.quantity(row).should.eventually.equal(expected.quantity);
			}
			if (expected.price) {
				this.price(row).should.eventually.equal(expected.price);
			}
			if (expected.commission) {
				this.commission(row).should.eventually.equal(expected.commission);
			}
		}

		// Checks the values in a subtransaction row against an expected set of values
		checkSubtransactionRowValues(row, expected) {
			this.subtransactionCategoryName(row).should.eventually.equal(expected.categoryName);
			if (expected.subcategoryName) {
				this.subtransactionSubcategoryName(row).should.eventually.equal(expected.subcategoryName);
			}
			if (expected.accountName) {
				this.subtransactionAccountName(row).should.eventually.equal(expected.accountName);
			}
			this.subtransactionMemo(row).should.eventually.equal(expected.memo);
			this.subtransactionAmount(row).should.eventually.equal(expected.amount);
		}
	}

	module.exports = new TransactionIndexView();
}
