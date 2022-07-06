import {
	checkRowMatches,
	editButton,
	favouriteButton,
	payeesTableRows
} from "payees/index";
import {
	payeeDeleteForm,
	payeeDeleteHeading
} from "payees/delete";
import {
	payeeEditForm,
	payeeEditHeading
} from "payees/edit";
import {
	transactionsIndexHeading,
	transactionsTable
} from "transactions/index";
import type { Payee } from "payees/types";
import { testNavigableTable } from "og-components/og-table-navigable";

describe("Payee Index", (): void => {
	let expected: Payee[];

	before((): void => {
		expected = [];
		for (let i = 1; i <= 19; i++) {
			expected.push({ name: `Payee ${i}`, favourite: false });
		}
		expected.push({ name: "Payee 20", favourite: true });
		expected = expected.sort((a: Payee, b: Payee): number => a.name.localeCompare(b.name));

		cy.createPayees();
	});

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/payees");
	});

	it("should display a row for each payee", (): void => {
		// Number of rows
		cy.get(payeesTableRows).should("have.length", expected.length);

		cy.get(payeesTableRows).each((row: HTMLTableRowElement, index: number): void => {
			cy.wrap(row).within((): void => checkRowMatches(expected[index]));
		});
	});

	it("should toggle the favourite status of a payee", (): void => {
		cy.get(payeesTableRows).first().within((): void => {
			cy.get(favouriteButton).should("not.have.class", "active");
			cy.get(favouriteButton).click();
			cy.get(favouriteButton).should("have.class", "active");
			cy.get(favouriteButton).click();
			cy.get(favouriteButton).should("not.have.class", "active");
		});
	});

	testNavigableTable({
		rows: payeesTableRows,
		actions: {
			insert: {
				heading: payeeEditHeading,
				headingText: "Add Payee",
				view: payeeEditForm
			},
			edit: {
				heading: payeeEditHeading,
				headingText: "Edit Payee",
				view: payeeEditForm,
				mouseAction: {
					name: "edit icon is clicked",
					perform: (row: number): Cypress.Chainable<JQuery> => cy.get(payeesTableRows).eq(row).within((): void => {
						cy.get(editButton).click();
					})
				}
			},
			del: {
				heading: payeeDeleteHeading,
				headingText: "Delete Payee?",
				view: payeeDeleteForm
			},
			select: {
				heading: transactionsIndexHeading,
				headingText: "Payee 9",
				headingText2: " Transactions",
				view: transactionsTable,
				url: /#!\/payees\/\d+\/transactions/u
			}
		}
	});
});