import {
	cancelButton,
	deleteButton,
	securityDeleteForm,
	securityDeleteHeading,
	securityToDeleteCode,
	securityToDeleteName
} from "securities/delete";
import {
	checkRowMatches,
	getValuesFrom,
	securitiesTableRows
} from "securities/index";
import { Security } from "securities/types";

describe("Security Delete", (): void => {
	let	originalRowCount: number,
			lastSecurity: Security,
			secondLastSecurity: Security;

	before((): void => cy.createSecurities());

	beforeEach((): void => {
		cy.login();
		cy.visit("/#!/securities");
		cy.get(securitiesTableRows).then((rows: JQuery<HTMLTableRowElement>): void => {
			originalRowCount = rows.length;
			lastSecurity = getValuesFrom(rows.last());
			secondLastSecurity = getValuesFrom(rows.last().prev());
		});
	});

	describe("deleting a security", (): void => {
		beforeEach((): void => {
			cy.get(securitiesTableRows).eq(originalRowCount - 1).click();
			cy.get("body").type("{del}");
			cy.get(securityDeleteHeading).should("have.text", "Delete Security?");
		});

		it("should display the details of the security being deleted", (): void => {
			cy.get(securityToDeleteName).should("have.text", lastSecurity.name.replace(/\s+No transactions/u, ""));
			cy.get(securityToDeleteCode).should("have.text", lastSecurity.code);
		});

		it("should not save changes when the cancel button is clicked", (): void => {
			cy.get(cancelButton).click();
			cy.get(securityDeleteForm).should("not.exist");

			// Row count should not have changed
			cy.get(securitiesTableRows).should("have.length", originalRowCount);

			// Security in the last row should not have changed
			cy.get(securitiesTableRows).last().within((): void => checkRowMatches(lastSecurity));
		});

		it("should delete an existing security when the delete button is clicked", (): void => {
			cy.get(deleteButton).click();
			cy.get(securityDeleteForm).should("not.exist");

			// Row count should have decremented by one
			cy.get(securitiesTableRows).should("have.length", originalRowCount - 1);

			// Security previously in the 2nd last row should now be in the last row
			cy.get(securitiesTableRows).last().within((): void => checkRowMatches(secondLastSecurity));
		});

		// MISSING - error message should display when present
	});
});