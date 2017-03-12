describe("accountIndexView", () => {
	let	accountIndexView,
			expected;

	beforeEach(() => {
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
						{name: "loan account 9", closingBalance: "-$1,000.00"}
					],
					total: "-$1,000.00"
				}
			],
			total: "Total: $4,997.00"
		};

		// Go to the account index page
		browser.get("/#!/accounts");
		browser.wait(protractor.ExpectedConditions.presenceOf(accountIndexView.total), 3000, "Timeout waiting for view to render");
	});

	it("should display a table for each account type", () => {
		// Number of tables
		accountIndexView.accountTypeTables.count().should.eventually.equal(expected.accountTypes.length);

		accountIndexView.accountTypeTables.each((table, index) => accountIndexView.accountTypeTableHeading(table).should.eventually.equal(expected.accountTypes[index].heading));
	});

	it("should display a row for each account", () => {
		accountIndexView.accountTypeTables.each((table, accountTypeIndex) => {
			const accountType = expected.accountTypes[accountTypeIndex];

			// Number of rows
			accountIndexView.accountTypeAccounts(table).count().should.eventually.equal(accountType.accounts.length);

			accountIndexView.accountTypeAccounts(table).each((row, accountIndex) => {
				const account = accountType.accounts[accountIndex];

				// Account name
				accountIndexView.accountName(row).should.eventually.equal(account.name);

				// Closing balance
				accountIndexView.accountClosingBalance(row).should.eventually.equal(account.closingBalance);
			});
		});
	});

	it("should display a related cash account link for investment accounts", () => {
		const investmentAccountsTable = accountIndexView.accountTypeTables.get(3);

		accountIndexView.accountTypeAccounts(investmentAccountsTable).each(row => accountIndexView.cashAccountLink(row).isPresent().should.eventually.be.true);
	});

	it("should display a total for each account type table", () => {
		accountIndexView.accountTypeTables.each((table, index) => accountIndexView.accountTypeTableTotal(table).should.eventually.equal(expected.accountTypes[index].total));
	});

	it("should display a total for all account types", () => accountIndexView.total.should.eventually.equal(expected.total));

	it("should indicate any accounts that are closed", () => accountIndexView.closedAccounts.count().should.eventually.equal(1));

	it("should indicate any negative balances", () => accountIndexView.negativeBalances.count().should.eventually.equal(2));
});
