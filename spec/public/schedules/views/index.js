{
	class ScheduleIndexView {
		constructor() {
			const OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");

			this.table = new OgTableNavigableView({
				rows: element.all(by.repeater("schedule in vm.schedules")),
				actions: {
					insert: {
						heading: "Add Schedule",
						view: require("./edit")
					},
					edit: {
						heading: "Enter Transaction",
						view: require("./edit")
					},
					del: {
						heading: "Delete Schedule?",
						view: require("./delete")
					},
					select: {
						heading: "Enter Transaction",
						view: require("./edit")
					}
				}
			});
		}

		nextDueDate(row) {
			return row.element(by.binding("::schedule.next_due_date")).getText();
		}

		primaryAccountName(row) {
			return row.element(by.binding("::schedule.primary_account.name")).getText();
		}

		payeeName(row) {
			return row.evaluate("schedule.payee").then(payee => {
				if ("string" === typeof payee || payee.id) {
					return row.element(by.binding("::schedule.payee.name")).getText();
				}
			});
		}

		securityName(row) {
			return row.evaluate("schedule.security").then(security => {
				if ("string" === typeof security || security.id) {
					return row.element(by.binding("::schedule.security.name")).getText();
				}
			});
		}

		categoryName(row) {
			return row.element(by.binding("::schedule.category.name")).getText();
		}

		subcategoryName(row) {
			return row.evaluate("schedule.subcategory").then(subcategory => {
				if (subcategory) {
					return row.element(by.binding("::schedule.subcategory.name")).getText();
				}
			});
		}

		accountName(row) {
			return row.evaluate("schedule.account").then(account => {
				if (account.id) {
					return row.element(by.binding("::schedule.account.name")).getText();
				}
			});
		}

		toggleSubtransactionsButton(row) {
			return row.element(by.css("button.toggle-subtransactions"));
		}

		subtransactions(row) {
			return row.all(by.repeater("subtransaction in schedule.subtransactions"));
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
			return row.element(by.binding("::schedule.memo")).getText();
		}

		investmentDetails(row) {
			return row.evaluate("(!schedule.memo) && schedule.transaction_type == 'SecurityInvestment'").then(quantity => {
				if (quantity) {
					return row.element(by.binding("::schedule.quantity")).getText();
				}
			});
		}

		commission(row) {
			return row.evaluate("(!schedule.memo) && schedule.transaction_type == 'SecurityInvestment' && schedule.commission").then(commission => {
				if (commission) {
					return row.element(by.binding("::schedule.commission")).getText();
				}
			});
		}

		frequency(row) {
			return row.element(by.binding("::schedule.frequency")).getText();
		}

		debitAmount(row) {
			return row.evaluate("schedule.direction == 'outflow' && schedule.amount").then(debit => {
				if (debit) {
					return row.element(by.binding("::schedule.amount")).getText();
				}
			});
		}

		creditAmount(row) {
			return row.evaluate("schedule.direction == 'inflow' && schedule.amount").then(credit => {
				if (credit) {
					return row.element(by.binding("::schedule.amount")).getText();
				}
			});
		}

		isAutoEntered(row) {
			return row.element(by.css("i.glyphicon-pushpin")).isPresent();
		}

		// Double click a schedule
		goToSchedule() {
			// MISSING
		}

		// Create a new schedule
		addSchedule() {
			this.table.ctrlN();
		}

		// Enter a schedule
		enterSchedule(index) {
			this.table.doubleClickRow(index);
		}

		// Delete a schedule
		deleteSchedule(index) {
			this.table.clickRow(index);
			this.table.del();
		}

		// Gets the values from a row
		getRowValues(row) {
			return protractor.promise.all([
				this.nextDueDate(row),
				this.isAutoEntered(row),
				this.primaryAccountName(row),
				this.payeeName(row),
				this.securityName(row),
				this.categoryName(row),
				this.subcategoryName(row),
				this.accountName(row),
				this.subtransactions(row),
				this.memo(row),
				this.investmentDetails(row),
				this.commission(row),
				this.frequency(row),
				this.debitAmount(row),
				this.creditAmount(row)
			]).then(values => ({
				nextDueDate: values[0],
				isAutoEntered: values[1],
				primaryAccountName: values[2],
				payeeName: values[3],
				securityName: values[4],
				categoryName: values[5],
				subcategoryName: values[6],
				accountName: values[7],
				subtransactions: values[8],
				memo: values[9],
				investmentDetails: values[10],
				commission: values[11],
				frequency: values[12],
				debitAmount: values[13],
				creditAmount: values[14]
			}));
		}

		// Checks the values in a row against an expected set of values
		checkRowValues(row, expected) {
			this.nextDueDate(row).should.eventually.equal(expected.nextDueDate);
			this.isAutoEntered(row).should.eventually.equal(Boolean(expected.isAutoEntered));
			this.primaryAccountName(row).should.eventually.equal(expected.primaryAccountName);
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
			if (!expected.memoFromInvestmentDetails && !expected.memo && expected.commission) {
				this.commission(row).should.eventually.equal(expected.commission);
			}
			this.frequency(row).should.eventually.equal(expected.frequency);
			if (expected.debitAmount) {
				this.debitAmount(row).should.eventually.equal(expected.debitAmount);
			}
			if (expected.creditAmount) {
				this.creditAmount(row).should.eventually.equal(expected.creditAmount);
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

	module.exports = new ScheduleIndexView();
}
