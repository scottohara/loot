describe("transactionIndexView", () => {
	const expected = {
		"bank account 1": {
			transactions: [
				{
					transactionDate: "13/01/2014",
					payeeName: "Payee 1",
					categoryName: "Category 13",
					subcategoryName: "Category 15",
					memo: "Basic transaction",
					debitAmount: "$1.00",
					balance: "$999.00"
				},
				{
					transactionDate: "14/01/2014",
					payeeName: "Payee 1",
					categoryName: "Category 1",
					subcategoryName: "Category 3",
					memo: "Basic transaction",
					creditAmount: "$1.00",
					balance: "$1,000.00"
				},
				{
					transactionDate: "15/01/2014",
					payeeName: "Payee 1",
					categoryName: "Transfer To",
					accountName: "bank account 2",
					memo: "Transfer transaction",
					debitAmount: "$1.00",
					balance: "$999.00"
				},
				{
					transactionDate: "16/01/2014",
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
					debitAmount: "$2.00",
					balance: "$997.00"
				},
				{
					transactionDate: "17/01/2014",
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
					debitAmount: "$2.00",
					balance: "$995.00"
				},
				{
					transactionDate: "18/01/2014",
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
					creditAmount: "$2.00",
					balance: "$997.00"
				},
				{
					transactionDate: "24/01/2014",
					securityName: "Security 1",
					categoryName: "Dividend From",
					accountName: "investment account 5",
					memo: "Dividend transaction",
					creditAmount: "$1.00",
					balance: "$998.00"
				}
			],
			closingBalance: "$998.00",
			behavesLikeNavigableTable: true
		},
		"bank account 2": {
			transactions: [
				{
					transactionDate: "15/01/2014",
					payeeName: "Payee 1",
					categoryName: "Transfer From",
					accountName: "bank account 1",
					memo: "Transfer transaction",
					creditAmount: "$1.00",
					balance: "$1,001.00"
				}
			],
			closingBalance: "$1,001.00"
		},
		"bank account 6": {
			cashAccountFor: "investment account 5",
			transactions: [
				{
					transactionDate: "19/01/2014",
					securityName: "Security 1",
					categoryName: "Transfer To",
					accountName: "investment account 5",
					memo: "SecurityInvestment transaction",
					debitAmount: "$2.00",
					balance: "$998.00"
				},
				{
					transactionDate: "20/01/2014",
					securityName: "Security 2",
					categoryName: "Transfer From",
					accountName: "investment account 5",
					memo: "SecurityInvestment transaction",
					creditAmount: "$1.00",
					balance: "$999.00"
				}
			],
			closingBalance: "$999.00"
		},
		"investment account 5": {
			transactions: [
				{
					transactionDate: "19/01/2014",
					securityName: "Security 1",
					categoryName: "Buy",
					accountName: "bank account 6",
					memo: "SecurityInvestment transaction",
					quantity: "1",
					price: "$1",
					commission: "$1.00",
					total: "$0.00"
				},
				{
					transactionDate: "20/01/2014",
					securityName: "Security 2",
					categoryName: "Sell",
					accountName: "bank account 6",
					memo: "SecurityInvestment transaction",
					quantity: "2",
					price: "$1",
					commission: "$1.00",
					total: "$1.00"
				},
				{
					transactionDate: "21/01/2014",
					securityName: "Security 1",
					categoryName: "Add Shares",
					memo: "SecurityHolding transaction",
					quantity: "10"
				},
				{
					transactionDate: "22/01/2014",
					securityName: "Security 1",
					categoryName: "Remove Shares",
					memo: "SecurityHolding transaction",
					quantity: "10"
				},
				{
					transactionDate: "23/01/2014",
					securityName: "Security 1",
					categoryName: "Transfer To",
					accountName: "investment account 7",
					memo: "SecurityTransfer transaction",
					quantity: "10"
				},
				{
					transactionDate: "24/01/2014",
					securityName: "Security 1",
					categoryName: "Dividend To",
					memo: "Dividend transaction",
					total: "$1.00"
				}
			],
			closingBalance: "$988.00"
		},
		"investment account 7": {
			transactions: [
				{
					transactionDate: "23/01/2014",
					securityName: "Security 1",
					categoryName: "Transfer From",
					accountName: "investment account 5",
					memo: "SecurityTransfer transaction",
					quantity: "10"
				}
			],
			closingBalance: "$1,010.00"
		}
	};

	let accountIndexView,
			transactionIndexView = require("./index");

	beforeEach(() => {
		accountIndexView = require("../../accounts/views/index");
		transactionIndexView = require("./index");

		// Go to the account index page
		browser.get("/index.html#/accounts");
		browser.wait(protractor.ExpectedConditions.presenceOf(accountIndexView.total), 3000, "Timeout waiting for view to render");
	});

	Object.keys(expected).forEach(account => {
		describe(account, () => {
			beforeEach(() => {
				// Go to the transaction index page
				if (expected[account].cashAccountFor) {
					accountIndexView.goToCashAccount(expected[account].cashAccountFor);
				} else {
					accountIndexView.goToAccount(account);
				}

				browser.wait(protractor.ExpectedConditions.presenceOf(transactionIndexView.table.row(0)), 3000, "Timeout waiting for view to render");
			});

			it("should display the context name", () => transactionIndexView.heading().should.eventually.equal(account));

			it("should display a row for each transaction", () => {
				// Number of rows
				transactionIndexView.table.rows.count().should.eventually.equal(expected[account].transactions.length);

				transactionIndexView.table.rows.each((row, index) => transactionIndexView.checkRowValues(row, expected[account].transactions[index]));
			});

			describe("subtransactions", () => {
				let splits;

				beforeEach(() => {
					splits = [];

					transactionIndexView.table.rows.each((row, index) => {
						if (expected[account].transactions[index].subtransactions) {
							// Show subtransactions
							transactionIndexView.toggleSubtransactionsButton(row).click();

							// Need to artificially wait for 350ms because bootstrap collapse has a fade transition
							browser.sleep(350);

							splits.push({index, row});
						}
					});
				});

				it("should display the subtransactions", () => splits.forEach(split => transactionIndexView.subtransactions(split.row).each((subrow, subindex) => transactionIndexView.checkSubtransactionRowValues(subrow, expected[account].transactions[split.index].subtransactions[subindex]))));

				it("should hide the subtransactions", () => splits.forEach(split => {
					transactionIndexView.table.clickRow(split.index);

					// Need to artificially wait for 350ms to allow for the table to scroll
					browser.sleep(350);

					transactionIndexView.toggleSubtransactionsButton(split.row).click();
					transactionIndexView.subtransactions(split.row).get(0).isDisplayed().should.eventually.be.false;
				}));
			});

			it("should display the closing balance", () => transactionIndexView.closingBalance().should.eventually.equal(expected[account].closingBalance));

			if (expected[account].behavesLikeNavigableTable) {
				transactionIndexView.table.behavesLikeNavigableTable();
			}
		});
	});
});
