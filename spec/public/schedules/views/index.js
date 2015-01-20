(function() {
	"use strict";

	function ScheduleIndexView() {
		var view = this,
				OgTableNavigableView = require("../../og-components/og-table-navigable/views/og-table-navigable.js");

		/**
		 * UI elements
		 */
		view.table = new OgTableNavigableView({
			rows: element.all(by.repeater("schedule in vm.schedules")),
			actions: {
				insert: {
					heading: "Add Schedule",
					view: require("./edit")
				},
				edit: {
					heading: "Enter Transaction",
					view: require("./edit"),
				},
				del: {
					heading: "Delete Schedule?",
					view: require("./delete")
				},
				select: {
					heading: "Enter Transaction",
					view: require("./edit"),
				}
			}
		});
		view.nextDueDate = nextDueDate;
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
		view.commission = commission;
		view.frequency = frequency;
		view.debitAmount = debitAmount;
		view.creditAmount = creditAmount;

		/**
		 * Behaviours
		 */
		view.isAutoEntered = isAutoEntered;
		view.goToSchedule = goToSchedule;
		view.addSchedule = addSchedule;
		view.enterSchedule = enterSchedule;
		view.deleteSchedule = deleteSchedule;
		view.getRowValues = getRowValues;
		view.checkRowValues = checkRowValues;
		view.checkSubtransactionRowValues = checkSubtransactionRowValues;

		function nextDueDate(row) {
			return row.element(by.binding("::schedule.next_due_date")).getText();
		}

		function primaryAccountName(row) {
			return row.element(by.binding("::schedule.primary_account.name")).getText();
		}

		function payeeName(row) {
			return row.evaluate("schedule.payee").then(function(payee) {
				if (typeof payee === "string" || payee.id) {
					return row.element(by.binding("::schedule.payee.name")).getText();
				}
			});
		}

		function securityName(row) {
			return row.evaluate("schedule.security").then(function(security) {
				if (typeof security === "string" || security.id) {
					return row.element(by.binding("::schedule.security.name")).getText();
				}
			});
		}

		function categoryName(row) {
			return row.element(by.binding("::schedule.category.name")).getText();
		}

		function subcategoryName(row) {
			return row.evaluate("schedule.subcategory").then(function(subcategory) {
				if (subcategory) {
					return row.element(by.binding("::schedule.subcategory.name")).getText();
				}
			});
		}

		function accountName(row) {
			return row.evaluate("schedule.account").then(function(account) {
				if (account.id) {
					return row.element(by.binding("::schedule.account.name")).getText();
				}
			});
		}

		function toggleSubtransactionsButton(row) {
			return row.element(by.css("button.toggle-subtransactions"));
		}

		function subtransactions(row) {
			return row.all(by.repeater("subtransaction in schedule.subtransactions"));
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
			return row.element(by.binding("::schedule.memo")).getText();
		}

		function investmentDetails(row) {
			return row.evaluate("(!schedule.memo) && schedule.transaction_type == 'SecurityInvestment'").then(function(quantity) {
				if (quantity) {
					return row.element(by.binding("::schedule.quantity")).getText();
				}
			});
		}

		function commission(row) {
			return row.evaluate("(!schedule.memo) && schedule.transaction_type == 'SecurityInvestment' && schedule.commission").then(function(commission) {
				if (commission) {
					return row.element(by.binding("::schedule.commission")).getText();
				}
			});
		}

		function frequency(row) {
			return row.element(by.binding("::schedule.frequency")).getText();
		}

		function debitAmount(row) {
			return row.evaluate("schedule.direction == 'outflow' && schedule.amount").then(function(debit) {
				if (debit) {
					return row.element(by.binding("::schedule.amount")).getText();
				}
			});
		}

		function creditAmount(row) {
			return row.evaluate("schedule.direction == 'inflow' && schedule.amount").then(function(credit) {
				if (credit) {
					return row.element(by.binding("::schedule.amount")).getText();
				}
			});
		}

		function isAutoEntered(row) {
			return row.element(by.css("i.glyphicon-pushpin")).isPresent();
		}

		// Double click a schedule
		function goToSchedule() {
			//TODO
		}

		// Create a new schedule
		function addSchedule() {
			view.table.ctrlN();
		}

		// Enter a schedule
		function enterSchedule(index) {
			view.table.doubleClickRow(index);
		}

		// Delete a schedule
		function deleteSchedule(index) {
			view.table.clickRow(index);
			view.table.del();
		}

		// Gets the values from a row
		function getRowValues(row) {
			return protractor.promise.all([
				view.nextDueDate(row),
				view.isAutoEntered(row),
				view.primaryAccountName(row),
				view.payeeName(row),
				view.securityName(row),
				view.categoryName(row),
				view.subcategoryName(row),
				view.accountName(row),
				view.subtransactions(row),
				view.memo(row),
				view.investmentDetails(row),
				view.commission(row),
				view.frequency(row),
				view.debitAmount(row),
				view.creditAmount(row)
			]).then(function(values) {
				return {
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
				};
			});
		}

		// Checks the values in a row against an expected set of values
		function checkRowValues(row, expected) {
			view.nextDueDate(row).should.eventually.equal(expected.nextDueDate);
			view.isAutoEntered(row).should.eventually.equal(!!expected.isAutoEntered);
			view.primaryAccountName(row).should.eventually.equal(expected.primaryAccountName);
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
			if (!expected.memoFromInvestmentDetails && !expected.memo && expected.commission) {
				view.commission(row).should.eventually.equal(expected.commission);
			}
			view.frequency(row).should.eventually.equal(expected.frequency);
			if (expected.debitAmount) {
				view.debitAmount(row).should.eventually.equal(expected.debitAmount);
			}
			if (expected.creditAmount) {
				view.creditAmount(row).should.eventually.equal(expected.creditAmount);
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

	module.exports = new ScheduleIndexView();
})();
