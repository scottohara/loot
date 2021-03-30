import {
	checkRowMatches,
	editButton,
	favouriteButton,
	negativeAmountTableRows,
	noHoldingsTableRows,
	securitiesTableRows,
	securityTotalValue,
	unusedTableRows
} from "securities/index";
import {
	securityDeleteForm,
	securityDeleteHeading
} from "securities/delete";
import {
	securityEditForm,
	securityEditHeading
} from "securities/edit";
import {
	transactionsIndexHeading,
	transactionsTable
} from "transactions";
import { Security } from "securities/types";
import { testNavigableTable } from "og-components/og-table-navigable";

describe("Security Index", (): void => {
	let expected: Security[],
			expectedTotal: string;

	before((): void => {
		expected = [
			{
				name: "Security 1",
				code: "A",
				holding: "2.000",
				balance: "$2.00"
			},
			{
				name: "Security 2",
				code: "B",
				holding: "-1.000",
				balance: "-$1.00",
				favourite: true
			}
		];

		for (let i = 3; i <= 20; i++) {
			expected.push({
				name: `Security ${i}`,
				code: String.fromCharCode(64 + i),
				holding: "0.000",
				balance: "$0.00",
				unused: true
			});
		}
		expected = expected.sort((a: Security, b: Security): number => {
			if (a.unused === b.unused) {
				return a.name.localeCompare(b.name);
			}

			return Number(a.unused) - Number(b.unused);
		});

		expectedTotal = "Total: $1.00";
		cy.createSecurities();
	});

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/securities");
	});

	it("should display a row for each security", (): void => {
		// Number of rows
		cy.get(securitiesTableRows).should("have.length", expected.length);

		cy.get(securitiesTableRows).each((row: HTMLTableRowElement, index: number): void => {
			cy.wrap(row).within((): void => checkRowMatches(expected[index]));
		});
	});

	it("should toggle the favourite status of a security", (): void => {
		cy.get(securitiesTableRows).first().within((): void => {
			cy.get(favouriteButton).should("not.have.class", "active");
			cy.get(favouriteButton).click();
			cy.get(favouriteButton).should("have.class", "active");
			cy.get(favouriteButton).click();
			cy.get(favouriteButton).should("not.have.class", "active");
		});
	});

	it("should indicate any securities with no current holdings", (): Cypress.Chainable<JQuery> => cy.get(noHoldingsTableRows).should("have.length", 19));

	it("should indicate any unused securities", (): Cypress.Chainable<JQuery> => cy.get(unusedTableRows).should("have.length", 18));

	it("should indicate any negative amounts", (): Cypress.Chainable<JQuery> => cy.get(negativeAmountTableRows).should("have.length", 0));

	it("should display a total for all securities", (): Cypress.Chainable<JQuery> => cy.get(securityTotalValue).should("have.text", expectedTotal));

	testNavigableTable({
		rows: securitiesTableRows,
		actions: {
			insert: {
				heading: securityEditHeading,
				headingText: "Add Security",
				view: securityEditForm
			},
			edit: {
				heading: securityEditHeading,
				headingText: "Edit Security",
				view: securityEditForm,
				mouseAction: {
					name: "edit icon is clicked",
					perform: (row: number): Cypress.Chainable<JQuery> => cy.get(securitiesTableRows).eq(row).within((): void => {
						cy.get(editButton).click();
					})
				}
			},
			del: {
				heading: securityDeleteHeading,
				headingText: "Delete Security?",
				view: securityDeleteForm
			},
			select: {
				heading: transactionsIndexHeading,
				headingText: "Security 9",
				headingText2: " Transactions",
				view: transactionsTable,
				url: /#!\/securities\/\d+\/transactions/u
			}
		}
	});
});