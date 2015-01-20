(function() {
	"use strict";

	/*jshint expr: true */

	describe("scheduleIndexView", function() {
		var scheduleIndexView = require("./index"),
				moment = require("../../../../node_modules/moment/moment"),
				expected;

		beforeEach(function() {
			var tomorrow = moment().add(1, "days").format("DD/MM/YYYY");

			expected = [
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "bank account 1",
					payeeName: "Payee 1",
					categoryName: "Category 13",
					subcategoryName: "Category 15",
					memo: "Basic transaction",
					frequency: "Monthly",
					debitAmount: "~$1.00"
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "bank account 1",
					payeeName: "Payee 1",
					categoryName: "Category 1",
					subcategoryName: "Category 3",
					memo: "Basic transaction",
					frequency: "Monthly",
					creditAmount: "~$1.00"
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "bank account 1",
					payeeName: "Payee 1",
					categoryName: "Transfer To",
					accountName: "bank account 2",
					memo: "Transfer transaction",
					frequency: "Monthly",
					debitAmount: "~$1.00"
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "bank account 1",
					payeeName: "Payee 1",
					categoryName: "Split To",
					subtransactions: [
						{
							categoryName: "Category 13",
							subcategoryName: "Category 15",
							memo: "Sub transaction",
							amount: "$1.00"
						},
						{
							categoryName: "Category 13",
							subcategoryName: "Category 15",
							memo: "Sub transaction",
							amount: "$1.00"
						}
					],
					memo: "Split transaction",
					frequency: "Monthly",
					debitAmount: "~$2.00"
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "bank account 1",
					payeeName: "Payee 1",
					categoryName: "Loan Repayment",
					subtransactions: [
						{
							categoryName: "Category 13",
							subcategoryName: "Category 15",
							memo: "Sub transaction",
							amount: "$1.00"
						},
						{
							categoryName: "Category 13",
							subcategoryName: "Category 15",
							memo: "Sub transaction",
							amount: "$1.00"
						}
					],
					memo: "LoanRepayment transaction",
					frequency: "Monthly",
					debitAmount: "~$2.00"
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "bank account 1",
					payeeName: "Payee 1",
					categoryName: "Payslip",
					subtransactions: [
						{
							categoryName: "Category 1",
							subcategoryName: "Category 3",
							memo: "Sub transaction",
							amount: "$1.00"
						},
						{
							categoryName: "Category 1",
							subcategoryName: "Category 3",
							memo: "Sub transaction",
							amount: "$1.00"
						}
					],
					memo: "Payslip transaction",
					frequency: "Monthly",
					creditAmount: "~$2.00"
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "investment account 5",
					securityName: "Security 1",
					categoryName: "Buy",
					accountName: "bank account 6",
					memo: "SecurityInvestment transaction",
					frequency: "Monthly",
					creditAmount: "~$2.00"
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "investment account 5",
					securityName: "Security 1",
					categoryName: "Sell",
					accountName: "bank account 6",
					memo: "SecurityInvestment transaction",
					frequency: "Monthly",
					debitAmount: "~$0.00"
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "investment account 5",
					securityName: "Security 1",
					categoryName: "Add Shares",
					memo: "SecurityHolding transaction",
					frequency: "Monthly",
					creditAmount: ""
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "investment account 5",
					securityName: "Security 1",
					categoryName: "Remove Shares",
					memo: "SecurityHolding transaction",
					frequency: "Monthly",
					debitAmount: ""
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "investment account 5",
					securityName: "Security 1",
					categoryName: "Transfer To",
					memo: "SecurityTransfer transaction",
					frequency: "Monthly",
					debitAmount: ""
				},
				{
					nextDueDate: tomorrow,
					isAutoEntered: true,
					primaryAccountName: "investment account 5",
					securityName: "Security 1",
					categoryName: "Dividend To",
					memo: "Dividend transaction",
					frequency: "Monthly",
					debitAmount: "~$1.00"
				}
			];

			// Go to the schedule index page
			browser.get("/index.html#/schedules");
			browser.wait(protractor.ExpectedConditions.presenceOf(scheduleIndexView.table.row(0)), 3000, "Timeout waiting for view to render");
		});

		it("should display a row for each schedule", function() {
			// Number of rows
			scheduleIndexView.table.rows.count().should.eventually.equal(expected.length);

			scheduleIndexView.table.rows.each(function(row, index) {
				// Row values
				scheduleIndexView.checkRowValues(row, expected[index]);

				if (expected[index].subtransactions) {
					// Show subtransactions
					scheduleIndexView.toggleSubtransactionsButton(row).click().then(function() {
						browser.waitForAngular();
						scheduleIndexView.subtransactions(row).each(function(subrow, subindex) {
							scheduleIndexView.checkSubtransactionRowValues(subrow, expected[index].subtransactions[subindex]);
						});
					});

					// Hide subtransactions
					scheduleIndexView.toggleSubtransactionsButton(row).click().then(function() {
						scheduleIndexView.subtransactions(row).get(0).isDisplayed().should.eventually.be.false;
					});
				}
			});
		});

		scheduleIndexView.table.behavesLikeNavigableTable();
	});
})();
