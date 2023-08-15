import {
	cancelButton,
	deleteButton,
	payeeDeleteForm,
	payeeDeleteHeading,
	payeeToDelete
} from "~/support/payees/delete";
import {
	checkRowMatches,
	getValuesFrom,
	payeesTableRows
} from "~/support/payees/index";
import type { Payee } from "~/support/payees/types";

describe("Payee Delete", (): void => {
	let	originalRowCount: number,
			lastPayee: Payee,
			secondLastPayee: Payee;

	before((): void => cy.createPayees());

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/payees");
		cy.get(payeesTableRows).then((rows: JQuery<HTMLTableRowElement>): void => {
			originalRowCount = rows.length;
			lastPayee = getValuesFrom(rows.last());
			secondLastPayee = getValuesFrom(rows.last().prev());
		});
	});

	describe("deleting a payee", (): void => {
		beforeEach((): void => {
			cy.get(payeesTableRows).eq(originalRowCount - 1).click();
			cy.get("body").type("{del}");
			cy.get(payeeDeleteHeading).should("have.text", "Delete Payee?");
		});

		it("should display the details of the payee being deleted", (): Cypress.Chainable<JQuery> => cy.get(payeeToDelete).should("have.text", lastPayee.name));

		it("should not save changes when the cancel button is clicked", (): void => {
			cy.get(cancelButton).click();
			cy.get(payeeDeleteForm).should("not.exist");

			// Row count should not have changed
			cy.get(payeesTableRows).should("have.length", originalRowCount);

			// Payee in the last row should not have changed
			cy.get(payeesTableRows).last().within((): void => checkRowMatches(lastPayee));
		});

		it("should delete an existing payee when the delete button is clicked", (): void => {
			cy.get(deleteButton).click();
			cy.get(payeeDeleteForm).should("not.exist");

			// Row count should have decremented by one
			cy.get(payeesTableRows).should("have.length", originalRowCount - 1);

			// Payee previously in the 2nd last row should now be in the last row
			cy.get(payeesTableRows).last().within((): void => checkRowMatches(secondLastPayee));
		});

		// MISSING - error message should display when present
	});
});
