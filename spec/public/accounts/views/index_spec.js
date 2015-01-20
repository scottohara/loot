(function() {
	"use strict";

	/*jshint expr: true */

	describe("accountIndexView", function() {
		var accountIndexView,
				expected;

		beforeEach(function() {
			accountIndexView = require("./index");

			expected = {
				accountTypes: [
					{
						heading: "Bank accounts",
						accounts: [
							{name: "bank account 1", closingBalance: "$998.00"},
							{name: "bank account 2", closingBalance: "$1,001.00"}
						],
						total: "$1,999.00"
					},
					{
						heading: "Cash accounts",
						accounts: [
							{name: "cash account 3", closingBalance: "$2,000.00"}
						],
						total: "$2,000.00"
					},
					{
						heading: "Credit accounts",
						accounts: [
							{name: "credit account 4", closingBalance: "$0.00"}
						],
						total: "$0.00"
					},
					{
						heading: "Investment accounts",
						accounts: [
							{name: "investment account 5", closingBalance: "$988.00"},
							{name: "investment account 7", closingBalance: "$1,010.00"}
						],
						total: "$1,998.00"
					},
					{
						heading: "Loan accounts",
						accounts: [
							{name: "loan account 9", closingBalance: "($1,000.00)"}
						],
						total: "($1,000.00)"
					}
				],
				total: "Total: $4,997.00"
			};

			// Go to the account index page
			browser.get("/index.html#/accounts");
			browser.wait(protractor.ExpectedConditions.presenceOf(accountIndexView.total), 3000, "Timeout waiting for view to render");
		});

		it("should display a table for each account type", function() {
			// Number of tables
			accountIndexView.accountTypeTables.count().should.eventually.equal(expected.accountTypes.length);

			accountIndexView.accountTypeTables.each(function(table, index) {
				// Table heading
				accountIndexView.accountTypeTableHeading(table).should.eventually.equal(expected.accountTypes[index].heading);
			});
		});

		it("should display a row for each account", function() {
			accountIndexView.accountTypeTables.each(function(table, accountTypeIndex) {
				var accountType = expected.accountTypes[accountTypeIndex];

				// Number of rows
				accountIndexView.accountTypeAccounts(table).count().should.eventually.equal(accountType.accounts.length);

				accountIndexView.accountTypeAccounts(table).each(function(row, accountIndex) {
					var account = accountType.accounts[accountIndex];

					// Account name
					accountIndexView.accountName(row).should.eventually.equal(account.name);

					// Closing balance
					accountIndexView.accountClosingBalance(row).should.eventually.equal(account.closingBalance);
				});
			});
		});

		it("should display a related cash account link for investment accounts", function() {
			var investmentAccountsTable = accountIndexView.accountTypeTables.get(3);
			accountIndexView.accountTypeAccounts(investmentAccountsTable).each(function(row) {
				accountIndexView.cashAccountLink(row).isPresent().should.eventually.be.true;
			});
		});

		it("should display a total for each account type table", function() {
			accountIndexView.accountTypeTables.each(function(table, index) {
				// Total
				accountIndexView.accountTypeTableTotal(table).should.eventually.equal(expected.accountTypes[index].total);
			});
		});

		it("should display a total for all account types", function() {
			accountIndexView.total.should.eventually.equal(expected.total);
		});

		it("should indicate any accounts that are closed", function() {
			accountIndexView.closedAccounts.count().should.eventually.equal(1);
		});

		it("should indicate any negative balances", function() {
			accountIndexView.negativeBalances.count().should.eventually.equal(2);
		});
	});
})();
