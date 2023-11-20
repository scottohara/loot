import type { Account, AccountType } from "~/support/accounts/types";
import {
	accountDeleteForm,
	accountDeleteHeading,
} from "~/support/accounts/delete";
import { accountEditForm, accountEditHeading } from "~/support/accounts/edit";
import {
	accountName,
	accountType,
	accountTypeTables,
	accountsTableRows,
	accountsTableTotals,
	accountsTotal,
	checkRowMatches,
	closedAccountTableRows,
	deleteButton,
	editButton,
	favouriteButton,
	investmentAccountsTableRows,
	linkedCashAccount,
	negativeBalanceTableRows,
	negativeTableTotals,
	negativeTotal,
} from "~/support/accounts/index";
import {
	transactionsIndexHeading,
	transactionsTable,
} from "~/support/transactions";

describe("Account Index", (): void => {
	let expected: { accountTypes: AccountType[]; total: string },
		allAccounts: Account[];

	before((): void => {
		expected = {
			accountTypes: [
				{
					heading: "Bank accounts",
					accounts: [
						{ name: "bank account 1", closingBalance: "$500.00" },
						{
							name: "bank account 2",
							closingBalance: "$1,000.00",
							favourite: true,
						},
					],
					total: "$1,500.00",
				},
				{
					heading: "Cash accounts",
					accounts: [{ name: "cash account 3", closingBalance: "$2,000.00" }],
					total: "$2,000.00",
				},
				{
					heading: "Credit accounts",
					accounts: [{ name: "credit account 4", closingBalance: "$0.00" }],
					total: "$0.00",
				},
				{
					heading: "Investment accounts",
					accounts: [
						{ name: "investment account 5", closingBalance: "$1,000.00" },
						{ name: "investment account 7", closingBalance: "$1,000.00" },
					],
					total: "$2,000.00",
				},
				{
					heading: "Loan accounts",
					accounts: [{ name: "loan account 9", closingBalance: "-$1,000.00" }],
					total: "-$1,000.00",
				},
			],
			total: "Total: $4,500.00",
		};

		allAccounts = expected.accountTypes
			.map((type: AccountType): Account[] => type.accounts)
			.flat();
		cy.createAccounts();
	});

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/accounts");
	});

	it("should display a table for each account type", (): void => {
		// Number of tables
		cy.get(accountTypeTables).should(
			"have.length",
			expected.accountTypes.length,
		);

		cy.get(accountTypeTables).each(
			(table: HTMLTableElement, index: number): void => {
				// Account Type
				cy.wrap(table)
					.get(accountType)
					.should("contain.text", expected.accountTypes[index].heading);
			},
		);
	});

	it("should display a row for each account", (): void => {
		// Number of rows
		cy.get(accountsTableRows).should("have.length", allAccounts.length);

		cy.get(accountsTableRows).each(
			(row: HTMLTableRowElement, index: number): void => {
				cy.wrap(row).within((): void => checkRowMatches(allAccounts[index]));
			},
		);
	});

	it("should display a related cash account link for investment accounts", (): void => {
		cy.get(investmentAccountsTableRows).each(
			(row: HTMLTableRowElement): void => {
				cy.wrap(row).within((): void => {
					cy.get(linkedCashAccount).should("be.visible");
				});
			},
		);
	});

	it("should display a total for each account type table", (): void => {
		cy.get(accountsTableTotals).should(
			"have.length",
			expected.accountTypes.length,
		);
		cy.get(accountsTableTotals).each(
			(total: HTMLTableHeaderCellElement, index: number): void => {
				cy.wrap(total).should(
					"contain.text",
					expected.accountTypes[index].total,
				);
			},
		);
	});

	it("should display a total for all account types", (): Cypress.Chainable<JQuery> =>
		cy.get(accountsTotal).should("contain.text", expected.total));

	it("should indicate any accounts that are closed", (): Cypress.Chainable<JQuery> =>
		cy.get(closedAccountTableRows).should("have.length", 1));

	it("should indicate any negative balances", (): void => {
		cy.get(negativeBalanceTableRows).should("have.length", 1);
		cy.get(negativeTableTotals).should("have.length", 1);
		cy.get(negativeTotal).should("not.exist");
	});

	describe("table actions", (): void => {
		let view: string,
			heading: string,
			headingText: string,
			url: RegExp | undefined;

		describe("insert", (): void => {
			beforeEach((): void => {
				view = accountEditForm;
				heading = accountEditHeading;
				headingText = "Add Account";
				cy.get(accountsTableRows).should("be.visible");
			});

			it("should display the Add Account view when the insert key is pressed", (): Cypress.Chainable<
				JQuery<HTMLBodyElement>
			> => cy.get("body").type("{insert}"));
			it("should display the Add Account view when the CTRL+N keys are pressed", (): Cypress.Chainable<
				JQuery<HTMLBodyElement>
			> => cy.get("body").type("{ctrl}n"));
		});

		describe("edit", (): void => {
			beforeEach((): void => {
				view = accountEditForm;
				heading = accountEditHeading;
				headingText = "Edit Account";
			});

			it("should display the Edit Account view when the edit icon is clicked", (): Cypress.Chainable<JQuery> =>
				cy
					.get(accountsTableRows)
					.first()
					.within((): void => {
						cy.get(editButton).click();
					}));
		});

		describe("delete", (): void => {
			beforeEach((): void => {
				view = accountDeleteForm;
				heading = accountDeleteHeading;
				headingText = "Delete Account?";
			});

			it("should display the Delete Account view when the delete icon is clicked", (): Cypress.Chainable<JQuery> =>
				cy
					.get(accountsTableRows)
					.first()
					.within((): void => {
						cy.get(deleteButton).click();
					}));
		});

		describe("select", (): void => {
			beforeEach((): void => {
				view = transactionsTable;
				heading = transactionsIndexHeading;
				url = /#!\/accounts\/\d+\/transactions/u;
			});

			it("should display the Account Transactions view when the account name is clicked", (): void => {
				headingText = "bank account 1";

				cy.get(accountsTableRows)
					.first()
					.within((): void => {
						cy.get(accountName).click();
					});
			});

			it("should display the linked Account Transactions view when the linked cash account is clicked", (): void => {
				headingText = "bank account 6";

				cy.get(investmentAccountsTableRows)
					.first()
					.within((): void => {
						cy.get(linkedCashAccount).click();
					});
			});
		});

		afterEach((): void => {
			// The corresponding view should be displayed
			cy.get(view).should("be.visible");

			// The corresponding view heading should be displayed
			cy.get(heading).should("have.text", headingText);

			// If a URL was specified, the location hash should match
			if (undefined !== url) {
				cy.location("hash").should("match", url);
			}
		});
	});

	it("should toggle the favourite status of an account", (): void => {
		cy.get(accountsTableRows)
			.first()
			.within((): void => {
				cy.get(favouriteButton).should("not.have.class", "active");
				cy.get(favouriteButton).click();
				cy.get(favouriteButton).should("have.class", "active");
				cy.get(favouriteButton).click();
				cy.get(favouriteButton).should("not.have.class", "active");
			});
	});
});
